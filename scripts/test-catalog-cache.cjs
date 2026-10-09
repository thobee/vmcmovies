const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const cache = new Map();
const counts = {};
let failSearch = false;
const item = { id: "sample", title: "Sample", type: "movie", genres: ["Drama"] };
const db = Object.fromEntries([
  "dbGetAllContent", "dbGetFeaturedContent", "dbGetMovieBySlugOrId", "dbGetMovies",
  "dbGetSeriesBySlugOrId", "dbGetSeriesList", "dbSearchContent",
].map(name => [name, async () => {
  counts[name] = (counts[name] ?? 0) + 1;
  if (name === "dbSearchContent" && failSearch) throw new Error("Database unavailable");
  return /Featured|BySlug/.test(name) ? item : [item];
}]));
const source = ts.transpileModule(fs.readFileSync("src/lib/catalog/index.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const context = {
  exports: {}, process: { env: { NODE_ENV: "production", MONGODB_URI: "test" } }, console,
  require: name => {
    if (name === "@/lib/catalog/db") return db;
    if (name === "./cache") return { CATALOG_CACHE_TAG: "public-catalog" };
    if (name === "next/cache") return { unstable_cache: (fn, keys, options) => {
      assert.equal(options.revalidate, 30);
      assert.equal(options.tags[0], "public-catalog");
      return async (...args) => {
        const key = JSON.stringify([keys, args]);
        if (!cache.has(key)) cache.set(key, fn(...args).catch(error => { cache.delete(key); throw error; }));
        return cache.get(key);
      };
    } };
    return {};
  },
};
vm.runInNewContext(source, context);
(async () => {
  const api = context.exports;
  for (const fn of [api.getMovies, api.getSeriesList, api.getAllContent, api.getFeaturedContent]) {
    await fn(); await fn();
  }
  for (const name of ["dbGetMovies", "dbGetSeriesList", "dbGetAllContent", "dbGetFeaturedContent"]) assert.equal(counts[name], 1);
  await api.getMovies({ genre: "Drama" });
  await api.getMovies({ genre: "Action" });
  assert.equal(counts.dbGetMovies, 3, "Filter arguments must have separate cache entries");
  await api.searchContent("  SAMPLE "); await api.searchContent("sample");
  assert.equal(counts.dbSearchContent, 1);
  await api.getMovieBySlugOrId("sample"); await api.getMovieBySlugOrId("sample");
  assert.equal(counts.dbGetMovieBySlugOrId, 2, "Detail/access reads must remain uncached");
  cache.clear();
  failSearch = true;
  await assert.rejects(api.searchContent("sample"));
  failSearch = false;
  assert.equal((await api.searchContent("sample")).length, 1);
  console.log("Catalogue cache contract checks passed: 30s TTL, shared tags, filter isolation, normalized search, uncached details and outage propagation.");
})().catch(error => { console.error(error); process.exitCode = 1; });
