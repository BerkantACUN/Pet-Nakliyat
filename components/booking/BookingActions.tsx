"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  payBookingAction,
  markEnRouteAction,
  markDeliveredAction,
  markCompletedAction,
  cancelBookingAction,
} from "@/app/(panel)/musteri/booking/[id]/actions";
import type { BookingStatus } from "@/lib/supabase/types";

type Role = "customer" | "transporter";

interface BookingActionsProps {
  bookingId: string;
  status: BookingStatus;
  role: Role;
  agreedPriceLabel: string;
}

export function BookingActions({
  bookingId,
  status,
  role,
  agreedPriceLabel,
}: BookingActionsProps) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState<null | "cancel">(null);

  function run(action: () => Promise<{ ok: boolean; error?: string }>, okMsg: string) {
    startTransition(async () => {
      const res = await action();
      if (res.ok) toast.success(okMsg);
      else toast.error(res.error ?? "Bir şey ters gitti");
    });
  }

  if (status === "pending_payment" && role === "customer") {
    return (
      <div className="space-y-3">
        <Button
          variant="pill"
          size="lg"
          disabled={pending}
          onClick={() =>
            run(() => payBookingAction(bookingId), "Ödeme tamamlandı 🐾")
          }
          className="w-full"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>Ödeme yap · {agreedPriceLabel}</>
          )}
        </Button>
        <Button
          variant="pill-ghost"
          size="sm"
          disabled={pending}
          onClick={() => setConfirming("cancel")}
          className="w-full"
        >
          Vazgeç
        </Button>
        {confirming === "cancel" ? (
          <CancelConfirm
            bookingId={bookingId}
            onClose={() => setConfirming(null)}
          />
        ) : null}
      </div>
    );
  }

  if (status === "pending_payment" && role === "transporter") {
    return (
      <div className="rounded-3xl border border-chalk bg-powder/60 p-4 text-center text-[12px] text-gravel">
        Müşteri ödemeyi tamamladığında burada güncelleme göreceksin.
      </div>
    );
  }

  if (status === "accepted" && role === "transporter") {
    return (
      <Button
        variant="pill"
        size="lg"
        disabled={pending}
        onClick={() =>
          run(() => markEnRouteAction(bookingId), "Yolda olarak işaretlendi")
        }
        className="w-full"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : "Yola çıktım"}
      </Button>
    );
  }

  if (status === "accepted" && role === "customer") {
    return (
      <div className="rounded-3xl border border-chalk bg-powder/60 p-4 text-center text-[12px] text-gravel">
        Taşıyıcı yola çıktığında haber vereceğiz.
      </div>
    );
  }

  if (status === "en_route" && role === "transporter") {
    return (
      <Button
        variant="pill"
        size="lg"
        disabled={pending}
        onClick={() =>
          run(() => markDeliveredAction(bookingId), "Teslim olarak işaretlendi")
        }
        className="w-full"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : "Teslim ettim"}
      </Button>
    );
  }

  if (status === "en_route" && role === "customer") {
    return (
      <div className="rounded-3xl border border-chalk bg-powder/60 p-4 text-center text-[12px] text-gravel">
        Tüylü dostun yolda 🐾
      </div>
    );
  }

  if (status === "delivered" && role === "customer") {
    return (
      <Button
        variant="pill"
        size="lg"
        disabled={pending}
        onClick={() =>
          run(
            () => markCompletedAction(bookingId),
            "Tamamlandı! Değerlendirme yapabilirsin.",
          )
        }
        className="w-full"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          "Teslim aldım, onayla"
        )}
      </Button>
    );
  }

  if (status === "delivered" && role === "transporter") {
    return (
      <div className="rounded-3xl border border-chalk bg-powder/60 p-4 text-center text-[12px] text-gravel">
        Müşteri teslim aldığını onayladığında tamamlanacak.
      </div>
    );
  }

  if (status === "completed") {
    return (
      <div className="rounded-3xl border border-clover/30 bg-clover/10 p-4 text-center text-[12px] text-foreground">
        Bu rezervasyon başarıyla tamamlandı. Teşekkürler! 🐾
      </div>
    );
  }

  if (status === "cancelled") {
    return (
      <div className="rounded-3xl border border-danger/20 bg-danger/5 p-4 text-center text-[12px] text-danger">
        Bu rezervasyon iptal edildi.
      </div>
    );
  }

  return null;
}

function CancelConfirm({
  bookingId,
  onClose,
}: {
  bookingId: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-2 rounded-3xl border border-chalk bg-white p-4">
      <p className="text-[13px]">İptal nedenini kısa yaz:</p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={3}
        className="w-full rounded-2xl border border-chalk bg-eggshell p-3 text-[13px] focus:border-signal focus:outline-none"
        placeholder="Sebep…"
      />
      <div className="flex gap-2">
        <Button
          variant="destructive"
          size="sm"
          disabled={pending || reason.trim().length < 3}
          onClick={() =>
            startTransition(async () => {
              const res = await cancelBookingAction(bookingId, reason.trim());
              if (res.ok) {
                toast.success("İptal edildi");
                onClose();
              } else {
                toast.error(res.error ?? "Hata");
              }
            })
          }
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : "İptali onayla"}
        </Button>
        <Button variant="pill-ghost" size="sm" onClick={onClose}>
          Vazgeç
        </Button>
      </div>
    </div>
  );
}
