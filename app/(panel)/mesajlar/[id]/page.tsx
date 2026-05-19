import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireOnboardedUser } from "@/lib/auth";
import { ChatRoom } from "@/components/chat/ChatRoom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = { title: "Konuşma — Patiyolu" };
export const dynamic = "force-dynamic";

export default async function ChatDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await requireOnboardedUser();
  const supabase = await createClient();

  const { data: conv } = await supabase
    .from("conversations")
    .select("id,listing_id,customer_id,transporter_id,booking_id")
    .eq("id", id)
    .maybeSingle();
  if (!conv) notFound();
  if (conv.customer_id !== user.id && conv.transporter_id !== user.id) {
    notFound();
  }

  const otherId =
    conv.customer_id === user.id ? conv.transporter_id : conv.customer_id;

  const [otherRes, messagesRes, listingRes] = await Promise.all([
    supabase
      .from("public_profiles")
      .select("id, full_name, avatar_url, city")
      .eq("id", otherId)
      .maybeSingle(),
    supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: true })
      .limit(200),
    conv.listing_id
      ? supabase
          .from("listings")
          .select("pickup_city,dropoff_city")
          .eq("id", conv.listing_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const other = otherRes.data;
  const messages = messagesRes.data;
  const listing = listingRes.data;

  const otherName = other?.full_name ?? "Kullanıcı";
  const bookingHref = conv.booking_id
    ? conv.customer_id === user.id
      ? `/musteri/booking/${conv.booking_id}`
      : `/tasiyici/booking/${conv.booking_id}`
    : null;

  return (
    <div className="space-y-4">
      <Link
        href="/mesajlar"
        className="inline-flex items-center gap-1 text-[12px] text-gravel hover:text-obsidian"
      >
        <ArrowLeft className="size-3.5" /> Mesajlar
      </Link>

      <header className="flex items-center gap-3 rounded-3xl border border-chalk bg-white px-3 py-3">
        <Link
          href={`/u/${otherId}`}
          className="group flex min-w-0 flex-1 items-center gap-3 hover:opacity-90"
        >
          <Avatar className="size-12 shrink-0 border border-chalk">
            {other?.avatar_url ? (
              <AvatarImage src={other.avatar_url} alt={otherName} />
            ) : null}
            <AvatarFallback className="bg-paw/20 text-[14px] font-medium text-obsidian">
              {initials(otherName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="truncate font-display text-[17px] leading-tight group-hover:underline">
                {otherName}
              </span>
              <ChevronRight className="size-3.5 text-gravel transition group-hover:translate-x-0.5 group-hover:text-obsidian" />
            </div>
            {listing ? (
              <div className="mt-0.5 truncate text-[11px] text-gravel">
                {listing.pickup_city ?? "Alış"} → {listing.dropoff_city ?? "Varış"}
              </div>
            ) : other?.city ? (
              <div className="mt-0.5 truncate text-[11px] text-gravel">
                {other.city}
              </div>
            ) : null}
          </div>
        </Link>
        {bookingHref ? (
          <Link
            href={bookingHref}
            className="shrink-0 rounded-pill border border-chalk px-3 py-1 text-[11px] hover:bg-powder"
          >
            Rezervasyon
          </Link>
        ) : null}
      </header>

      <ChatRoom
        conversationId={conv.id}
        currentUserId={user.id}
        initialMessages={messages ?? []}
      />
    </div>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
