import { strict as assert } from "node:assert";
import { dedupeSlug, isValidSlug, slugify } from "../src/lib/slug";

assert.equal(slugify("The Dark Knight"), "the-dark-knight");
assert.equal(slugify("Game of Thrones"), "game-of-thrones");
assert.equal(slugify("Schindler's List"), "schindler-s-list");
assert.ok(isValidSlug("breaking-bad"));
assert.ok(!isValidSlug("Admin"));
assert.equal(dedupeSlug("action", new Set(["action"])), "action-2");
console.log("slug selfcheck ok");
