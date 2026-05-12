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
import { signUpAction } from "@/app/(auth)/actions";
import { signUpSchema, type SignUpInput } from "@/lib/validations/auth";

export function SignUpForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [topError, setTopError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      passwordConfirm: "",
      kvkkConsent: false,
      marketingConsent: false,
    },
  });

  function onSubmit(data: SignUpInput) {
    setTopError(null);
    startTransition(async () => {
      const result = await signUpAction(data);
      if (!result.ok) {
        if (result.fieldErrors) {
          for (const [key, msg] of Object.entries(result.fieldErrors)) {
            setError(key as keyof SignUpInput, { message: msg });
          }
        }
        if (result.error) setTopError(result.error);
        toast.error(result.error ?? "Form'da hata var, gözden geçir.");
        return;
      }
      toast.success("Hesabın oluştu, e-postanı kontrol et.");
      router.push("/giris?yeni=1");
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Field
        id="fullName"
        label="Ad Soyad"
        error={errors.fullName?.message}
        autoComplete="name"
        placeholder="Mela Alonsra"
        {...register("fullName")}
      />
      <Field
        id="email"
        type="email"
        label="E-posta"
        error={errors.email?.message}
        autoComplete="email"
        placeholder="ornek@patiyolu.app"
        {...register("email")}
      />
      <Field
        id="password"
        type="password"
        label="Şifre"
        error={errors.password?.message}
        autoComplete="new-password"
        placeholder="En az 8 karakter, harf + rakam"
        {...register("password")}
      />
      <Field
        id="passwordConfirm"
        type="password"
        label="Şifre tekrar"
        error={errors.passwordConfirm?.message}
        autoComplete="new-password"
        {...register("passwordConfirm")}
      />

      <label className="flex items-start gap-3 rounded-2xl border border-chalk bg-eggshell p-3 text-[12px] leading-5 text-gravel">
        <input
          type="checkbox"
          className="mt-0.5 size-4 cursor-pointer accent-obsidian"
          {...register("kvkkConsent")}
        />
        <span>
          <Link
            href="/sozlesme-ornegi"
            className="underline decoration-chalk underline-offset-2 hover:decoration-obsidian"
            target="_blank"
          >
            KVKK aydınlatma metni
          </Link>
          'ni ve{" "}
          <Link
            href="/sozlesme-ornegi"
            className="underline decoration-chalk underline-offset-2 hover:decoration-obsidian"
            target="_blank"
          >
            kullanıcı sözleşmesini
          </Link>{" "}
          okudum, onaylıyorum.
        </span>
      </label>
      {errors.kvkkConsent?.message ? (
        <p className="-mt-2 text-[12px] text-danger">{errors.kvkkConsent.message}</p>
      ) : null}

      <label className="flex items-start gap-3 text-[12px] leading-5 text-gravel">
        <input
          type="checkbox"
          className="mt-0.5 size-4 cursor-pointer accent-obsidian"
          {...register("marketingConsent")}
        />
        <span>
          Pati yolculuğu ile ilgili kampanya ve bildirimleri almak istiyorum
          (opsiyonel).
        </span>
      </label>

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
        {pending ? "Hesap açılıyor…" : "Hesap aç"}
      </Button>
    </form>
  );
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
}

const Field = (() => {
  function FieldInner({ id, label, error, ...rest }: FieldProps) {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={id} className="text-[12px] text-gravel">
          {label}
        </Label>
        <Input id={id} aria-invalid={!!error} {...rest} />
        {error ? <p className="text-[12px] text-danger">{error}</p> : null}
      </div>
    );
  }
  FieldInner.displayName = "Field";
  return FieldInner;
})();
