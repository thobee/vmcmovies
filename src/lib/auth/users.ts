import { ObjectId, type ClientSession, type Collection, type Document } from "mongodb";
import { getDb } from "@/lib/db/mongodb";
import type { AdminRole, PremiumSource, PremiumStatus, User, UserRole } from "@/lib/auth/types";
import { isAdminRole } from "@/lib/admin/permissions";

const COLLECTION = "users";

type UserDoc = Document & {
  _id: ObjectId;
  email: string;
  telegramUsername: string;
  passwordHash: string;
  role?: UserRole;
  premiumStatus: PremiumStatus;
  premiumStartDate?: Date | null;
  premiumExpiryDate?: Date | null;
  premiumSource?: PremiumSource | null;
  welcomeTrialStartedAt?: Date | null;
  welcomeTrialExpiryDate?: Date | null;
  createdAt: Date;
  totpEnabled?: boolean;
  totpSecretEnc?: string;
  totpRecoveryHashes?: string[];
  googleId?: string;
};

let indexesReady = false;

async function users(): Promise<Collection<UserDoc>> {
  const db = await getDb();
  const col = db.collection<UserDoc>(COLLECTION);

  if (!indexesReady) {
    await col.createIndex({ email: 1 }, { unique: true });
    indexesReady = true;
  }

  return col;
}

function toUser(doc: UserDoc): User {
  return {
    _id: doc._id.toString(),
    email: doc.email,
    telegramUsername: doc.telegramUsername,
    passwordHash: doc.passwordHash ?? "",
    googleId: doc.googleId,
    role: doc.role ?? "user",
    premiumStatus: doc.premiumStatus,
    premiumStartDate: doc.premiumStartDate ?? null,
    premiumExpiryDate: doc.premiumExpiryDate ?? null,
    premiumSource: doc.premiumSource ?? null,
    welcomeTrialStartedAt: doc.welcomeTrialStartedAt ?? null,
    welcomeTrialExpiryDate: doc.welcomeTrialExpiryDate ?? null,
    createdAt: doc.createdAt,
    totpEnabled: Boolean(doc.totpEnabled && doc.totpSecretEnc),
  };
}

export function effectivePremiumStatus(user: User): PremiumStatus {
  if (
    user.premiumStatus === "active" &&
    user.premiumExpiryDate &&
    user.premiumExpiryDate < new Date()
  ) {
    return "expired";
  }
  return user.premiumStatus;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const doc = await (await users()).findOne({
    email: email.toLowerCase().trim(),
  });
  return doc ? toUser(doc) : null;
}

export async function findUserById(id: string, session?: ClientSession): Promise<User | null> {
  if (!ObjectId.isValid(id)) return null;
  const doc = await (await users()).findOne({ _id: new ObjectId(id) }, { session });
  return doc ? toUser(doc) : null;
}

export async function countAdmins(): Promise<number> {
  return (await users()).countDocuments({ role: "admin" });
}

/** Promote an existing member account to an admin role (CLI / ops — not exposed in the panel). */
export async function promoteUserToAdminRole(email: string, role: AdminRole = "admin"): Promise<
  | { status: "promoted"; user: User }
  | { status: "already_role"; user: User }
  | { status: "already_admin"; user: User }
  | { status: "not_found" }
> {
  const normalized = email.toLowerCase().trim();
  const existing = await findUserByEmail(normalized);
  if (!existing) return { status: "not_found" };
  if (existing.role === role) return { status: "already_role", user: existing };

  const result = await (await users()).findOneAndUpdate(
    { email: normalized },
    { $set: { role } },
    { returnDocument: "after" },
  );
  if (!result) return { status: "not_found" };
  return { status: "promoted", user: toUser(result) };
}

export async function promoteUserToAdmin(email: string) {
  const result = await promoteUserToAdminRole(email, "admin");
  return result.status === "already_role"
    ? { status: "already_admin" as const, user: result.user }
    : result;
}

export async function findUserByGoogleId(googleId: string): Promise<User | null> {
  const doc = await (await users()).findOne({ googleId });
  return doc ? toUser(doc) : null;
}

function sanitizeTelegramUsername(raw: string): string {
  const base = raw.replace(/^@/, "").trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
  const name = base.slice(0, 32);
  return name.length >= 2 ? name : `user${Date.now().toString(36).slice(-6)}`;
}

export async function loginOrCreateGoogleUser(profile: {
  googleId: string;
  email: string;
  name: string;
}): Promise<{ user: User; isNew: boolean }> {
  const byGoogle = await findUserByGoogleId(profile.googleId);
  if (byGoogle) return { user: byGoogle, isNew: false };

  const byEmail = await findUserByEmail(profile.email);
  if (byEmail) {
    if (isAdminRole(byEmail.role)) {
      throw new Error("Use admin login for this account");
    }
    await (await users()).updateOne(
      { _id: new ObjectId(byEmail._id) },
      { $set: { googleId: profile.googleId } },
    );
    return { user: { ...byEmail, googleId: profile.googleId }, isNew: false };
  }

  const user = await createUser({
    email: profile.email,
    telegramUsername: sanitizeTelegramUsername(profile.name),
    googleId: profile.googleId,
  });
  return { user, isNew: true };
}

