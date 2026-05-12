import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";

export const metadata = {
  title: "Hesap aç · Patiyolu",
};

export default async function KayitPage() {
  const user = await getUser();
  if (user) redirect("/panel");

  return (
    <AuthCard
      title="Hesap aç"
      subtitle="Pati yolculuğun birkaç dokunuş uzakta."
      footer={
        <>
          Zaten üyesin?{" "}
          <Link href="/giris" className="font-medium text-obsidian underline decoration-chalk underline-offset-2 hover:decoration-obsidian">
            Giriş yap
          </Link>
        </>
      }
    >
      <GoogleButton label="Google ile hesap aç" />
      <Separator />
      <SignUpForm />
    </AuthCard>
  );
}

function Separator() {
  return (
    <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-gravel">
      <span className="h-px flex-1 bg-chalk" />
      <span>veya</span>
      <span className="h-px flex-1 bg-chalk" />
    </div>
  );
}
