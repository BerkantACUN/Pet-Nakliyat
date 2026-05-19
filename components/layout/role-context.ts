import type { AppRole } from "@/lib/supabase/types";

/**
 * URL'e ve kullanıcının rollerine bakarak aktif rolü tespit eder.
 * /musteri/* veya /tasiyici/* → ilgili rol (kullanıcıda varsa)
 * Aksi halde default_role.
 */
export function detectActiveRole(
  pathname: string,
  roles: AppRole[],
  defaultRole: AppRole,
): AppRole {
  if (pathname.startsWith("/musteri") && roles.includes("customer")) {
    return "customer";
  }
  if (pathname.startsWith("/tasiyici") && roles.includes("transporter")) {
    return "transporter";
  }
  if (roles.includes(defaultRole)) {
    return defaultRole;
  }
  return roles[0] ?? defaultRole;
}
