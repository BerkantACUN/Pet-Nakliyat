"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";
import { Loader2, SendHorizonal } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  sendMessageAction,
  markConversationReadAction,
} from "@/app/(panel)/mesajlar/actions";
import type { Message } from "@/lib/supabase/types";

interface ChatRoomProps {
  conversationId: string;
  currentUserId: string;
  initialMessages: Message[];
}

export function ChatRoom({
  conversationId,
  currentUserId,
  initialMessages,
}: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [pending, startTransition] = useTransition();
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  useEffect(() => {
    markConversationReadAction(conversationId).catch(() => {});
  }, [conversationId]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const next = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === next.id)) return prev;
            return [...prev, next];
          });
          if (next.sender_id !== currentUserId) {
            markConversationReadAction(conversationId).catch(() => {});
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  function handleSend() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const tempId = `temp-${Date.now()}`;
    const optimistic: Message = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: currentUserId,
      body: trimmed,
      read_at: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setDraft("");

    startTransition(async () => {
      const res = await sendMessageAction({
        conversationId,
        body: trimmed,
      });
      if (!res.ok) {
        toast.error(res.error ?? "Mesaj gönderilemedi");
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setDraft(trimmed);
      }
    });
  }

  return (
    <div className="flex h-[calc(100dvh-180px)] flex-col gap-3">
      <div
        ref={listRef}
        className="flex-1 space-y-2 overflow-y-auto rounded-3xl border border-chalk bg-eggshell p-4"
      >
        {messages.length === 0 ? (
          <div className="grid h-full place-items-center text-[13px] text-gravel">
            İlk mesajı sen yaz 🐾
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === currentUserId;
            return (
              <div
                key={m.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-[14px] leading-snug ${
                    mine
                      ? "bg-foreground text-eggshell"
                      : "bg-white text-foreground"
                  }`}
                >
                  {m.body}
                </div>
              </div>
            );
          })
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-end gap-2 rounded-3xl border border-chalk bg-white p-2"
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={1}
          placeholder="Mesajını yaz…"
          className="max-h-32 flex-1 resize-none bg-transparent px-3 py-2 text-[14px] outline-none"
        />
        <button
          type="submit"
          disabled={pending || draft.trim().length === 0}
          aria-label="Gönder"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-obsidian text-eggshell transition hover:bg-obsidian/85 disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <SendHorizonal className="size-4" />
          )}
        </button>
      </form>
    </div>
  );
}
