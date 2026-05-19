import { redirect } from "next/navigation";
import { requireOnboardedUser } from "@/lib/auth";

export default async function TasiyiciLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireOnboardedUser();
  if (!user.roles.includes("transporter")) {
    redirect("/musteri");
  }
  return <>{children}</>;
}
