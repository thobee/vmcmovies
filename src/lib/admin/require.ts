import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/session";

export async function requireAdminSession(): Promise<{ email: string }> {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}
