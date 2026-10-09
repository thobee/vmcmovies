// Bounded localhost-only smoke test. Never uses Atlas, real credentials or payments.
const assert = require("node:assert/strict");
const net = require("node:net");
const { spawn, spawnSync } = require("node:child_process");
const { once } = require("node:events");
const port = 3101;
const base = `http://127.0.0.1:${port}`;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let child;
let output = "";
async function request(path, options) {
  const start = performance.now();
  const response = await fetch(base + path, { ...options, signal: AbortSignal.timeout(60_000) });
  return { status: response.status, data: await response.json(), ms: performance.now() - start };
}
async function burst(count, concurrency, fn) {
  const results = [];
  let next = 0;
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (next < count) { const index = next++; results[index] = await fn(index); }
  }));
  return results;
}
(async () => {
  const probe = net.createServer();
  probe.listen(port, "127.0.0.1");
  await once(probe, "listening");
  await new Promise(resolve => probe.close(resolve));
  child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--port", String(port), "--hostname", "127.0.0.1"], {
    windowsHide: true,
    env: { ...process.env, NODE_ENV: "development", MONGODB_URI: "", VMC_LOCAL_SMOKE: "1", NEXT_TELEMETRY_DISABLED: "1" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  for (const stream of [child.stdout, child.stderr]) stream.on("data", data => { output = (output + data).slice(-8000); });
  const deadline = Date.now() + 120_000;
  while (!output.includes("Ready in")) {
    if (child.exitCode !== null || Date.now() > deadline) throw new Error("Local server did not become ready");
    await delay(500);
  }
  // Warm compilation separately from the measured burst and rate-limit identity.
  assert.equal((await request("/api/catalog/search?q=movie", { headers: { "x-forwarded-for": "127.0.0.2" } })).status, 200);
  const results = await burst(45, 4, () => request("/api/catalog/search?q=movie"));
  assert.equal(results.filter(r => r.status === 200).length, 40);
  assert.equal(results.filter(r => r.status === 429).length, 5);
  for (const result of results.filter(r => r.status === 200)) {
    assert.ok(Array.isArray(result.data.items));
    assert.doesNotMatch(JSON.stringify(result.data), /telegramFileId|telegramMessageId|telegramUrl/);
  }
  const times = results.filter(r => r.status === 200).map(r => r.ms).sort((a, b) => a - b);
  console.log(`Local search burst: 45 requests, concurrency 4, 40 OK, 5 correctly throttled; p50=${Math.round(times[19])}ms p95=${Math.round(times[37])}ms`);
  const login = await burst(10, 2, () => request("/api/auth/login", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: "{}",
  }));
  assert.equal(login.filter(r => r.status === 400).length, 8);
  assert.equal(login.filter(r => r.status === 429).length, 2);
  console.log("Local login burst: 8 invalid payloads rejected and 2 excess requests throttled; no accounts accessed.");
  console.log("Development/mock-data smoke test only, not a production capacity benchmark.");
})().catch(error => {
  console.error(error.message);
  console.error(output);
  process.exitCode = 1;
}).finally(async () => {
  if (child && child.exitCode === null) {
    if (process.platform === "win32") spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { windowsHide: true });
    else child.kill("SIGTERM");
    await once(child, "exit");
  }
});
