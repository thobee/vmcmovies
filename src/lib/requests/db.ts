import { ObjectId, type Collection, type Document } from "mongodb";
import { getDb } from "@/lib/db/mongodb";
import type { TitleRequest, TitleRequestStatus, TitleRequestType } from "./types";

const COLLECTION = "title_requests";

type RequestDoc = Document & {
  _id: ObjectId;
  userId: string;
  email: string;
  telegramUsername: string;
  title: string;
  type: TitleRequestType;
  year: number | null;
  status: TitleRequestStatus;
  createdAt: Date;
};

let indexesReady = false;

async function requests(): Promise<Collection<RequestDoc>> {
  const db = await getDb();
  const col = db.collection<RequestDoc>(COLLECTION);

  if (!indexesReady) {
    await col.createIndex({ status: 1, createdAt: -1 });
    await col.createIndex({ userId: 1, createdAt: -1 });
    indexesReady = true;
  }

  return col;
}

function toRequest(doc: RequestDoc): TitleRequest {
  return {
    _id: doc._id.toString(),
    userId: doc.userId,
    email: doc.email,
    telegramUsername: doc.telegramUsername,
    title: doc.title,
    type: doc.type,
    year: doc.year,
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
  };
}

export async function createTitleRequest(input: {
  userId: string;
  email: string;
  telegramUsername: string;
  title: string;
  type: TitleRequestType;
  year: number | null;
}): Promise<TitleRequest> {
  const doc: Omit<RequestDoc, "_id"> = {
    userId: input.userId,
    email: input.email.trim().toLowerCase(),
    telegramUsername: input.telegramUsername,
    title: input.title.trim(),
    type: input.type,
    year: input.year,
    status: "open",
    createdAt: new Date(),
  };

  const result = await (await requests()).insertOne(doc as RequestDoc);
  return toRequest({ ...doc, _id: result.insertedId } as RequestDoc);
}

export async function listTitleRequests(limit = 100): Promise<TitleRequest[]> {
  const docs = await (await requests())
    .find({})
    .sort({ status: 1, createdAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map(toRequest);
}

export async function countOpenTitleRequests(): Promise<number> {
  return (await requests()).countDocuments({ status: "open" });
}

export async function setTitleRequestStatus(
  id: string,
  status: TitleRequestStatus,
): Promise<TitleRequest | null> {
  if (!ObjectId.isValid(id)) return null;

  const result = await (await requests()).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { status } },
    { returnDocument: "after" },
  );

  return result ? toRequest(result) : null;
}
