"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInAction } from "@/app/(auth)/actions";
import { signInSchema, type SignInInput } from "@/lib/validations/auth";

export function SignInForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [topError, setTopError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(data: SignInInput) {
    setTopError(null);
    startTransition(async () => {
      const result = await signInAction(data);
      if (!result.ok) {
        setTopError(result.error ?? "Giriş başarısız");
        toast.error(result.error ?? "Giriş başarısız");
        return;
      }
      toast.success("Hoş geldin!");
      router.push("/panel");
      router.refresh();
    });
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

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-[12px] text-gravel">
            Şifre
          </Label>
          <Link
            href="/sifre-sifirla"
            className="text-[11px] text-gravel underline decoration-chalk underline-offset-2 hover:text-obsidian"
          >
            Unuttum
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password?.message ? (
          <p className="text-[12px] text-danger">{errors.password.message}</p>
        ) : null}
      </div>

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
        {pending ? "Giriş yapılıyor…" : "Giriş yap"}
      </Button>
    </form>
  );
}