export async function createUser(input: {
  email: string;
  passwordHash?: string;
  telegramUsername: string;
  googleId?: string;
  role?: UserRole;
}): Promise<User> {
  const now = new Date();
  const doc: Omit<UserDoc, "_id"> = {
    email: input.email.toLowerCase().trim(),
    telegramUsername: input.telegramUsername,
    passwordHash: input.passwordHash ?? "",
    googleId: input.googleId,
    role: input.role ?? "user",
    premiumStatus: "none",
    premiumStartDate: null,
    premiumExpiryDate: null,
    premiumSource: null,
    welcomeTrialStartedAt: null,
    welcomeTrialExpiryDate: null,
    createdAt: now,
  };

  const result = await (await users()).insertOne(doc as UserDoc);
  return toUser({ ...doc, _id: result.insertedId } as UserDoc);
}

export async function activatePremium(
  userId: string,
  months: number,
  session?: ClientSession,
): Promise<Date> {
  if (!ObjectId.isValid(userId)) {
    throw new Error("Invalid user id");
  }

  const user = await findUserById(userId, session);
  if (!user) throw new Error("User not found");

  const now = new Date();
  let premiumStartDate = now;
  let base = now;

  if (
    user.premiumStatus === "active" &&
    user.premiumExpiryDate &&
    user.premiumExpiryDate > now
  ) {
    base = user.premiumExpiryDate;
    premiumStartDate = user.premiumStartDate ?? now;
  }

  const expiry = new Date(base);
  expiry.setMonth(expiry.getMonth() + months);

  await (await users()).updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        premiumStatus: "active",
        premiumStartDate,
        premiumExpiryDate: expiry,
        premiumSource: "paid",
      },
    },
    { session },
  );

  return expiry;
}

export async function activateWelcomeTrial(userId: string, durationDays: number): Promise<Date> {
  if (!ObjectId.isValid(userId)) throw new Error("Invalid user id");
  if (!Number.isInteger(durationDays) || durationDays < 1 || durationDays > 30) {
    throw new Error("Invalid trial duration");
  }

  const now = new Date();
  const expiry = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
  const result = await (await users()).findOneAndUpdate(
    {
      _id: new ObjectId(userId),
      premiumStatus: { $nin: ["active", "pending"] },
      $or: [
        { welcomeTrialStartedAt: { $exists: false } },
        { welcomeTrialStartedAt: null },
      ],
    },
    {
      $set: {
        premiumStatus: "active",
        premiumSource: "trial",
        premiumStartDate: now,
        premiumExpiryDate: expiry,
        welcomeTrialStartedAt: now,
        welcomeTrialExpiryDate: expiry,
      },
    },
    { returnDocument: "after" },
  );

  if (!result) throw new Error("Trial is no longer available");
  return expiry;
}

export type PublicUser = Pick<
  User,
  "_id" | "email" | "telegramUsername" | "role" | "premiumStatus"
> & {
  premiumStartDate: string | null;
  premiumExpiryDate: string | null;
  premiumSource: PremiumSource | null;
  welcomeTrialStartedAt: string | null;
  welcomeTrialExpiryDate: string | null;
  createdAt: string;
};

