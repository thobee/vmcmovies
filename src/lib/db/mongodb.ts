import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri && process.env.NODE_ENV === "production") {
  console.warn("[VMC] MONGODB_URI is not set");
}

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise(): Promise<MongoClient> {
  if (!uri) {
    throw new Error("MONGODB_URI is not configured. Add it to .env.local");
  }

  // Share the in-flight connection in every runtime, including production.
  // Each Vercel instance still owns its own pool; this is not a cluster-wide cap.
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, {
      maxPoolSize: 5,
      minPoolSize: 0,
      maxIdleTimeMS: 60_000,
      waitQueueTimeoutMS: 10_000,
      serverSelectionTimeoutMS: 10_000,
    });
    global._mongoClientPromise = client.connect().catch(async (err) => {
      try {
        await client.close();
      } catch {
        // Preserve the original connection error if cleanup also fails.
      } finally {
        global._mongoClientPromise = undefined;
      }
      throw err;
    });
  }
  return global._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(process.env.MONGODB_DB_NAME ?? "vmc");
}

/** Use only for multi-document operations that must commit atomically. */
export async function getMongoClient(): Promise<MongoClient> {
  return getClientPromise();
}
