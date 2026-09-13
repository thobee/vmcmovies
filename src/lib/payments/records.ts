import { ObjectId, type Collection, type Document } from "mongodb";
import { getDb } from "@/lib/db/mongodb";
import type { PaymentCurrency } from "@/lib/payments/currency";
import type { PlanId } from "@/lib/payments/plans";
import type { PricingKind } from "@/lib/payments/billing/types";

export type PaymentStatus = "pending" | "success" | "failed";

export interface Payment {
  _id: string;
  userId: string;
  planId: PlanId | string;
  currency: PaymentCurrency;
  amountMinor: number;
  reference: string;
  status: PaymentStatus;
  premiumActivated: boolean;
  pricingKind?: PricingKind | null;
  notificationSentAt?: Date | null;
  adminNotifiedAt?: Date | null;
  checkoutId?: string | null;
  paystackReference?: string | null;
  paidAt?: Date | null;
  failureReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

type PaymentDoc = Document & {
  _id: ObjectId;
  userId: string;
  planId: PlanId | string;
  currency?: PaymentCurrency;
  amountMinor?: number;
  pricingKind?: PricingKind | null;
  /** @deprecated legacy field — use amountMinor */
  amountKobo?: number;
  reference: string;
  status: PaymentStatus;
  premiumActivated?: boolean;
  notificationSentAt?: Date | null;
  adminNotifiedAt?: Date | null;
  checkoutId?: string | null;
  paystackReference?: string | null;
  paidAt?: Date | null;
  failureReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const COLLECTION = "payments";
let indexesReady = false;

async function payments(): Promise<Collection<PaymentDoc>> {
  const db = await getDb();
  const col = db.collection<PaymentDoc>(COLLECTION);

  if (!indexesReady) {
    await col.createIndex({ reference: 1 }, { unique: true });
    await col.createIndex({ userId: 1, createdAt: -1 });
    await col.createIndex({ status: 1, createdAt: -1 });
    indexesReady = true;
  }

  return col;
}

function toPayment(doc: PaymentDoc): Payment {
  const currency = doc.currency ?? "NGN";
  return {
    _id: doc._id.toString(),
    userId: doc.userId,
    planId: doc.planId,
    currency,
    amountMinor: doc.amountMinor ?? doc.amountKobo ?? 0,
    reference: doc.reference,
    status: doc.status,
    premiumActivated: doc.premiumActivated === true,
    notificationSentAt: doc.notificationSentAt ?? null,
    adminNotifiedAt: doc.adminNotifiedAt ?? null,
    checkoutId: doc.checkoutId ?? null,
    paystackReference: doc.paystackReference ?? null,
    paidAt: doc.paidAt ?? null,
    failureReason: doc.failureReason ?? null,
    pricingKind: doc.pricingKind ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function createPendingPayment(input: {
  userId: string;
  planId: PlanId | string;
  currency: PaymentCurrency;
  amountMinor: number;
  reference: string;
  checkoutId?: string;
  pricingKind?: PricingKind;
}): Promise<Payment> {
  const now = new Date();
  const doc: Omit<PaymentDoc, "_id"> = {
    userId: input.userId,
    planId: input.planId,
    currency: input.currency,
    amountMinor: input.amountMinor,
    reference: input.reference,
    checkoutId: input.checkoutId ?? null,
    pricingKind: input.pricingKind ?? "standard",
    status: "pending",
    premiumActivated: false,
    createdAt: now,
    updatedAt: now,
  };

  const result = await (await payments()).insertOne(doc as PaymentDoc);
  return toPayment({ ...doc, _id: result.insertedId } as PaymentDoc);
}

export async function setPaymentCheckoutId(
  reference: string,
  checkoutId: string
): Promise<void> {
  await (await payments()).updateOne(
    { reference },
    { $set: { checkoutId, updatedAt: new Date() } }
  );
}

export async function findPaymentByCheckoutId(checkoutId: string): Promise<Payment | null> {
  const doc = await (await payments()).findOne({ checkoutId });
  return doc ? toPayment(doc) : null;
}

export async function findPaymentByReference(
  reference: string
): Promise<Payment | null> {
  const doc = await (await payments()).findOne({ reference });
  return doc ? toPayment(doc) : null;
}

export async function markPaymentFulfilled(
  reference: string,
  paidAt: Date
): Promise<Payment | null> {
  const result = await (await payments()).findOneAndUpdate(
    { reference, premiumActivated: { $ne: true } },
    {
      $set: {
        status: "success",
        paidAt,
        paystackReference: reference,
        premiumActivated: true,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );
  return result ? toPayment(result) : findPaymentByReference(reference);
}

export async function markPremiumActivated(reference: string): Promise<void> {
  await (await payments()).updateOne(
    { reference },
    { $set: { premiumActivated: true, updatedAt: new Date() } }
  );
}

/** User receipt email delivered. */
export async function markUserReceiptSent(reference: string): Promise<void> {
  await (await payments()).updateOne(
    { reference, notificationSentAt: null },
    { $set: { notificationSentAt: new Date(), updatedAt: new Date() } }
  );
}

/** Admin payment alert delivered. */
export async function markAdminNotified(reference: string): Promise<void> {
  await (await payments()).updateOne(
    { reference, adminNotifiedAt: null },
    { $set: { adminNotifiedAt: new Date(), updatedAt: new Date() } }
  );
}

export async function markPaymentFailed(
  reference: string,
  reason: string
): Promise<void> {
  await (await payments()).updateOne(
    { reference, status: "pending" },
    {
      $set: {
        status: "failed",
        failureReason: reason,
        updatedAt: new Date(),
      },
    }
  );
}

export async function getPaymentsForUser(userId: string): Promise<Payment[]> {
  const docs = await (await payments())
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(10)
    .toArray();
  return docs.map(toPayment);
}

export async function userHasSuccessfulPayment(userId: string): Promise<boolean> {
  const doc = await (await payments()).findOne(
    { userId, status: "success" },
    { projection: { _id: 1 } },
  );
  return Boolean(doc);
}

export async function listPayments(limit = 100): Promise<Payment[]> {
  const docs = await (await payments())
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map(toPayment);
}

export interface PaymentStats {
  total: number;
  successful: number;
  pending: number;
  failed: number;
  revenueByCurrency: Record<PaymentCurrency, number>;
}

export async function getPaymentStats(): Promise<PaymentStats> {
  const col = await payments();
  const [total, successful, pending, failed] = await Promise.all([
    col.countDocuments(),
    col.countDocuments({ status: "success" }),
    col.countDocuments({ status: "pending" }),
    col.countDocuments({ status: "failed" }),
  ]);

  const revenueByCurrency: Record<PaymentCurrency, number> = { NGN: 0, GHS: 0 };
  const paid = await col
    .find({ status: "success" })
    .project({ currency: 1, amountMinor: 1, amountKobo: 1 })
    .toArray();

  for (const doc of paid) {
    const currency: PaymentCurrency = doc.currency === "GHS" ? "GHS" : "NGN";
    revenueByCurrency[currency] += doc.amountMinor ?? doc.amountKobo ?? 0;
  }

  return { total, successful, pending, failed, revenueByCurrency };
}
