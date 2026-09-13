/**
 * Generate bcrypt hash for ADMIN_PASSWORD_HASH.
 * Usage: npm run admin:hash-password -- YourPasswordHere
 */
import { hashPassword } from "../src/lib/auth/password";

const password = process.argv[2];

if (!password) {
  console.error("Usage: npm run admin:hash-password -- <password>");
  process.exit(1);
}

hashPassword(password).then((hash) => {
  console.log("\nAdd to .env.local (use quotes on Windows — $ in bcrypt hashes):\n");
  console.log(`ADMIN_EMAIL=admin@vmc.com`);
  console.log(`ADMIN_PASSWORD_HASH="${hash}"\n`);
});
