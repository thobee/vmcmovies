import { ObjectId, type Collection, type Document } from "mongodb";
import { getDb } from "@/lib/db/mongodb";
import type { SupportCategory, SupportStatus, SupportTicket } from "./types";

const COLLECTION = "support_tickets";

type TicketDoc = Document & {
  _id: ObjectId;
  userId: string | null;
  email: string;
  telegramUsername: string | null;
  category: SupportCategory;
  subject: string;
  message: string;
  paymentReference: string | null;
  status: SupportStatus;
  createdAt: Date;
  resolvedAt: Date | null;
};

let indexesReady = false;

async function tickets(): Promise<Collection<TicketDoc>> {
  const db = await getDb();
  const col = db.collection<TicketDoc>(COLLECTION);

  if (!indexesReady) {
    await col.createIndex({ status: 1, createdAt: -1 });
    await col.createIndex({ userId: 1, createdAt: -1 });
    indexesReady = true;
  }

  return col;
}

function toTicket(doc: TicketDoc): SupportTicket {
  return {
    _id: doc._id.toString(),
    userId: doc.userId,
    email: doc.email,
    telegramUsername: doc.telegramUsername,
    category: doc.category,
    subject: doc.subject,
    message: doc.message,
    paymentReference: doc.paymentReference,
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
    resolvedAt: doc.resolvedAt?.toISOString() ?? null,
  };
}

export async function createSupportTicket(input: {
  userId: string | null;
  email: string;
  telegramUsername: string | null;
  category: SupportCategory;
  subject: string;
  message: string;
  paymentReference?: string | null;
}): Promise<SupportTicket> {
  const now = new Date();
  const doc: Omit<TicketDoc, "_id"> = {
    userId: input.userId,
    email: input.email.trim().toLowerCase(),
    telegramUsername: input.telegramUsername,
    category: input.category,
    subject: input.subject.trim(),
    message: input.message.trim(),
    paymentReference: input.paymentReference?.trim() || null,
    status: "open",
    createdAt: now,
    resolvedAt: null,
  };

  const result = await (await tickets()).insertOne(doc as TicketDoc);
  return toTicket({ ...doc, _id: result.insertedId } as TicketDoc);
}

export async function listSupportTickets(limit = 100): Promise<SupportTicket[]> {
  const docs = await (await tickets())
    .find({})
    .sort({ status: 1, createdAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map(toTicket);
}

export async function countOpenSupportTickets(): Promise<number> {
  return (await tickets()).countDocuments({ status: "open" });
}

export async function setSupportTicketStatus(
  id: string,
  status: SupportStatus
): Promise<SupportTicket | null> {
  if (!ObjectId.isValid(id)) return null;

  const result = await (await tickets()).findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        status,
        resolvedAt: status === "resolved" ? new Date() : null,
      },
    },
    { returnDocument: "after" }
  );

  return result ? toTicket(result) : null;
}
