import { redirect } from "next/navigation";
import { requireOnboardedUser } from "@/lib/auth";

export default async function MusteriLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireOnboardedUser();
  if (!user.roles.includes("customer")) {
    redirect("/tasiyici");
  }
  return <>{children}</>;
}
