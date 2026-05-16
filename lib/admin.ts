import { redirect } from "next/navigation";
import { requireUser, type AuthedUser } from "./auth";

/**
 * Admin kullanıcıları ADMIN_USER_IDS env'inden okuyoruz (virgülle ayrılmış UUID listesi).
 * Production'da profiles.is_admin kolonuna geçilebilir.
 */
function isAdminId(userId: string): boolean {
  const raw = process.env.ADMIN_USER_IDS ?? "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .includes(userId);
}

export function isAdmin(user: AuthedUser): boolean {
  return isAdminId(user.id);
}

export async function requireAdmin(): Promise<AuthedUser> {
  const user = await requireUser();
  if (!isAdminId(user.id)) {
    redirect("/panel");
  }
  return user;
}
