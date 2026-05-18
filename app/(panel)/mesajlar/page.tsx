import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireOnboardedUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Mesajlar — Patiyolu" };

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "şimdi";
  if (m < 60) return `${m} dk`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} sa`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} gün`;
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
  });
}

export default async function MessagesPage() {
  const user = await requireOnboardedUser();
  const supabase = await createClient();

  const { data: convsRaw } = await supabase
    .from("conversations")
    .select(
      "id,listing_id,customer_id,transporter_id,booking_id,last_message_at,customer_unread_count,transporter_unread_count",
    )
    .or(`customer_id.eq.${user.id},transporter_id.eq.${user.id}`)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  const convs = convsRaw ?? [];

  if (convs.length === 0) {
    return (
      <div className="space-y-6">
        <header className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
            İletişim
          </span>
          <h1 className="font-display text-[28px] leading-tight">Mesajlar</h1>
        </header>

        <div className="grid place-items-center rounded-3xl border border-chalk bg-powder/40 px-6 py-16 text-center">
          <div className="grid size-14 place-items-center rounded-2xl bg-white">
            <MessageCircle className="size-6 text-gravel" />
          </div>
          <h2 className="mt-4 font-display text-[20px]">
            Henüz konuşma yok 🐾
          </h2>
          <p className="mt-1 max-w-sm text-[13px] text-gravel">
            Bir teklif kabul edilince taşıyıcı ile arandaki konuşma burada
            açılacak.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button
              variant="pill"
              size="sm"
              render={<Link href="/musteri/ilanlarim" />}
            >
              İlanlarım
            </Button>
            <Button
              variant="pill-outline"
              size="sm"
              render={<Link href="/tasiyici/ilanlar" />}
            >
              İlan keşfet
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const otherIds = convs.map((c) =>
    c.customer_id === user.id ? c.transporter_id : c.customer_id,
  );
  const { data: profiles } = await supabase
    .from("public_profiles")
    .select("id,full_name,avatar_url,city")
    .in("id", otherIds);
  const profileById = new Map(
    (profiles ?? []).map((p) => [p.id, p] as const),
  );

  const lastMsgs = await Promise.all(
    convs.map((c) =>
      supabase
        .from("messages")
        .select("body,created_at,sender_id")
        .eq("conversation_id", c.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
        .then((r) => r.data),
    ),
  );

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
          İletişim
        </span>
        <h1 className="font-display text-[28px] leading-tight">Mesajlar</h1>
      </header>

      <ul className="space-y-2">
        {convs.map((c, idx) => {
          const otherId =
            c.customer_id === user.id ? c.transporter_id : c.customer_id;
          const other = profileById.get(otherId);
          const unread =
            user.id === c.customer_id
              ? c.customer_unread_count
              : c.transporter_unread_count;
          const last = lastMsgs[idx];
          return (
            <li key={c.id}>
              <Link
                href={`/mesajlar/${c.id}`}
                className="flex items-center gap-3 rounded-3xl border border-chalk bg-white p-4 transition hover:border-foreground/40"
              >
                <div className="grid size-11 shrink-0 place-items-center rounded-full bg-paw/20 font-display text-[18px]">
                  {other?.full_name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-display text-[16px] leading-none">
                      {other?.full_name ?? "Kullanıcı"}
                    </span>
                    <span className="shrink-0 text-[11px] text-gravel">
                      {timeAgo(c.last_message_at)}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[13px] text-gravel">
                    {last?.body ?? "Henüz mesaj yok"}
                  </p>
                </div>
                {unread > 0 ? (
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-foreground text-[10px] font-medium text-eggshell">
                    {unread}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
