import assert from "node:assert/strict";
import { honeypotTripped } from "./honeypot";
import { rateLimited } from "./rate-limit";

assert.equal(honeypotTripped({}), false);
assert.equal(honeypotTripped({ website: "" }), false);
assert.equal(honeypotTripped({ website: "http://spam" }), true);

const key = `check:${Date.now()}`;
assert.equal(await rateLimited(key, 2), false);
assert.equal(await rateLimited(key, 2), false);
assert.equal(await rateLimited(key, 2), true);
console.log("security.check.ts ok");
