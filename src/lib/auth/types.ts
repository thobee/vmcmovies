export type PremiumStatus = "none" | "active" | "expired" | "pending";
export type UserRole = "user" | "admin";

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
}
