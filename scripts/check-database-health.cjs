// Read-only check: no documents, secrets or connection strings are printed.
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
require("@next/env").loadEnvConfig(process.cwd());
const shared = {};
const context = { exports: {}, global: shared, process, console, require };
vm.runInNewContext(ts.transpileModule(fs.readFileSync("src/lib/db/mongodb.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, context);

(async () => {
  try {
    const db = await context.exports.getDb();
    const started = performance.now();
    await db.command({ ping: 1 });
    console.log(`Database ping: OK (${Math.round(performance.now() - started)}ms)`);
    const indexes = await db.collection("content").listIndexes().toArray();
    console.log("Catalogue indexes:", indexes.map(({ name, key, unique }) => ({ name, key, unique: Boolean(unique) })));
    console.log("Catalogue documents:", await db.collection("content").estimatedDocumentCount());
    try {
      const status = await db.admin().command({ serverStatus: 1 });
      console.log("Server connections:", status.connections);
    } catch {
      console.log("Server connection metrics unavailable to this database account; verify in Atlas.");
    }
  } finally {
    if (shared._mongoClientPromise) await (await shared._mongoClientPromise).close();
  }
})().catch(error => {
  console.error("Database health check failed:", error.name, error.code ?? "");
  process.exitCode = 1;
});
