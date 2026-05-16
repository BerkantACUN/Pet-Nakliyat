"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  signContractAction,
  type SignContractInput,
} from "@/app/(panel)/sozlesme/actions";

interface ContractSignFormProps {
  templateId: string;
  defaultFullName: string;
  children: ReactNode;
}

export function ContractSignForm({
  templateId,
  defaultFullName,
  children,
}: ContractSignFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [reachedEnd, setReachedEnd] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<SignContractInput>({
    defaultValues: {
      templateId,
      fullName: defaultFullName,
      consent: false,
    },
  });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function check() {
      const target = scrollRef.current;
      if (!target) return;
      const remaining =
        target.scrollHeight - target.scrollTop - target.clientHeight;
      if (remaining < 24) setReachedEnd(true);
    }

    check();
    el.addEventListener("scroll", check, { passive: true });
    return () => el.removeEventListener("scroll", check);
  }, []);

  function onSubmit(data: SignContractInput) {
    startTransition(async () => {
      const result = await signContractAction({ ...data, templateId });
      if (!result.ok) {
        if (result.fieldErrors) {
          for (const [key, msg] of Object.entries(result.fieldErrors)) {
            setError(key as keyof SignContractInput, { message: msg });
          }
        }
        toast.error(result.error ?? "İmza kaydedilemedi");
        return;
      }
      toast.success("Sözleşme imzalandı 🐾 Tebrikler!");
      router.refresh();
      router.push("/tasiyici/kyc");
    });
  }

  const consent = watch("consent");
  const fullName = watch("fullName");

  return (
    <div className="space-y-5">
      <div
        ref={scrollRef}
        className="max-h-[60vh] overflow-y-auto rounded-3xl border border-border bg-background px-5 py-6 shadow-sm sm:max-h-[65vh] sm:px-8 sm:py-8"
      >
        {children}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <input type="hidden" {...register("templateId")} />

        {!reachedEnd ? (
          <div className="rounded-2xl bg-powder/70 p-4 text-[13px] text-gravel">
            Sözleşmeyi imzalayabilmek için lütfen önce metni sonuna kadar oku 📜
          </div>
        ) : (
          <div className="rounded-2xl bg-clover/15 p-4 text-[13px] text-foreground">
            Tamamını okudun ✨ Aşağıdaki alanları doldurup imzalayabilirsin.
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-[12px] text-gravel">
            Ad-soyad (kimliğinde yazıldığı gibi)
          </Label>
          <Input
            id="fullName"
            autoComplete="name"
            placeholder="Örn. Berkant Acun"
            disabled={!reachedEnd}
            aria-invalid={!!errors.fullName}
            {...register("fullName")}
          />
          {errors.fullName?.message ? (
            <p className="text-[12px] text-danger">{errors.fullName.message}</p>
          ) : null}
        </div>

        <label
          className={`flex cursor-pointer items-start gap-3 rounded-2xl border border-border px-4 py-3 text-[13px] leading-6 transition-colors ${
            reachedEnd ? "hover:bg-muted/50" : "opacity-60"
          }`}
        >
          <input
            type="checkbox"
            className="mt-1 size-4 accent-foreground"
            disabled={!reachedEnd}
            {...register("consent")}
          />
          <span className="text-muted-foreground">
            Sözleşmenin tamamını okudum, anladım ve elektronik imzamla{" "}
            <strong className="text-foreground">kabul ediyorum</strong>. IP
            adresim, tarayıcı bilgim ve zaman damgam SHA-256 ile özetlenerek
            delil amaçlı kaydedilecek.
          </span>
        </label>
        {errors.consent?.message ? (
          <p className="-mt-2 text-[12px] text-danger">{errors.consent.message}</p>
        ) : null}

        <Button
          type="submit"
          variant="pill"
          size="lg"
          className="w-full"
          disabled={pending || !reachedEnd || !consent || !fullName?.trim()}
        >
          {pending ? "İmzalanıyor…" : "Sözleşmeyi imzalıyorum 🐾"}
        </Button>
      </form>
    </div>
  );
}