function toPublicUser(user: User): PublicUser {
  return {
    _id: user._id,
    email: user.email,
    telegramUsername: user.telegramUsername,
    role: user.role,
    premiumStatus: effectivePremiumStatus(user),
    premiumStartDate: user.premiumStartDate?.toISOString() ?? null,
    premiumExpiryDate: user.premiumExpiryDate?.toISOString() ?? null,
    premiumSource: user.premiumSource ?? null,
    welcomeTrialStartedAt: user.welcomeTrialStartedAt?.toISOString() ?? null,
    welcomeTrialExpiryDate: user.welcomeTrialExpiryDate?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function listUsers(): Promise<PublicUser[]> {
  const docs = await (await users())
    .find({ role: { $nin: ["admin", "content_admin"] } })
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map((doc) => toPublicUser(toUser(doc)));
}

export type TeamUser = Pick<User, "_id" | "email" | "telegramUsername" | "role"> & {
  createdAt: string;
  totpEnabled: boolean;
  hasPassword: boolean;
};

function toTeamUser(doc: UserDoc): TeamUser {
  const user = toUser(doc);
  return {
    _id: user._id,
    email: user.email,
    telegramUsername: user.telegramUsername,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    totpEnabled: Boolean(user.totpEnabled),
    hasPassword: Boolean(user.passwordHash),
  };
}

export async function listTeamUsers(search = ""): Promise<TeamUser[]> {
  const query = search.trim().toLowerCase();
  const filter = query
    ? { email: { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } }
    : {};
  const docs = await (await users())
    .find(filter)
    .sort({ role: 1, createdAt: -1 })
    .limit(80)
    .toArray();
  return docs.map((doc) => toTeamUser(doc));
}

export async function setUserRole(userId: string, role: UserRole): Promise<TeamUser | null> {
  if (!ObjectId.isValid(userId)) return null;

  const update =
    role === "user"
      ? {
          $set: { role },
          $unset: { totpEnabled: "", totpSecretEnc: "", totpRecoveryHashes: "" },
        }
      : { $set: { role } };

  const result = await (await users()).findOneAndUpdate(
    { _id: new ObjectId(userId) },
    update,
    { returnDocument: "after" },
  );

  return result ? toTeamUser(result) : null;
}

export async function resetAdminMfaById(userId: string): Promise<TeamUser | null> {
  if (!ObjectId.isValid(userId)) return null;
  const result = await (await users()).findOneAndUpdate(
    { _id: new ObjectId(userId), role: { $in: ["admin", "content_admin"] } },
    {
      $set: { totpEnabled: false },
      $unset: { totpSecretEnc: "", totpRecoveryHashes: "" },
    },
    { returnDocument: "after" },
  );
  return result ? toTeamUser(result) : null;
}

export async function updateTelegramUsername(
  userId: string,
  telegramUsername: string
): Promise<User | null> {
  if (!ObjectId.isValid(userId)) return null;

  const result = await (await users()).findOneAndUpdate(
    { _id: new ObjectId(userId) },
    { $set: { telegramUsername } },
    { returnDocument: "after" }
  );

  return result ? toUser(result) : null;
}

export async function setUserPremiumStatus(
  userId: string,
  premiumStatus: PremiumStatus
): Promise<PublicUser | null> {
  if (!ObjectId.isValid(userId)) return null;

  const update: Partial<UserDoc> = { premiumStatus };
  if (premiumStatus === "none" || premiumStatus === "pending") {
    update.premiumStartDate = null;
    update.premiumExpiryDate = null;
    update.premiumSource = null;
  } else if (premiumStatus === "active") {
    update.premiumSource = "paid";
  }

  const result = await (await users()).findOneAndUpdate(
    { _id: new ObjectId(userId), role: { $nin: ["admin", "content_admin"] } },
    { $set: update },
    { returnDocument: "after" }
  );

  return result ? toPublicUser(toUser(result)) : null;
}

export async function updateAdminPassword(
  email: string,
  passwordHash: string
): Promise<boolean> {
  const result = await (await users()).updateOne(
    { email: email.toLowerCase().trim(), role: { $in: ["admin", "content_admin"] } },
    { $set: { passwordHash } }
  );
  return result.matchedCount === 1;
}

export async function updateUserPassword(email: string, passwordHash: string): Promise<boolean> {
  const result = await (await users()).updateOne(
    { email: email.toLowerCase().trim(), role: { $nin: ["admin", "content_admin"] } },
    { $set: { passwordHash } },
  );
  return result.matchedCount === 1;
}

export async function getAdminMfa(userId: string): Promise<{
  enabled: boolean;
  secretEnc: string | null;
  recoveryHashes: string[];
} | null> {
  if (!ObjectId.isValid(userId)) return null;
  const doc = await (await users()).findOne(
    { _id: new ObjectId(userId), role: { $in: ["admin", "content_admin"] } },
    { projection: { totpEnabled: 1, totpSecretEnc: 1, totpRecoveryHashes: 1 } },
  );
  if (!doc) return null;
  return {
    enabled: Boolean(doc.totpEnabled && doc.totpSecretEnc),
    secretEnc: doc.totpSecretEnc ?? null,
    recoveryHashes: doc.totpRecoveryHashes ?? [],
  };
}

export async function enableAdminTotp(
  userId: string,
  secretEnc: string,
  recoveryHashes: string[],
): Promise<boolean> {
  if (!ObjectId.isValid(userId)) return false;
  const result = await (await users()).updateOne(
    { _id: new ObjectId(userId), role: { $in: ["admin", "content_admin"] } },
    { $set: { totpEnabled: true, totpSecretEnc: secretEnc, totpRecoveryHashes: recoveryHashes } },
  );
  return result.matchedCount === 1;
}

export async function setAdminRecoveryHashes(userId: string, recoveryHashes: string[]): Promise<boolean> {
  if (!ObjectId.isValid(userId)) return false;
  const result = await (await users()).updateOne(
    { _id: new ObjectId(userId), role: { $in: ["admin", "content_admin"] } },
    { $set: { totpRecoveryHashes: recoveryHashes } },
  );
  return result.matchedCount === 1;
}
