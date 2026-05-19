"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";
import { startDirectConversationAction } from "@/app/u/[id]/actions";

interface MessageButtonProps {
  targetId: string;
}

export function MessageButton({ targetId }: MessageButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      const result = await startDirectConversationAction(targetId);
      if (!result.ok || !result.conversationId) {
        toast.error(result.error ?? "Mesajlaşma başlatılamadı");
        return;
      }
      router.push(`/mesajlar/${result.conversationId}`);
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-pill border border-chalk bg-white px-4 py-2 text-[12px] font-medium text-obsidian transition hover:bg-powder disabled:opacity-60"
    >
      <MessageCircle className="size-3.5" />
      {pending ? "Açılıyor…" : "Mesaj at"}
    </button>
  );
}
