export type SupportCategory = "payment" | "download" | "account" | "other";
export type SupportStatus = "open" | "resolved";

export interface SupportTicket {
  _id: string;
  userId: string | null;
  email: string;
  telegramUsername: string | null;
  category: SupportCategory;
  subject: string;
  message: string;
  paymentReference: string | null;
  status: SupportStatus;
  createdAt: string;
  resolvedAt: string | null;
}
