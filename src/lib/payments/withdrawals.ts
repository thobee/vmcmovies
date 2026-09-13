import { ObjectId, type Collection, type Document } from "mongodb";
import { getDb } from "@/lib/db/mongodb";
import type { PaymentCurrency } from "@/lib/payments/currency";

const WITHDRAWALS = "withdrawals";

export type WithdrawalStatus = "otp" | "pending" | "success" | "failed" | "reversed";

export type Withdrawal = {
  _id: string;
  amountMinor: number;
  currency: PaymentCurrency;
  reference: string;
  transferCode: string | null;
  status: WithdrawalStatus;
  reason: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};

type WithdrawalDoc = Document & {
  _id: ObjectId;
  amountMinor: number;
  currency: PaymentCurrency;
  reference: string;
  transferCode?: string | null;
  status: WithdrawalStatus;
  reason: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};

let indexesReady = false;

async function withdrawalsCol(): Promise<Collection<WithdrawalDoc>> {
  const col = (await getDb()).collection<WithdrawalDoc>(WITHDRAWALS);
  if (!indexesReady) {
    await col.createIndex({ reference: 1 }, { unique: true });
    await col.createIndex({ createdAt: -1 });
    indexesReady = true;
  }
  return col;
}

function toWithdrawal(doc: WithdrawalDoc): Withdrawal {
  return {
    _id: doc._id.toString(),
    amountMinor: doc.amountMinor,
    currency: doc.currency,
    reference: doc.reference,
    transferCode: doc.transferCode ?? null,
    status: doc.status,
    reason: doc.reason,
    createdBy: doc.createdBy,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function createWithdrawal(input: {
  amountMinor: number;
  currency: PaymentCurrency;
  reference: string;
  transferCode: string | null;
  status: WithdrawalStatus;
  reason: string;
  createdBy: string;
}): Promise<Withdrawal> {
  const now = new Date();
  const doc: Omit<WithdrawalDoc, "_id"> = {
    amountMinor: input.amountMinor,
    currency: input.currency,
    reference: input.reference,
    transferCode: input.transferCode,
    status: input.status,
    reason: input.reason,
    createdBy: input.createdBy,
    createdAt: now,
    updatedAt: now,
  };
  const result = await (await withdrawalsCol()).insertOne(doc as WithdrawalDoc);
  return toWithdrawal({ ...doc, _id: result.insertedId } as WithdrawalDoc);
}

export async function updateWithdrawalByTransferCode(
  transferCode: string,
  patch: Partial<Pick<Withdrawal, "status" | "transferCode">>
): Promise<Withdrawal | null> {
  const result = await (await withdrawalsCol()).findOneAndUpdate(
    { transferCode },
    { $set: { ...patch, updatedAt: new Date() } },
    { returnDocument: "after" }
  );
  return result ? toWithdrawal(result) : null;
}

export async function listWithdrawals(limit = 20): Promise<Withdrawal[]> {
  const docs = await (await withdrawalsCol())
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map(toWithdrawal);
}

export async function getWithdrawnTotals(): Promise<Record<PaymentCurrency, number>> {
  const col = await withdrawalsCol();
  const rows = await col
    .aggregate<{ _id: PaymentCurrency; total: number }>([
      { $match: { status: { $in: ["success", "pending", "otp"] } } },
      { $group: { _id: "$currency", total: { $sum: "$amountMinor" } } },
    ])
    .toArray();

  const totals: Record<PaymentCurrency, number> = { NGN: 0, GHS: 0 };
  for (const row of rows) {
    if (row._id === "NGN" || row._id === "GHS") totals[row._id] = row.total;
  }
  return totals;
}
