import assert from "node:assert/strict";
import { sortByNewest, sortByRating } from "./homepage";

const items = [
  {
    id: "a",
    slug: "a",
    type: "movie" as const,
    title: "A",
    description: "",
    posterImageUrl: "",
    genres: [],
    createdAt: "2024-01-01",
    rating: "7.0",
  },
  {
    id: "b",
    slug: "b",
    type: "movie" as const,
    title: "B",
    description: "",
    posterImageUrl: "",
    genres: [],
    createdAt: "2025-01-01",
    rating: "9.2",
  },
];

assert.equal(sortByNewest(items)[0]?.id, "b");
assert.equal(sortByRating(items)[0]?.id, "b");
console.log("homepage.check.ts ok");
