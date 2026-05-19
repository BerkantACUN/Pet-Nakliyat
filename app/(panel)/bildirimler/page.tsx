import Link from "next/link";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireOnboardedUser } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MarkAllReadButton } from "@/components/notifications/MarkAllReadButton";
import { renderNotification, type NotificationWithActor } from "@/lib/notifications";

export const metadata = { title: "Bildirimler · Patiyolu" };
export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await requireOnboardedUser();
  const supabase = await createClient();

  const { data: notifs } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(60);

  const list = notifs ?? [];
  const actorIds = Array.from(
    new Set(list.map((n) => n.actor_id).filter((id): id is string => !!id)),
  );

  const { data: actors } =
    actorIds.length > 0
      ? await supabase
          .from("public_profiles")
          .select("id, full_name, avatar_url")
          .in("id", actorIds)
      : { data: [] };

  const actorById = new Map(
    (actors ?? []).map((a) => [
      a.id!,
      { id: a.id!, full_name: a.full_name ?? "Kullanıcı", avatar_url: a.avatar_url },
    ]),
  );

  const enriched: NotificationWithActor[] = list.map((n) => ({
    ...n,
    actor: n.actor_id ? actorById.get(n.actor_id) ?? null : null,
  }));

  const unread = enriched.filter((n) => !n.read_at).length;

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
            iletişim
          </span>
          <h1 className="font-display text-[28px] leading-tight">
            Bildirimler
          </h1>
        </div>
        {unread > 0 ? <MarkAllReadButton /> : null}
      </header>

      {enriched.length === 0 ? (
        <div className="grid place-items-center rounded-3xl border border-dashed border-chalk bg-powder/40 px-6 py-16 text-center">
          <div className="grid size-14 place-items-center rounded-2xl bg-white">
            <Bell className="size-6 text-gravel" />
          </div>
          <h2 className="mt-4 font-display text-[20px]">Sessiz patiler</h2>
          <p className="mt-1 max-w-sm text-[13px] text-gravel">
            Yeni teklif, mesaj, takipçi veya yorum gelince burada görünecek.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {enriched.map((n) => (
            <NotificationItem key={n.id} n={n} />
          ))}
        </ul>
      )}
    </div>
  );
}

function NotificationItem({ n }: { n: NotificationWithActor }) {
  const view = renderNotification(n);
  const unread = !n.read_at;
  const ago = timeAgo(n.created_at);

  return (
    <li>
      <Link
        href={view.href}
        className={`flex items-start gap-3 rounded-3xl border p-4 transition hover:bg-powder ${
          unread ? "border-paw/40 bg-paw/5" : "border-chalk bg-white"
        }`}
      >
        {n.actor ? (
          <Avatar className="size-10 shrink-0 border border-chalk">
            {n.actor.avatar_url ? (
              <AvatarImage src={n.actor.avatar_url} alt={n.actor.full_name} />
            ) : null}
            <AvatarFallback className="bg-powder text-[12px] font-medium">
              {initials(n.actor.full_name)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-powder text-[18px]">
            {view.emoji}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[14px] leading-snug">
              <span aria-hidden className="mr-1">
                {view.emoji}
              </span>
              {view.title}
            </p>
            {unread ? (
              <span className="mt-1 size-2 shrink-0 rounded-full bg-paw" aria-hidden />
            ) : null}
          </div>
          {view.body ? (
            <p className="mt-0.5 line-clamp-2 text-[12px] text-gravel">
              {view.body}
            </p>
          ) : null}
          <p className="mt-1 text-[10px] text-gravel">{ago}</p>
        </div>
      </Link>
    </li>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "şimdi";
  if (m < 60) return `${m} dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} sa önce`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} gün önce`;
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
