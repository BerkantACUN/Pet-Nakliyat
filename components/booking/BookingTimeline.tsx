import { Check, CircleDot, MapPin, Package } from "lucide-react";
import type { BookingStatus } from "@/lib/supabase/types";

const STEPS: Array<{ key: BookingStatus | "any"; label: string; icon: typeof Check }> = [
  { key: "pending_payment", label: "Ödeme bekleniyor", icon: Package },
  { key: "accepted", label: "Anlaşma onaylandı", icon: Check },
  { key: "en_route", label: "Yolda", icon: MapPin },
  { key: "delivered", label: "Teslim edildi", icon: CircleDot },
  { key: "completed", label: "Tamamlandı", icon: Check },
];

const ORDER: BookingStatus[] = [
  "pending_payment",
  "accepted",
  "en_route",
  "delivered",
  "completed",
];

interface BookingTimelineProps {
  status: BookingStatus;
}

export function BookingTimeline({ status }: BookingTimelineProps) {
  if (status === "cancelled") {
    return (
      <div className="rounded-3xl border border-danger/20 bg-danger/5 p-4 text-center text-[13px] text-danger">
        Bu rezervasyon iptal edildi.
      </div>
    );
  }
  if (status === "disputed") {
    return (
      <div className="rounded-3xl border border-paw/30 bg-paw/10 p-4 text-center text-[13px] text-foreground">
        Bu rezervasyon için anlaşmazlık başlatıldı.
      </div>
    );
  }

  const currentIdx = ORDER.indexOf(status);

  return (
    <ol className="space-y-3">
      {STEPS.map((s, idx) => {
        const reached = idx <= currentIdx;
        const current = idx === currentIdx;
        const Icon = s.icon;
        return (
          <li key={s.key} className="flex items-start gap-3">
            <div
              className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full ${
                current
                  ? "bg-foreground text-eggshell"
                  : reached
                    ? "bg-clover/30 text-foreground"
                    : "bg-chalk text-gravel"
              }`}
            >
              <Icon className="size-3.5" />
            </div>
            <div className="flex-1 pt-0.5">
              <p
                className={`text-[14px] ${
                  reached ? "font-medium text-foreground" : "text-gravel"
                }`}
              >
                {s.label}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
