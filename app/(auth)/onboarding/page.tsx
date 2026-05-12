import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { OnboardingForm } from "@/components/auth/OnboardingForm";
import { getUser } from "@/lib/auth";

export const metadata = { title: "Hoş geldin · Patiyolu" };

export default async function OnboardingPage() {
  const user = await getUser();
  if (!user) redirect("/giris");
  if (user.profile?.onboarding_completed_at) redirect("/panel");

  return (
    <AuthCard
      title={`Hoş geldin${firstNameSuffix(user.profile?.full_name)}`}
      subtitle="Birkaç bilgi alalım, pati yolculuğun başlasın."
    >
      <OnboardingForm />
    </AuthCard>
  );
}

function firstNameSuffix(name: string | undefined): string {
  if (!name) return "";
  const first = name.split(" ")[0];
  return `, ${first} 🐾`;
}
