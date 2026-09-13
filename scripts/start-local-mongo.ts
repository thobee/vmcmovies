/**
 * Local MongoDB for development when Atlas auth is broken.
 * Persists data under .data/mongo so users/payments survive restarts.
 *
 * Usage: npm run mongo:local
 * Then point MONGODB_URI at the printed URL (already set in .env.local by default).
 */
import { mkdirSync } from "fs";
import { resolve } from "path";
import { MongoMemoryServer } from "mongodb-memory-server";

const dbPath = resolve(process.cwd(), ".data", "mongo");
mkdirSync(dbPath, { recursive: true });

const PORT = Number(process.env.LOCAL_MONGO_PORT ?? 27017);

async function main() {
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: PORT,
      dbPath,
      storageEngine: "wiredTiger",
    },
  });

  const uri = mongod.getUri("vmc");
  console.log("\nLocal MongoDB is running.");
  console.log(`URI:  ${uri}`);
  console.log(`Set MONGODB_URI in .env.local to:\n  mongodb://127.0.0.1:${PORT}/vmc\n`);
  console.log("Keep this terminal open while developing. Ctrl+C to stop.\n");

  // Keep process alive
  await new Promise(() => {});
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
