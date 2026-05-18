"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitReviewAction } from "@/app/(panel)/musteri/booking/[id]/review-actions";

interface ReviewFormProps {
  bookingId: string;
}

export function ReviewForm({ bookingId }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [pending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-3xl border border-clover/30 bg-clover/10 p-4 text-center text-[13px]">
        Değerlendirmen kaydedildi. Teşekkürler 🐾
      </div>
    );
  }

  function handleSubmit() {
    if (rating === 0) {
      toast.error("Önce yıldız seç");
      return;
    }
    startTransition(async () => {
      const res = await submitReviewAction({
        bookingId,
        rating,
        comment: comment.trim() || undefined,
      });
      if (res.ok) {
        setSubmitted(true);
        toast.success("Değerlendirme gönderildi");
      } else {
        toast.error(res.error ?? "Hata");
      }
    });
  }

  return (
    <div className="space-y-3 rounded-3xl border border-chalk bg-white p-5">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
          değerlendirme
        </div>
        <h3 className="mt-1 font-display text-[18px]">Nasıldı?</h3>
      </div>

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} yıldız`}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="rounded-full p-1 transition hover:scale-110"
          >
            <Star
              className={`size-7 ${
                (hover || rating) >= n
                  ? "fill-paw text-paw"
                  : "fill-transparent text-chalk"
              }`}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        maxLength={800}
        placeholder="Birkaç kelimeyle anlat (opsiyonel)…"
        className="w-full rounded-2xl border border-chalk bg-eggshell p-3 text-[13px] focus:border-signal focus:outline-none"
      />

      <Button
        variant="pill"
        size="lg"
        disabled={pending || rating === 0}
        onClick={handleSubmit}
        className="w-full"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          "Değerlendirmeyi gönder"
        )}
      </Button>
    </div>
  );
}
