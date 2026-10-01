import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

const ALPH = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const STEP = 30;
const DIGITS = 6;
/** ±2 steps covers modest phone-clock drift. Upgrade: NTP on the server. */
const WINDOW = 2;

function authSecret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET must be set and at least 32 characters");
  return s;
}

export function hotp(secret: Buffer, counter: number, digits = DIGITS): string {
  const b = Buffer.alloc(8);
  let c = counter;
  for (let i = 7; i >= 0; i--) {
    b[i] = c & 0xff;
    c = Math.floor(c / 256);
  }
  const hmac = createHmac("sha1", secret).update(b).digest();
  const offset = hmac[hmac.length - 1]! & 0x0f;
  const bin =
    ((hmac[offset]! & 0x7f) << 24) |
    ((hmac[offset + 1]! & 0xff) << 16) |
    ((hmac[offset + 2]! & 0xff) << 8) |
    (hmac[offset + 3]! & 0xff);
  return (bin % 10 ** digits).toString().padStart(digits, "0");
}

export function totpAt(secret: Buffer, unixSec: number): string {
  return hotp(secret, Math.floor(unixSec / STEP));
}

export function verifyTotp(secret: Buffer, code: string): boolean {
  const got = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(got)) return false;
  const t = Math.floor(Date.now() / 1000 / STEP);
  const want = Buffer.from(got);
  for (let w = -WINDOW; w <= WINDOW; w++) {
    const candidate = Buffer.from(hotp(secret, t + w));
    if (candidate.length === want.length && timingSafeEqual(candidate, want)) return true;
  }
  return false;
}

export function base32Encode(bytes: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += ALPH[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += ALPH[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/=+$/g, "").replace(/[\s-]/g, "");
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = ALPH.indexOf(ch);
    if (idx < 0) throw new Error("Invalid secret");
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

export function generateTotpSecret(): { bytes: Buffer; base32: string } {
  const bytes = randomBytes(20);
  return { bytes, base32: base32Encode(bytes) };
}

export function otpauthUrl(email: string, base32: string): string {
  const label = encodeURIComponent(`VMC:${email}`);
  return `otpauth://totp/${label}?secret=${base32}&issuer=VMC&algorithm=SHA1&digits=6&period=30`;
}

function aesKey(): Buffer {
  return createHash("sha256").update(`totp:${authSecret()}`).digest();
}

export function encryptTotpSecret(base32: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", aesKey(), iv);
  const enc = Buffer.concat([cipher.update(base32, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64url");
}

export function decryptTotpSecret(blob: string): string {
  const buf = Buffer.from(blob, "base64url");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", aesKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}

export function generateRecoveryCodes(n = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < n; i++) {
    const hex = randomBytes(4).toString("hex").toUpperCase();
    codes.push(`${hex.slice(0, 4)}-${hex.slice(4)}`);
  }
  return codes;
}

export function normalizeRecovery(code: string): string {
  return code.toUpperCase().replace(/[^A-F0-9]/g, "");
}

export function isRecoveryCode(code: string): boolean {
  return normalizeRecovery(code).length === 8;
}

export function hashRecovery(code: string): string {
  return createHmac("sha256", authSecret())
    .update(`recovery:${normalizeRecovery(code)}`)
    .digest("hex");
}

export function recoveryHashMatches(stored: string, incoming: string): boolean {
  const a = Buffer.from(stored);
  const b = Buffer.from(incoming);
  return a.length === b.length && timingSafeEqual(a, b);
}
