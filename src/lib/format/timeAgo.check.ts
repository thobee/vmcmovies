import assert from "node:assert/strict";
import { timeAgo } from "./timeAgo";

const out = timeAgo(new Date(Date.now() - 120_000).toISOString());
assert.match(out, /ago|Just now/);
console.log("timeAgo.check.ts ok");
