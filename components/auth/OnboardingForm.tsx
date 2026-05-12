"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { completeOnboardingAction } from "@/app/(auth)/profile-actions";
import {
  onboardingSchema,
  type OnboardingInput,
} from "@/lib/validations/profile";
import { cn } from "@/lib/utils";

const ROLE_OPTIONS: Array<{
  value: OnboardingInput["defaultRole"];
  emoji: string;
  title: string;
  body: string;
  disabled?: boolean;
  badge?: string;
}> = [
  {
    value: "customer",
    emoji: "🐾",
    title: "Müşteri",
    body: "İlan açıp tüylü dostumu yolluyorum.",
  },
  {
    value: "transporter",
    emoji: "🚐",
    title: "Taşıyıcı",
    body: "KYC + sözleşmeyle ek gelir.",
  },
  {
    value: "sitter",
    emoji: "🏠",
    title: "Bakıcı",
    body: "2 saatlik bakım.",
    disabled: true,
    badge: "yakında",
  },
  {
    value: "vet",
    emoji: "🏥",
    title: "Veteriner",
    body: "Klinik / kampanya.",
    disabled: true,
    badge: "yakında",
  },
];

export function OnboardingForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      phone: "",
      city: "",
      defaultRole: "customer",
      marketingConsent: false,
    },
  });

  const selectedRole = watch("defaultRole");

  function onSubmit(data: OnboardingInput) {
    startTransition(async () => {
      const result = await completeOnboardingAction(data);
      if (!result.ok) {
        if (result.fieldErrors) {
          for (const [key, msg] of Object.entries(result.fieldErrors)) {
            setError(key as keyof OnboardingInput, { message: msg });
          }
        }
        toast.error(result.error ?? "Form'da hata var");
        return;
      }
      toast.success("Hoş geldin! Profilin hazır.");
      router.push("/panel");
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
      noValidate
    >
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-[12px] text-gravel">
            Cep telefonu
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="05XX XXX XX XX"
            inputMode="tel"
            autoComplete="tel"
            aria-invalid={!!errors.phone}
            {...register("phone")}
          />
          {errors.phone?.message ? (
            <p className="text-[12px] text-danger">{errors.phone.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="city" className="text-[12px] text-gravel">
            Şehir
          </Label>
          <Input
            id="city"
            placeholder="İstanbul"
            autoComplete="address-level2"
            aria-invalid={!!errors.city}
            {...register("city")}
          />
          {errors.city?.message ? (
            <p className="text-[12px] text-danger">{errors.city.message}</p>
          ) : null}
        </div>
      </div>

      <div>
        <div className="mb-2 text-[12px] text-gravel">Başlangıç rolün</div>
        <div className="grid gap-2">
          {ROLE_OPTIONS.map((opt) => {
            const active = selectedRole === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                disabled={opt.disabled}
                onClick={() =>
                  !opt.disabled &&
                  setValue("defaultRole", opt.value, { shouldValidate: true })
                }
                className={cn(
                  "flex items-center gap-3 rounded-2xl border bg-white p-3 text-left transition",
                  active
                    ? "border-obsidian shadow-[inset_0_0_0_1px_var(--color-obsidian)]"
                    : "border-chalk hover:border-fog",
                  opt.disabled && "cursor-not-allowed opacity-50",
                )}
              >
                <span className="text-2xl" aria-hidden>
                  {opt.emoji}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-medium">{opt.title}</span>
                    {opt.badge ? (
                      <span className="rounded-full bg-powder px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-gravel">
                        {opt.badge}
                      </span>
                    ) : null}
                  </div>
                  <div className="text-[12px] text-gravel">{opt.body}</div>
                </div>
                <span
                  className={cn(
                    "size-4 shrink-0 rounded-full border-2 transition",
                    active ? "border-obsidian bg-obsidian" : "border-chalk",
                  )}
                  aria-hidden
                />
              </button>
            );
          })}
        </div>
        {errors.defaultRole?.message ? (
          <p className="mt-2 text-[12px] text-danger">
            {errors.defaultRole.message}
          </p>
        ) : null}
      </div>

      <label className="flex items-start gap-3 text-[12px] leading-5 text-gravel">
        <input
          type="checkbox"
          className="mt-0.5 size-4 cursor-pointer accent-obsidian"
          {...register("marketingConsent")}
        />
        <span>
          Pati yolculuğu ile ilgili kampanya ve bildirimleri almak istiyorum.
        </span>
      </label>

      <Button
        type="submit"
        variant="pill"
        size="lg"
        className="w-full"
        disabled={pending}
      >
        {pending ? "Kaydediliyor…" : "Hazırım, devam et"}
      </Button>
    </form>
  );
}
