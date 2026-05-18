import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";

export const metadata = {
  title: "Yeni şifre belirle · Patiyolu",
};

export default function SifreYenilePage() {
  return (
    <AuthCard
      title="Yeni şifre belirle"
      subtitle="E-postandan geldiğin için artık güvenli. Hesabın için yeni bir şifre seç."
      footer={
        <Link
          href="/giris"
          className="font-medium text-obsidian underline decoration-chalk underline-offset-2 hover:decoration-obsidian"
        >
          ← Girişe dön
        </Link>
      }
    >
      <UpdatePasswordForm />
    </AuthCard>
  );
}
