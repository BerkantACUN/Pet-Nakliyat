import type { Notification, NotificationType } from "@/lib/supabase/types";

export interface NotificationActor {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

export interface NotificationWithActor extends Notification {
  actor: NotificationActor | null;
}

export interface NotificationView {
  title: string;
  body?: string;
  emoji: string;
  href: string;
}

export function renderNotification(
  n: NotificationWithActor,
): NotificationView {
  const actor = n.actor?.full_name ?? "Birisi";

  switch (n.type) {
    case "follow":
      return {
        emoji: "👋",
        title: `${actor} seni takip etmeye başladı`,
        href: n.actor ? `/u/${n.actor.id}` : "/bildirimler",
      };
    case "bid_received": {
      const price = getNumber(n.payload, "price");
      return {
        emoji: "💌",
        title: `${actor} ilanına teklif verdi`,
        body: price !== null ? `Teklif: ₺${price.toLocaleString("tr-TR")}` : undefined,
        href: n.related_listing ? `/musteri/${n.related_listing}` : "/bildirimler",
      };
    }
    case "bid_accepted":
      return {
        emoji: "🎉",
        title: "Teklifin kabul edildi",
        body: "Müşteri ödemeyi tamamladığında booking aktifleşir.",
        href: n.related_listing
          ? `/tasiyici/ilanlar/${n.related_listing}`
          : "/tasiyici/tekliflerim",
      };
    case "bid_rejected":
      return {
        emoji: "✖️",
        title: "Teklifin reddedildi",
        href: n.related_listing
          ? `/tasiyici/ilanlar/${n.related_listing}`
          : "/tasiyici/tekliflerim",
      };
    case "message": {
      const preview = getString(n.payload, "preview");
      return {
        emoji: "💬",
        title: `${actor} mesaj attı`,
        body: preview ?? undefined,
        href: n.related_conversation
          ? `/mesajlar/${n.related_conversation}`
          : "/mesajlar",
      };
    }
    case "booking_update":
      return {
        emoji: "📦",
        title: "Booking durumun güncellendi",
        href: n.related_booking
          ? `/musteri/booking/${n.related_booking}`
          : "/bildirimler",
      };
    case "review_received": {
      const rating = getNumber(n.payload, "rating");
      return {
        emoji: "⭐",
        title: `${actor} sana yorum yazdı`,
        body: rating !== null ? `${rating} yıldız` : undefined,
        href: n.actor ? `/u/${n.actor.id}` : "/bildirimler",
      };
    }
    case "post_like":
      return {
        emoji: "❤️",
        title: `${actor} paylaşımını beğendi`,
        href: n.actor ? `/u/${n.actor.id}` : "/bildirimler",
      };
    case "post_comment": {
      const preview = getString(n.payload, "preview");
      return {
        emoji: "💭",
        title: `${actor} paylaşımına yorum yazdı`,
        body: preview ?? undefined,
        href: n.actor ? `/u/${n.actor.id}` : "/bildirimler",
      };
    }
    default:
      return {
        emoji: "🔔",
        title: "Yeni bildirim",
        href: "/bildirimler",
      };
  }
}

function getNumber(payload: unknown, key: string): number | null {
  if (!payload || typeof payload !== "object") return null;
  const v = (payload as Record<string, unknown>)[key];
  return typeof v === "number" ? v : null;
}

function getString(payload: unknown, key: string): string | null {
  if (!payload || typeof payload !== "object") return null;
  const v = (payload as Record<string, unknown>)[key];
  return typeof v === "string" ? v : null;
}

export type { NotificationType };
