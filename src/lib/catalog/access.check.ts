import { contentAccessKind } from "./access";

const now = new Date("2026-10-04T12:00:00.000Z");

if (contentAccessKind({ accessTier: "free" }, now) !== "free") {
  throw new Error("permanent free access mismatch");
}
if (contentAccessKind({ accessTier: "premium", freeUntil: "2026-10-05T12:00:00.000Z" }, now) !== "temporary_free") {
  throw new Error("temporary free access mismatch");
}
if (contentAccessKind({ accessTier: "premium", freeUntil: "2026-10-03T12:00:00.000Z" }, now) !== "premium") {
  throw new Error("expired temporary access mismatch");
}

console.log("catalog.access.check ok");
