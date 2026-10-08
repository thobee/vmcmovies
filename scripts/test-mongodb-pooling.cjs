const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

const source = ts.transpileModule(fs.readFileSync("src/lib/db/mongodb.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

async function check(environment) {
  let created = 0;
  let closed = 0;
  let fail = false;
  const clients = [];
  class FakeClient {
    constructor(uri, options) {
      created++;
      this.options = options;
      clients.push(this);
    }
    async connect() {
      if (fail) throw new Error("Connection failed");
      return this;
    }
    async close() { closed++; }
    db(name) { return { name, client: this }; }
  }
  const shared = {};
  const load = () => {
    const context = {
      exports: {}, global: shared, console,
      process: { env: { NODE_ENV: environment, MONGODB_URI: "mongodb://test", MONGODB_DB_NAME: "testdb" } },
      require: () => ({ MongoClient: FakeClient }),
    };
    vm.runInNewContext(source, context);
    return context.exports;
  };
  const api = load();
  const databases = await Promise.all(Array.from({ length: 40 }, () => api.getDb()));
  assert.equal(created, 1);
  assert.ok(databases.every(db => db.client === clients[0] && db.name === "testdb"));
  await load().getDb();
  assert.equal(created, 1, "Module reloads must reuse the client");
  assert.equal(clients[0].options.maxPoolSize, 5);
  assert.equal(clients[0].options.minPoolSize, 0);
  shared._mongoClientPromise = undefined;
  fail = true;
  const failures = await Promise.allSettled([api.getDb(), api.getDb()]);
  assert.ok(failures.every(result => result.status === "rejected"));
  assert.equal(created, 2);
  assert.equal(closed, 1);
  assert.equal(shared._mongoClientPromise, undefined);
  fail = false;
  await api.getDb();
  assert.equal(created, 3, "Failed connections must allow a fresh attempt");
}

(async () => {
  await check("production");
  await check("development");
  console.log("MongoDB pooling checks passed: concurrent reuse, module reloads, pool limits, failure cleanup, and retry.");
})().catch(error => { console.error(error); process.exitCode = 1; });
