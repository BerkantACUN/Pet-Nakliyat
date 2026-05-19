"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AddressAutocomplete } from "@/components/map/AddressAutocomplete";
import {
  listingDraftSchema,
  type ListingDraftInput,
} from "@/lib/validations/listing";
import { createListingDraftAction } from "@/app/(panel)/musteri/ilan-olustur/actions";
import { quote, type Urgency } from "@/lib/pricing";
import { formatPriceTRY, formatDistanceKm, cn } from "@/lib/utils";
import type { Pet } from "@/lib/supabase/types";

const URGENCY_OPTIONS: Array<{
  value: Urgency;
  label: string;
  desc: string;
  emoji: string;
}> = [
  { value: "standard", label: "Standart", desc: "Esnek tarih, normal fiyat", emoji: "🐾" },
  { value: "express", label: "Express", desc: "24 saat, +%30", emoji: "⚡" },
  { value: "sameday", label: "Aynı gün", desc: "Bugün yola çıkış, +%60", emoji: "🚀" },
];

interface ListingFormProps {
  pets: Pet[];
}

export function ListingForm({ pets }: ListingFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedPetId, setSelectedPetId] = useState<string>(pets[0]?.id ?? "");
  const [topError, setTopError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ListingDraftInput>({
    resolver: zodResolver(listingDraftSchema),
    defaultValues: {
      petId: pets[0]?.id ?? "",
      pickup: { address: "", lat: 0, lng: 0, city: null },
      dropoff: { address: "", lat: 0, lng: 0, city: null },
      scheduledAt: defaultScheduledAt(),
      urgency: "standard",
      notes: "",
      careNotes: "",
      feedingDuringTransit: false,
      carrierProvided: "",
      temperaturePreference: "",
    },
  });

  const pickup = watch("pickup");
  const dropoff = watch("dropoff");
  const urgency = watch("urgency");
  const petId = watch("petId");

  const pet = pets.find((p) => p.id === petId) ?? pets[0];

  // Anlık tahmini fiyat (haversine yaklaşıklık — gerçek hesap server-side)
  const estimate = useMemo(() => {
    if (!pickup?.address || !dropoff?.address) return null;
    if (!pickup.lat || !dropoff.lat) return null;
    const dist = haversine(
      pickup.lat,
      pickup.lng,
      dropoff.lat,
      dropoff.lng,
    );
    return {
      ...quote({
        distanceKm: dist,
        baseRatePerKm: 8,
        minCharge: 350,
        urgency,
        weightKg: pet?.weight_kg ?? 10,
      }),
      distanceKm: dist,
    };
  }, [pickup, dropoff, urgency, pet?.weight_kg]);

  function onSubmit(data: ListingDraftInput) {
    setTopError(null);
    startTransition(async () => {
      const result = await createListingDraftAction(data);
      if (!result.ok) {
        if (result.fieldErrors) {
          for (const [key, msg] of Object.entries(result.fieldErrors)) {
            setError(key as keyof ListingDraftInput, { message: msg });
          }
        }
        setTopError(result.error ?? "Form'da hata var");
        toast.error(result.error ?? "Form'da hata var");
        return;
      }
      toast.success("İlanın taslak olarak kaydedildi");
      router.push(`/musteri/${result.id}`);
      router.refresh();
    });
  }

  if (pets.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-chalk bg-powder p-6 text-center">
        <div className="text-3xl" aria-hidden>🐾</div>
        <p className="mt-3 text-[14px] text-gravel">
          İlan açmak için önce bir pet eklemen lazım.
        </p>
        <Button
          variant="pill"
          size="lg"
          className="mt-4"
          render={<Link href="/musteri/petlerim" />}
        >
          <Plus className="size-3.5" /> Pet ekle
        </Button>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Pet seç */}
      <Section title="Pet" hint="Yolculuğa kim çıkıyor?">
        <div className="grid gap-2">
          {pets.map((p) => {
            const active = selectedPetId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelectedPetId(p.id);
                  setValue("petId", p.id, { shouldValidate: true });
                }}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border bg-white p-3 text-left transition",
                  active
                    ? "border-obsidian shadow-[inset_0_0_0_1px_var(--color-obsidian)]"
                    : "border-chalk hover:border-fog",
                )}
              >
                <span className="text-2xl" aria-hidden>
                  {speciesEmoji(p.species)}
                </span>
                <div className="flex-1">
                  <div className="text-[14px] font-medium">{p.name}</div>
                  <div className="text-[11px] text-gravel">
                    {[p.breed, p.weight_kg ? `${p.weight_kg} kg` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                </div>
                <span
                  aria-hidden
                  className={cn(
                    "size-4 rounded-full border-2 transition",
                    active ? "border-obsidian bg-obsidian" : "border-chalk",
                  )}
                />
              </button>
            );
          })}
        </div>
        {errors.petId?.message ? (
          <p className="mt-2 text-[12px] text-danger">{errors.petId.message}</p>
        ) : null}
      </Section>

      {/* Adresler */}
      <Section title="Adresler" hint="Nereden alalım, nereye götürelim?">
        <Controller
          name="pickup"
          control={control}
          render={({ field }) => (
            <AddressAutocomplete
              id="pickup"
              label="Alış adresi"
              value={field.value?.address ? field.value : null}
              onChange={(v) =>
                field.onChange(v ?? { address: "", lat: 0, lng: 0, city: null })
              }
              placeholder="örn. Kadıköy, İstanbul"
              error={errors.pickup?.address?.message}
            />
          )}
        />
        <Controller
          name="dropoff"
          control={control}
          render={({ field }) => (
            <AddressAutocomplete
              id="dropoff"
              label="Varış adresi"
              value={field.value?.address ? field.value : null}
              onChange={(v) =>
                field.onChange(v ?? { address: "", lat: 0, lng: 0, city: null })
              }
              placeholder="örn. Karşıyaka, İzmir"
              error={errors.dropoff?.address?.message}
            />
          )}
        />

        {estimate ? (
          <div className="mt-2 rounded-2xl bg-powder p-3 text-[12px] text-gravel">
            ~{formatDistanceKm(estimate.distanceKm)} ·{" "}
            {pickup.city ?? "—"} → {dropoff.city ?? "—"}
          </div>
        ) : null}
      </Section>

      {/* Tarih + acillik */}
      <Section title="Ne zaman?" hint="Tarih ve acillik">
        <div className="space-y-1.5">
          <Label htmlFor="scheduledAt" className="text-[12px] text-gravel">
            Tarih ve saat
          </Label>
          <Input
            id="scheduledAt"
            type="datetime-local"
            aria-invalid={!!errors.scheduledAt}
            {...register("scheduledAt")}
          />
          {errors.scheduledAt?.message ? (
            <p className="text-[12px] text-danger">
              {errors.scheduledAt.message}
            </p>
          ) : null}
        </div>

        <div className="mt-3 grid gap-2">
          {URGENCY_OPTIONS.map((o) => {
            const active = urgency === o.value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() =>
                  setValue("urgency", o.value, { shouldValidate: true })
                }
                className={cn(
                  "flex items-center gap-3 rounded-2xl border bg-white p-3 text-left transition",
                  active
                    ? "border-obsidian shadow-[inset_0_0_0_1px_var(--color-obsidian)]"
                    : "border-chalk hover:border-fog",
                )}
              >
                <span className="text-2xl" aria-hidden>{o.emoji}</span>
                <div className="flex-1">
                  <div className="text-[14px] font-medium">{o.label}</div>
                  <div className="text-[11px] text-gravel">{o.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Notlar */}
      <Section title="Not (opsiyonel)" hint="Özel istek, sağlık durumu, mizaç…">
        <Textarea rows={3} placeholder="Klimalı araç olsa harika olur…" {...register("notes")} />
        {errors.notes?.message ? (
          <p className="text-[12px] text-danger">{errors.notes.message}</p>
        ) : null}
      </Section>

      {/* Bakım tercihleri */}
      <Section title="Bakım tercihleri" hint="Taşıma sırasında dikkat edilecekler.">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-[12px] text-gravel" htmlFor="carrierProvided">
              Taşıma kafesi / sepeti
            </label>
            <select
              id="carrierProvided"
              className="w-full rounded-input border border-chalk bg-white px-3 py-2 text-[14px] outline-none focus-visible:border-signal"
              {...register("carrierProvided")}
            >
              <option value="">Belirtme…</option>
              <option value="customer">Ben sağlıyorum</option>
              <option value="transporter">Taşıyıcı sağlasın</option>
              <option value="none">Gerek yok</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] text-gravel" htmlFor="temperaturePreference">
              Sıcaklık tercihi
            </label>
            <select
              id="temperaturePreference"
              className="w-full rounded-input border border-chalk bg-white px-3 py-2 text-[14px] outline-none focus-visible:border-signal"
              {...register("temperaturePreference")}
            >
              <option value="">Belirtme…</option>
              <option value="cool">Serin (klima açık)</option>
              <option value="normal">Normal</option>
              <option value="warm">Sıcak / battaniyeli</option>
            </select>
          </div>

          <label className="flex items-center gap-2 rounded-2xl border border-chalk bg-white px-3 py-2.5 text-[13px] hover:bg-powder">
            <input
              type="checkbox"
              className="size-4 accent-obsidian"
              {...register("feedingDuringTransit")}
            />
            Yol sırasında beslenme molası verilsin
          </label>

          <div className="space-y-1.5">
            <label className="text-[12px] text-gravel" htmlFor="careNotes">
              Detaylı bakım talimatı
            </label>
            <Textarea
              id="careNotes"
              rows={3}
              placeholder="Mama saati, tuvalet ihtiyacı, ilaç…"
              {...register("careNotes")}
            />
            {errors.careNotes?.message ? (
              <p className="text-[12px] text-danger">{errors.careNotes.message}</p>
            ) : null}
          </div>
        </div>
      </Section>

      {/* Fiyat quote */}
      {estimate ? (
        <div className="rounded-3xl border border-chalk bg-eggshell p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
            tahmini fiyat
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-display text-[36px] leading-none">
              {formatPriceTRY(estimate.estMin)}
            </span>
            <span className="text-[14px] text-gravel">
              – {formatPriceTRY(estimate.estMax)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-gravel">
            {formatDistanceKm(estimate.distanceKm)} ·{" "}
            urgency ×{estimate.breakdown.urgencyMult.toFixed(2)} · weight ×
            {estimate.breakdown.weightMult.toFixed(2)} · intercity ×
            {estimate.breakdown.intercityMult.toFixed(2)}
          </div>
          <p className="mt-2 text-[11px] text-gravel">
            Yayın ücreti 49₺ ödendiğinde ilan teklif almaya açılır. Anlaşma
            tamamlandığında platform komisyonu %10.
          </p>
        </div>
      ) : null}

      {topError ? (
        <p className="rounded-xl bg-danger/10 px-3 py-2 text-[12px] text-danger">
          {topError}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="pill"
        size="lg"
        className="w-full"
        disabled={pending}
      >
        {pending ? "Kaydediliyor…" : "Taslağı kaydet"}
        <ArrowRight className="size-4" />
      </Button>
    </form>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-3xl border border-chalk bg-white p-5">
      <div>
        <h2 className="font-display text-[18px] leading-tight">{title}</h2>
        {hint ? <p className="text-[12px] text-gravel">{hint}</p> : null}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function defaultScheduledAt(): string {
  const d = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  d.setMinutes(0, 0, 0);
  d.setHours(10);
  // datetime-local format yyyy-MM-ddTHH:mm
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function haversine(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const greatCircle = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(greatCircle * 1.3 * 10) / 10;
}

function speciesEmoji(s: Pet["species"]): string {
  return { dog: "🐶", cat: "🐱", bird: "🐦", rabbit: "🐰", other: "🐾" }[s];
}
