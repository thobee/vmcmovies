export type TitleRequestType = "movie" | "series";
export type TitleRequestStatus = "open" | "done";

export interface TitleRequest {
  _id: string;
  userId: string;
  email: string;
  telegramUsername: string;
  title: string;
  type: TitleRequestType;
  year: number | null;
  status: TitleRequestStatus;
  createdAt: string;
}
