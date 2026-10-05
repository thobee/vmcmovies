export type PremiumStatus = "none" | "active" | "expired" | "pending";
export type PremiumSource = "paid" | "trial";
export type AdminRole = "admin" | "content_admin";
export type UserRole = "user" | AdminRole;

export interface User {
  _id: string;
  email: string;
  telegramUsername: string;
  passwordHash: string;
  googleId?: string;
  role: UserRole;
  premiumStatus: PremiumStatus;
  premiumStartDate?: Date | null;
  premiumExpiryDate?: Date | null;
  premiumSource?: PremiumSource | null;
  welcomeTrialStartedAt?: Date | null;
  welcomeTrialExpiryDate?: Date | null;
  createdAt: Date;
  totpEnabled?: boolean;
}

export interface SessionUser {
  id: string;
  email: string;
  telegramUsername: string;
  role: UserRole;
  premiumStatus: PremiumStatus;
  premiumExpiryDate: string | null;
  premiumSource: PremiumSource | null;
  welcomeTrialStartedAt: string | null;
  welcomeTrialExpiryDate: string | null;
}
