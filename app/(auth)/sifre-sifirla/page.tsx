import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata = {
  title: "Şifre sıfırla · Patiyolu",
};

export default function SifreSifirlaPage() {
  return (
    <AuthCard
      title="Şifreni sıfırla"
      subtitle="E-postanı gir, sana yeni şifre belirleme bağlantısı yollayalım."
      footer={
        <Link
          href="/giris"
          className="font-medium text-obsidian underline decoration-chalk underline-offset-2 hover:decoration-obsidian"
        >
          ← Girişe dön
        </Link>
      }
    >
      <ResetPasswordForm />
    </AuthCard>
  );
}
