"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBidAction, type BidInput } from "@/app/(panel)/tasiyici/actions";
import { formatPriceTRY } from "@/lib/utils";

interface BidFormProps {
  listingId: string;
  estMin: number;
  estMax: number;
  onSuccess?: () => void;
}

export function BidForm({ listingId, estMin, estMax, onSuccess }: BidFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<BidInput>({
    defaultValues: {
      listingId,
      price: Math.round((estMin + estMax) / 2),
      etaHours: undefined,
      message: "",
    },
  });

  function onSubmit(data: BidInput) {
    startTransition(async () => {
      const result = await createBidAction({ ...data, listingId });
      if (!result.ok) {
        if (result.fieldErrors) {
          for (const [key, msg] of Object.entries(result.fieldErrors)) {
            setError(key as keyof BidInput, { message: msg });
          }
        }
        toast.error(result.error ?? "Teklif atılamadı");
        return;
      }
      toast.success("Teklif gönderildi 📨");
      onSuccess?.();
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="rounded-2xl bg-powder p-3 text-[11px] text-gravel">
        Müşterinin tahmini fiyat aralığı:{" "}
        <span className="font-medium text-obsidian">
          {formatPriceTRY(estMin)} – {formatPriceTRY(estMax)}
        </span>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="price" className="text-[12px] text-gravel">
          Fiyat teklifin (₺)
        </Label>
        <Input
          id="price"
          type="number"
          inputMode="numeric"
          step="50"
          aria-invalid={!!errors.price}
          {...register("price", { valueAsNumber: true })}
        />
        {errors.price?.message ? (
          <p className="text-[12px] text-danger">{errors.price.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="etaHours" className="text-[12px] text-gravel">
          Tahmini süre (saat, opsiyonel)
        </Label>
        <Input
          id="etaHours"
          type="number"
          inputMode="decimal"
          step="0.5"
          placeholder="örn. 8"
          aria-invalid={!!errors.etaHours}
          {...register("etaHours", { valueAsNumber: true })}
        />
        {errors.etaHours?.message ? (
          <p className="text-[12px] text-danger">{errors.etaHours.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message" className="text-[12px] text-gravel">
          Not (opsiyonel)
        </Label>
        <Textarea
          id="message"
          rows={3}
          placeholder="Klimalı van, ara mola, sigorta dahil…"
          {...register("message")}
        />
        {errors.message?.message ? (
          <p className="text-[12px] text-danger">{errors.message.message}</p>
        ) : null}
      </div>

      <Button
        type="submit"
        variant="pill"
        size="lg"
        className="w-full"
        disabled={pending}
      >
        {pending ? "Gönderiliyor…" : "Teklifi gönder"}
      </Button>
    </form>
  );
}
