"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setDefaultRoleAction } from "@/app/(panel)/ayarlar/actions";

interface DefaultRoleSelectorProps {
  current: "customer" | "transporter";
  canTransporter: boolean;
}

export function DefaultRoleSelector({
  current,
  canTransporter,
}: DefaultRoleSelectorProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function pick(role: "customer" | "transporter") {
    if (role === current) return;
    startTransition(async () => {
      const result = await setDefaultRoleAction(role);
      if (!result.ok) {
        toast.error(result.error ?? "Güncellenemedi");
        return;
      }
      toast.success("Varsayılan rol güncellendi");
      router.refresh();
    });
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <RoleButton
        active={current === "customer"}
        label="Müşteri"
        emoji="👤"
        onClick={() => pick("customer")}
        disabled={pending}
      />
      <RoleButton
        active={current === "transporter"}
        label="Taşıyıcı"
        emoji="🚐"
        onClick={() => pick("transporter")}
        disabled={pending || !canTransporter}
        title={
          canTransporter ? undefined : "Önce taşıyıcı modunu aç (Profil → Taşıyıcı modunu aç)"
        }
      />
    </div>
  );
}

function RoleButton({
  active,
  label,
  emoji,
  onClick,
  disabled,
  title,
}: {
  active: boolean;
  label: string;
  emoji: string;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex flex-col items-center gap-1 rounded-2xl border p-3 text-sm transition-colors disabled:opacity-50 ${active ? "border-obsidian bg-obsidian text-eggshell" : "border-chalk bg-white text-obsidian hover:bg-powder"}`}
    >
      <span className="text-xl" aria-hidden>
        {emoji}
      </span>
      <span className="font-medium">{label}</span>
    </button>
  );
}
