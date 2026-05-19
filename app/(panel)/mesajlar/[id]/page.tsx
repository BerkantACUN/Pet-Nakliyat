import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireOnboardedUser } from "@/lib/auth";
import { ChatRoom } from "@/components/chat/ChatRoom";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = { title: "Konuşma — Patiyolu" };

export default async function ChatDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await requireOnboardedUser();
  const supabase = await createClient();

  const { data: conv } = await supabase
    .from("conversations")
    .select(
      "id,listing_id,customer_id,transporter_id,booking_id",
    )
    .eq("id", id)
    .maybeSingle();
  if (!conv) notFound();
  if (conv.customer_id !== user.id && conv.transporter_id !== user.id) {
    notFound();
  }

  const otherId =
    conv.customer_id === user.id ? conv.transporter_id : conv.customer_id;

  const listingPromise = conv.listing_id
    ? supabase
        .from("listings")
        .select("pickup_city,dropoff_city")
        .eq("id", conv.listing_id)
        .maybeSingle()
    : Promise.resolve({ data: null });

  const [{ data: other }, { data: messages }, { data: listing }] =
    await Promise.all([
      supabase
        .from("public_profiles")
        .select("full_name,city")
        .eq("id", otherId)
        .maybeSingle(),
      supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: true })
        .limit(200),
      listingPromise,
    ]);

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

      <header className="flex items-center justify-between gap-3 rounded-3xl border border-chalk bg-white px-4 py-3">
        <div className="min-w-0">
          <div className="truncate font-display text-[18px] leading-none">
            {other?.full_name ?? "Kullanıcı"}
          </div>
          {listing ? (
            <div className="mt-1 text-[11px] text-gravel">
              {listing.pickup_city ?? "Alış"} → {listing.dropoff_city ?? "Varış"}
            </div>
          ) : null}
        </div>
        {bookingHref ? (
          <Link
            href={bookingHref}
            className="rounded-pill border border-chalk px-3 py-1 text-[11px] hover:bg-powder"
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
