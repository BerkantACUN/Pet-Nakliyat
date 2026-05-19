"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { markAllReadAction } from "@/app/(panel)/bildirimler/actions";

export function MarkAllReadButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      const r = await markAllReadAction();
      if (!r.ok) {
        toast.error(r.error ?? "Olmadı");
        return;
      }
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="inline-flex items-center gap-1 rounded-pill border border-chalk bg-white px-3 py-1.5 text-[12px] hover:bg-powder disabled:opacity-60"
    >
      <Check className="size-3.5" />
      {pending ? "İşleniyor…" : "Hepsini okundu işaretle"}
    </button>
  );
}
