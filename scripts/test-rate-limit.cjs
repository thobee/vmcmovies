const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const source = ts.transpileModule(fs.readFileSync("src/lib/security/rate-limit.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const rows = new Map();
let now = 1000;
let unavailable = false;
let duplicate = false;
let indexCalls = 0;
const col = {
  async createIndex(key, options) {
    assert.equal(key.expiresAt, 1);
    assert.equal(options.expireAfterSeconds, 0);
    indexCalls++;
    return "ttl";
  },
  async findOneAndUpdate({ _id }, update, options) {
    if (unavailable) throw new Error("Unavailable");
    if (duplicate && options.upsert) { duplicate = false; throw { code: 11000 }; }
    assert.match(_id, /^[a-f0-9]{64}$/);
    const row = rows.get(_id) ?? { n: 0, expiresAt: update.$setOnInsert.expiresAt };
    row.n++;
    rows.set(_id, row);
    return { ...row };
  },
};
function load(env = { NODE_ENV: "production", MONGODB_URI: "test" }) {
  const context = {
    exports: {}, process: { env }, console,
    Date: class extends Date { static now() { return now; } },
    require: name => name === "@/lib/db/mongodb"
      ? { getDb: async () => ({ collection: () => col }) } : require(name),
  };
  vm.runInNewContext(source, context);
  return context.exports;
}
(async () => {
  const first = load();
  const second = load();
  const results = await Promise.all(Array.from({ length: 100 }, (_, i) =>
    (i % 2 ? first : second).rateLimited("login:private-ip", 8, 60_000)));
  assert.equal(results.filter(limited => !limited).length, 8, "Instances must share the same allowance");
  assert.equal(indexCalls, 2, "Concurrent requests initialize one index promise per instance");
  now = 60_000;
  assert.equal(await first.rateLimited("login:private-ip", 8, 60_000), false);
  duplicate = true;
  assert.equal(await first.rateLimited("race", 2), false);
  unavailable = true;
  await assert.rejects(first.rateLimited("failure", 2));
  await assert.rejects(load({ NODE_ENV: "production" }).rateLimited("missing-db", 2));
  const local = load({ NODE_ENV: "development" });
  assert.equal(await local.rateLimited("local", 1, 100), false);
  assert.equal(await local.rateLimited("local", 1, 100), true);
  now += 100;
  assert.equal(await local.rateLimited("local", 1, 100), false);
  console.log("Rate limit checks passed: 100 concurrent requests across two instances, expiration, duplicate retry, hashed keys, TTL and fail-closed behavior.");
})().catch(error => { console.error(error); process.exitCode = 1; });
