"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { toggleMarketingConsentAction } from "@/app/(panel)/ayarlar/actions";

interface SettingsToggleProps {
  label: string;
  description: string;
  initial: boolean;
}

export function SettingsToggle({
  label,
  description,
  initial,
}: SettingsToggleProps) {
  const router = useRouter();
  const [on, setOn] = useState(initial);
  const [pending, startTransition] = useTransition();

  function onToggle() {
    const next = !on;
    setOn(next);
    startTransition(async () => {
      const result = await toggleMarketingConsentAction(next);
      if (!result.ok) {
        setOn(!next);
        toast.error(result.error ?? "Güncellenemedi");
        return;
      }
      toast.success(next ? "Açıldı" : "Kapatıldı");
      router.refresh();
    });
  }

  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-chalk bg-white p-4">
      <div className="flex-1">
        <p className="text-[14px] font-medium text-obsidian">{label}</p>
        <p className="mt-0.5 text-[12px] text-gravel">{description}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        disabled={pending}
        role="switch"
        aria-checked={on}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${on ? "bg-foreground" : "bg-chalk"}`}
      >
        <span
          className={`pointer-events-none inline-block size-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`}
        />
      </button>
    </div>
  );
}
