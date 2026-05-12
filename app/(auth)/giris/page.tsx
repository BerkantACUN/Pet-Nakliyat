import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignInForm } from "@/components/auth/SignInForm";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { getUser } from "@/lib/auth";

export const metadata = {
  title: "Giriş · Patiyolu",
};

interface PageProps {
  searchParams: Promise<{ yeni?: string; err?: string }>;
}

export default async function GirisPage({ searchParams }: PageProps) {
  const user = await getUser();
  if (user) redirect("/panel");

  const { yeni, err } = await searchParams;

  return (
    <AuthCard
      title="Tekrar hoş geldin"
      subtitle={
        yeni
          ? "Hesabın hazır. E-postanı onayladıysan giriş yapabilirsin."
          : "Tüylü dostunla nereye gidiyoruz?"
      }
      footer={
        <>
          Hesabın yok mu?{" "}
          <Link
            href="/kayit"
            className="font-medium text-obsidian underline decoration-chalk underline-offset-2 hover:decoration-obsidian"
          >
            Hesap aç
          </Link>
        </>
      }
    >
      <GoogleButton />
      <Separator />
      <SignInForm />
      {err === "oauth" ? (
        <p className="mt-4 text-center text-[12px] text-danger">
          Google ile giriş başarısız oldu. Tekrar dene.
        </p>
      ) : null}
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
