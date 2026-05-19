import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Mail } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignInForm } from "@/components/auth/SignInForm";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { getUser } from "@/lib/auth";

export const metadata = {
  title: "Giriş · Patiyolu",
};

interface PageProps {
  searchParams: Promise<{
    yeni?: string;
    err?: string;
    confirmed?: string;
    email_changed?: string;
  }>;
}

export default async function GirisPage({ searchParams }: PageProps) {
  const user = await getUser();
  if (user) redirect("/panel");

  const { yeni, err, confirmed, email_changed } = await searchParams;

  const subtitle = confirmed
    ? "E-postan onaylandı 🎉 Şifrenle giriş yap."
    : email_changed
      ? "E-posta adresin güncellendi. Yeni adresle giriş yap."
      : yeni
        ? "Hesabın hazır. E-postanı onayladıysan giriş yapabilirsin."
        : "Tüylü dostunla nereye gidiyoruz?";

  return (
    <AuthCard
      title="Tekrar hoş geldin"
      subtitle={subtitle}
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
      {confirmed ? (
        <div className="mb-4 flex items-start gap-2 rounded-2xl border border-clover/30 bg-clover/10 p-3 text-[12px] leading-relaxed text-obsidian">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-clover" />
          <span>
            E-posta adresin başarıyla onaylandı 🐾 Aşağıdan şifrenle giriş
            yapabilirsin.
          </span>
        </div>
      ) : email_changed ? (
        <div className="mb-4 flex items-start gap-2 rounded-2xl border border-signal/30 bg-signal/10 p-3 text-[12px] leading-relaxed text-obsidian">
          <Mail className="mt-0.5 size-4 shrink-0 text-signal" />
          <span>
            E-posta değişikliğin onaylandı. Yeni adresinle giriş yapabilirsin.
          </span>
        </div>
      ) : null}
      <GoogleButton />
      <Separator />
      <SignInForm />
      {err === "oauth" ? (
        <p className="mt-4 text-center text-[12px] text-danger">
          Giriş başarısız oldu. Tekrar dene.
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
