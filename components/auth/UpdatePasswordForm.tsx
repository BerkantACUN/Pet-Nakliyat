"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePasswordAction } from "@/app/(auth)/actions";
import {
  updatePasswordSchema,
  type UpdatePasswordInput,
} from "@/lib/validations/auth";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: "", passwordConfirm: "" },
  });

  function onSubmit(data: UpdatePasswordInput) {
    startTransition(async () => {
      const result = await updatePasswordAction(data);
      if (!result.ok) {
        toast.error(result.error ?? "Şifre güncellenemedi");
        return;
      }
      setDone(true);
      toast.success("Şifren güncellendi 🐾");
      setTimeout(() => router.push("/panel"), 1200);
    });
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-chalk bg-eggshell p-5 text-center">
        <div className="text-3xl" aria-hidden>
          ✅
        </div>
        <p className="mt-3 text-[14px] leading-6 text-gravel">
          Şifren değişti. Panele yönlendiriyorum…
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-[12px] text-gravel">
          Yeni şifre
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password?.message ? (
          <p className="text-[12px] text-danger">{errors.password.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="passwordConfirm" className="text-[12px] text-gravel">
          Yeni şifre (tekrar)
        </Label>
        <Input
          id="passwordConfirm"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.passwordConfirm}
          {...register("passwordConfirm")}
        />
        {errors.passwordConfirm?.message ? (
          <p className="text-[12px] text-danger">
            {errors.passwordConfirm.message}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        variant="pill"
        size="lg"
        className="w-full"
        disabled={pending}
      >
        {pending ? "Kaydediliyor…" : "Şifreyi güncelle"}
      </Button>
    </form>
  );
}
