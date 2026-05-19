"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePhoneAction } from "@/app/(panel)/ayarlar/actions";

interface ChangePhoneFormProps {
  currentPhone: string;
}

export function ChangePhoneForm({ currentPhone }: ChangePhoneFormProps) {
  const router = useRouter();
  const [phone, setPhone] = useState(currentPhone);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    startTransition(async () => {
      const result = await changePhoneAction({ phone });
      if (!result.ok) {
        if (result.fieldErrors) setErrors(result.fieldErrors);
        toast.error(result.error ?? "Telefon değiştirilemedi");
        return;
      }
      toast.success("Telefon güncellendi 📞");
      router.refresh();
    });
  }

  const dirty = phone !== currentPhone;

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="phone" className="text-[12px] text-gravel">
          Yeni telefon (5XX XXX XX XX)
        </Label>
        <Input
          id="phone"
          type="tel"
          autoComplete="tel"
          placeholder="5XX XXX XX XX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          aria-invalid={!!errors.phone}
        />
        {errors.phone ? (
          <p className="text-[12px] text-danger">{errors.phone}</p>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={pending || !dirty}
        className="rounded-pill bg-obsidian px-5 py-2 text-[13px] font-medium text-eggshell transition hover:bg-obsidian/85 disabled:opacity-60"
      >
        {pending ? "Kaydediliyor…" : "Telefonu güncelle"}
      </button>
    </form>
  );
}
