import { redirect } from "next/navigation";
import { requireUser, type AuthedUser } from "./auth";

/**
 * Admin kullanıcıları ADMIN_USER_IDS env'inden okuyoruz (virgülle ayrılmış UUID listesi).
 * Production'da profiles.is_admin kolonuna geçilebilir.
 */
function getConfiguredAdminIds(): string[] {
  const raw = process.env.ADMIN_USER_IDS ?? "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function isAdminId(userId: string): boolean {
  return getConfiguredAdminIds().includes(userId);
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

export interface AdminGateResult {
  user: AuthedUser;
  isAdmin: boolean;
  configuredCount: number;
}

/**
 * Redirect etmeden admin durumunu döndürür. Layout'ta yetki yok ekranı göstermek için.
 */
export async function adminGate(): Promise<AdminGateResult> {
  const user = await requireUser();
  const configured = getConfiguredAdminIds();
  return {
    user,
    isAdmin: configured.includes(user.id),
    configuredCount: configured.length,
  };
}
