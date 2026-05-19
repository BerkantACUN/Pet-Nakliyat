"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ConvRow {
  id: string;
  customer_id: string;
  transporter_id: string;
  last_message_at: string | null;
  customer_unread_count: number;
  transporter_unread_count: number;
}

interface OtherProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface ConvView {
  id: string;
  other: OtherProfile | null;
  unread: number;
  lastMessageAt: string | null;
  lastMessageBody: string | null;
}

interface ChatFabProps {
  currentUserId: string;
}

export function ChatFab({ currentUserId }: ChatFabProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [convs, setConvs] = useState<ConvView[]>([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const popoverRef = useRef<HTMLDivElement>(null);

  // /mesajlar sayfasındayken FAB gizli
  const hidden = pathname?.startsWith("/mesajlar") || pathname?.startsWith("/giris") || pathname?.startsWith("/kayit");

  useEffect(() => {
    if (hidden) return;
    let mounted = true;
    const supabase = createClient();

    async function load() {
      const { data: rawConvs } = await supabase
        .from("conversations")
        .select(
          "id,customer_id,transporter_id,last_message_at,customer_unread_count,transporter_unread_count",
        )
        .or(`customer_id.eq.${currentUserId},transporter_id.eq.${currentUserId}`)
        .order("last_message_at", { ascending: false, nullsFirst: false })
        .limit(8);

      const list = (rawConvs ?? []) as ConvRow[];
      const otherIds = list.map((c) =>
        c.customer_id === currentUserId ? c.transporter_id : c.customer_id,
      );

      const { data: profiles } =
        otherIds.length > 0
          ? await supabase
              .from("public_profiles")
              .select("id, full_name, avatar_url")
              .in("id", otherIds)
          : { data: [] };

      const profileById = new Map(
        (profiles ?? []).map((p) => [p.id, p as OtherProfile] as const),
      );

      const lastMsgs = await Promise.all(
        list.map((c) =>
          supabase
            .from("messages")
            .select("body")
            .eq("conversation_id", c.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle()
            .then((r) => r.data?.body ?? null),
        ),
      );

      const enriched: ConvView[] = list.map((c, idx) => {
        const otherId =
          c.customer_id === currentUserId ? c.transporter_id : c.customer_id;
        const unread =
          c.customer_id === currentUserId
            ? c.customer_unread_count
            : c.transporter_unread_count;
        return {
          id: c.id,
          other: profileById.get(otherId) ?? null,
          unread,
          lastMessageAt: c.last_message_at,
          lastMessageBody: lastMsgs[idx],
        };
      });

      if (mounted) {
        setConvs(enriched);
        setTotalUnread(enriched.reduce((a, c) => a + c.unread, 0));
      }
    }

    void load();

    const channel = supabase
      .channel("chat-fab")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        () => void load(),
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => void load(),
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [currentUserId, hidden]);

  // Dış tıklamada kapat
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (hidden) return null;

  return (
    <div
      ref={popoverRef}
      className="pointer-events-none fixed inset-x-0 bottom-20 z-30 md:bottom-6"
    >
      <div className="mx-auto flex max-w-2xl items-end justify-end px-4">
        {/* Popover */}
        {open ? (
          <div className="pointer-events-auto absolute bottom-14 right-4 w-[min(360px,calc(100vw-2rem))] origin-bottom-right overflow-hidden rounded-3xl border border-chalk bg-white shadow-[0_20px_60px_-20px_rgba(17,17,17,0.25)]">
            <div className="flex items-center justify-between border-b border-chalk bg-eggshell px-4 py-3">
              <h3 className="font-display text-[16px]">Mesajlar</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Kapat"
                className="grid size-7 place-items-center rounded-full hover:bg-chalk/40"
              >
                <X className="size-3.5" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {convs.length === 0 ? (
                <div className="px-4 py-8 text-center text-[13px] text-gravel">
                  Henüz konuşma yok 🐾
                </div>
              ) : (
                <ul>
                  {convs.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/mesajlar/${c.id}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 border-b border-chalk px-4 py-3 transition last:border-b-0 hover:bg-powder"
                      >
                        <Avatar className="size-10 shrink-0 border border-chalk">
                          {c.other?.avatar_url ? (
                            <AvatarImage
                              src={c.other.avatar_url}
                              alt={c.other.full_name ?? "Kullanıcı"}
                            />
                          ) : null}
                          <AvatarFallback className="bg-powder text-[12px] font-medium">
                            {initials(c.other?.full_name ?? "?")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-[13px] font-medium">
                              {c.other?.full_name ?? "Kullanıcı"}
                            </span>
                            <span className="shrink-0 text-[10px] text-gravel">
                              {timeAgo(c.lastMessageAt)}
                            </span>
                          </div>
                          <p
                            className={cn(
                              "mt-0.5 truncate text-[12px]",
                              c.unread > 0
                                ? "font-medium text-obsidian"
                                : "text-gravel",
                            )}
                          >
                            {c.lastMessageBody ?? "Henüz mesaj yok"}
                          </p>
                        </div>
                        {c.unread > 0 ? (
                          <span className="grid size-5 shrink-0 place-items-center rounded-full bg-paw text-[10px] font-bold text-obsidian">
                            {c.unread}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="border-t border-chalk bg-eggshell px-4 py-2 text-center">
              <Link
                href="/mesajlar"
                onClick={() => setOpen(false)}
                className="text-[12px] text-signal hover:underline"
              >
                Tüm mesajlar →
              </Link>
            </div>
          </div>
        ) : null}

        {/* FAB butonu */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={`Mesajlar${totalUnread > 0 ? ` (${totalUnread} okunmamış)` : ""}`}
          className="pointer-events-auto relative grid size-12 place-items-center rounded-full bg-obsidian text-eggshell shadow-[0_8px_24px_-8px_rgba(17,17,17,0.5)] transition hover:bg-obsidian/85"
        >
          <MessageCircle className="size-5" />
          {totalUnread > 0 ? (
            <span
              aria-hidden
              className="absolute -right-1 -top-1 grid min-w-[20px] place-items-center rounded-full border-2 border-eggshell bg-paw px-1 text-[10px] font-bold text-obsidian"
            >
              {totalUnread > 99 ? "99+" : totalUnread}
            </span>
          ) : null}
        </button>
      </div>
    </div>
  );
}

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "şimdi";
  if (m < 60) return `${m}dk`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}sa`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}g`;
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
  });
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
