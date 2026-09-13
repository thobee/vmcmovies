import {
  base32Decode,
  base32Encode,
  decryptTotpSecret,
  encryptTotpSecret,
  hashRecovery,
  hotp,
  isRecoveryCode,
  totpAt,
  verifyTotp,
} from "./totp";

const rfc = Buffer.from("12345678901234567890");
if (hotp(rfc, 0) !== "755224") throw new Error("HOTP counter 0");
if (hotp(rfc, 1) !== "287082") throw new Error("HOTP counter 1");
if (totpAt(rfc, 59) !== "287082") throw new Error("TOTP unix 59");

const now = Math.floor(Date.now() / 1000);
if (!verifyTotp(rfc, totpAt(rfc, now))) throw new Error("verifyTotp current window");

const b32 = base32Encode(rfc);
if (!base32Decode(b32).equals(rfc)) throw new Error("base32 roundtrip");

if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
  process.env.AUTH_SECRET = "0".repeat(32);
}
const blob = encryptTotpSecret(b32);
if (decryptTotpSecret(blob) !== b32) throw new Error("secret encrypt roundtrip");

if (!isRecoveryCode("A1B2-C3D4")) throw new Error("recovery shape");
if (isRecoveryCode("123456")) throw new Error("6-digit is not recovery");
if (hashRecovery("a1b2-c3d4") !== hashRecovery("A1B2C3D4")) throw new Error("recovery normalize");

console.log("admin totp ok");
