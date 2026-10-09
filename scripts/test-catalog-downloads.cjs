const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

// Load the project's TypeScript modules without adding a test runtime dependency.
const resolve = Module._resolveFilename;
Module._resolveFilename = function (name, ...args) {
  return resolve.call(this, name.startsWith("@/") ? path.join(__dirname, "../src", name.slice(2)) : name, ...args);
};
const loadTypeScript = (module, filename) => {
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  });
  module._compile(output.outputText, filename);
};
require.extensions[".ts"] = loadTypeScript;
require.extensions[".tsx"] = loadTypeScript;
const { contentInputSchema } = require("../src/lib/admin/validation.ts");
const { inputToContent } = require("../src/lib/admin/content.ts");
const { normalizeSeries } = require("../src/lib/catalog/series.ts");
const { toPublicContent } = require("../src/lib/catalog/public.ts");
const base = {
  id: "test-series", slug: "test-series", title: "Test series", description: "Test",
  posterImageUrl: "https://example.com/poster.jpg", genres: ["Drama"], accessTier: "premium",
};
const link = "https://t.me/testbot?start=private";
const input = {
  ...base, type: "series", seriesStatus: "ongoing",
  seasons: [{ seasonNumber: 1, downloadUrl: "", zipUrl: link, episodes: [
    { episodeNumber: 2, title: "Second", downloadUrl: link },
    { episodeNumber: 1, downloadUrl: link },
  ] }],
  additionalFiles: [{ label: "Subtitles ZIP", downloadUrl: link, quality: "1080p", fileSize: "2 MB" }],
};
const content = normalizeSeries(inputToContent(contentInputSchema.parse(input)));
assert.equal(content.seriesStatus, "ongoing");
assert.equal(content.seasons[0].episodes[0].episodeNumber, 1);
assert.equal(content.seasons[0].zipUrl, link);
assert.equal(content.additionalFiles[0].fileSize, "2 MB");
const publicContent = toPublicContent(content);
assert.ok(!JSON.stringify(publicContent).includes(link));
assert.equal(publicContent.seasons[0].episodes.length, 2);
assert.ok(contentInputSchema.safeParse({ ...input, seasons: [{ seasonNumber: 1, episodes: [{ episodeNumber: 1, downloadUrl: link }] }] }).success);
assert.ok(contentInputSchema.safeParse({ ...input, seasons: [{ seasonNumber: 1, zipUrl: link }] }).success);
assert.ok(contentInputSchema.safeParse({ ...input, seasons: [{ seasonNumber: 1, downloadUrl: link }] }).success);
assert.ok(!contentInputSchema.safeParse({ ...input, seasons: [{ seasonNumber: 1 }] }).success);
assert.ok(!contentInputSchema.safeParse({ ...input, seasons: [input.seasons[0], input.seasons[0]] }).success);
assert.ok(!contentInputSchema.safeParse({ ...input, seasons: [{ seasonNumber: 1, episodes: [
  { episodeNumber: 1, downloadUrl: link }, { episodeNumber: 1, downloadUrl: link },
] }] }).success);
assert.ok(!contentInputSchema.safeParse({ ...input, additionalFiles: [{ label: "Bad", downloadUrl: "https://evil.example/file" }] }).success);
const movie = inputToContent(contentInputSchema.parse({ ...base, type: "movie", downloadUrl: link, additionalFiles: input.additionalFiles }));
assert.equal(movie.additionalFiles.length, 1);
assert.ok(!JSON.stringify(toPublicContent(movie)).includes(link));
assert.deepEqual(inputToContent(contentInputSchema.parse({ ...input, additionalFiles: [], seasons: [{ seasonNumber: 1, downloadUrl: link, episodes: [] }] })).additionalFiles, []);
console.log("Catalog download checks passed: legacy links, episode-only/ZIP-only seasons, ordering, validation, and public link redaction.");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { AdditionalFilesFields, SeasonFilesFields } = require("../src/components/admin/DownloadFields.tsx");
const filesMarkup = renderToStaticMarkup(React.createElement(AdditionalFilesFields, { files: input.additionalFiles, onChange() {} }));
assert.ok(filesMarkup.includes("Subtitles ZIP"));
assert.ok(filesMarkup.includes("Add file link"));
const seasonMarkup = renderToStaticMarkup(React.createElement(SeasonFilesFields, { season: input.seasons[0], onChange() {} }));
assert.ok(seasonMarkup.includes("Full season ZIP"));
assert.ok(seasonMarkup.includes("Episode 2"));
assert.ok(seasonMarkup.includes("Add episode"));
console.log("Admin download field rendering checks passed.");
const completedSeason = {
  seasonNumber: 1, status: "ongoing", downloadUrl: "",
  episodes: [
    { episodeNumber: 1, downloadUrl: link },
    { episodeNumber: 2, downloadUrl: link, isFinal: true },
  ],
};
const savedFinale = normalizeSeries(inputToContent(contentInputSchema.parse({
  ...input, seasons: [completedSeason, { seasonNumber: 2, status: "ongoing", downloadUrl: link }],
})));
assert.equal(savedFinale.seasons[0].status, "completed");
assert.equal(savedFinale.seasons[1].status, "ongoing");
assert.equal(savedFinale.seriesStatus, "ongoing");
assert.equal(toPublicContent(savedFinale).seasons[0].status, "completed");
assert.equal(savedFinale.seasons[0].episodes[1].isFinal, true);
assert.ok(!contentInputSchema.safeParse({ ...input, seasons: [{
  ...completedSeason, episodes: [{ episodeNumber: 2, downloadUrl: link, isFinal: true }],
}] }).success, "A missing episode must prevent auto-completion");
assert.ok(!contentInputSchema.safeParse({ ...input, seasons: [{
  ...completedSeason, episodes: [
    { episodeNumber: 1, downloadUrl: link, isFinal: true }, { episodeNumber: 2, downloadUrl: link },
  ],
}] }).success, "Finale must be last episode");
assert.ok(!contentInputSchema.safeParse({ ...input, seasons: [{
  ...completedSeason, episodes: completedSeason.episodes.map(ep => ({ ...ep, isFinal: true })),
}] }).success, "Only one finale is allowed");
assert.ok(contentInputSchema.safeParse({ ...input, seasons: [{ ...completedSeason, zipUrl: link, episodes: [{ episodeNumber: 2, downloadUrl: link, isFinal: true }] }] }).success);
assert.equal(inputToContent(contentInputSchema.parse({
  ...input, seasons: [{ seasonNumber: 1, status: "completed", downloadUrl: link }],
})).seasons[0].status, "completed");
assert.ok(renderToStaticMarkup(React.createElement(SeasonFilesFields, { season: completedSeason, onChange() {} })).includes("This is the final episode"));
console.log("Per-season completion checks passed: finale validation, manual status, persistence, and independent series status.");
