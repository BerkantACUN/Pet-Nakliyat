"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updateProfileAction,
  type ProfileInput,
} from "@/app/(panel)/profil/actions";

interface ProfileFormProps {
  defaults: ProfileInput;
}

export function ProfileForm({ defaults }: ProfileFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ProfileInput>({ defaultValues: defaults });

  function onSubmit(data: ProfileInput) {
    startTransition(async () => {
      const result = await updateProfileAction(data);
      if (!result.ok) {
        if (result.fieldErrors) {
          for (const [k, v] of Object.entries(result.fieldErrors)) {
            setError(k as keyof ProfileInput, { message: v });
          }
        }
        toast.error(result.error ?? "Güncellenemedi");
        return;
      }
      toast.success("Profil güncellendi ✨");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Field
        id="fullName"
        label="Ad-soyad"
        autoComplete="name"
        error={errors.fullName?.message}
        registerProps={register("fullName")}
      />
      <Field
        id="city"
        label="Şehir"
        autoComplete="address-level2"
        error={errors.city?.message}
        registerProps={register("city")}
      />
      <Field
        id="phone"
        label="Telefon"
        autoComplete="tel"
        error={errors.phone?.message}
        registerProps={register("phone")}
      />
      <Button type="submit" variant="pill" size="lg" disabled={pending}>
        {pending ? "Kaydediliyor…" : "Kaydet"}
      </Button>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  registerProps,
  autoComplete,
}: {
  id: string;
  label: string;
  error?: string;
  registerProps: ReturnType<ReturnType<typeof useForm>["register"]>;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-[12px] text-gravel">
        {label}
      </Label>
      <Input
        id={id}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        {...registerProps}
      />
      {error ? <p className="text-[12px] text-danger">{error}</p> : null}
    </div>
  );
}
