"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordResetAction } from "@/app/(auth)/actions";
import {
  resetPasswordRequestSchema,
  type ResetPasswordRequestInput,
} from "@/lib/validations/auth";

export function ResetPasswordForm() {
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordRequestInput>({
    resolver: zodResolver(resetPasswordRequestSchema),
    defaultValues: { email: "" },
  });

  function onSubmit(data: ResetPasswordRequestInput) {
    startTransition(async () => {
      const result = await requestPasswordResetAction(data);
      if (!result.ok) {
        toast.error(result.error ?? "Bir şey yanlış gitti");
        return;
      }
      setSent(true);
      toast.success("E-posta yolda. Gelen kutunu kontrol et.");
    });
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-chalk bg-eggshell p-5 text-center">
        <div className="text-3xl" aria-hidden>📬</div>
        <p className="mt-3 text-[14px] leading-6 text-gravel">
          Şifre sıfırlama bağlantısı e-postana gönderildi. Spam klasörünü de
          kontrol etmeyi unutma.
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-[12px] text-gravel">
          E-posta
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email?.message ? (
          <p className="text-[12px] text-danger">{errors.email.message}</p>
        ) : null}
      </div>

      <Button
        type="submit"
        variant="pill"
        size="lg"
        className="w-full"
        disabled={pending}
      >
        {pending ? "Gönderiliyor…" : "Sıfırlama bağlantısı yolla"}
      </Button>
    </form>
  );
}
