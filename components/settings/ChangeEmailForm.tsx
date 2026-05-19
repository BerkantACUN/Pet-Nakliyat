"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changeEmailAction } from "@/app/(panel)/ayarlar/actions";

interface ChangeEmailFormProps {
  currentEmail: string;
}

export function ChangeEmailForm({ currentEmail }: ChangeEmailFormProps) {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    startTransition(async () => {
      const result = await changeEmailAction({ email });
      if (!result.ok) {
        if (result.fieldErrors) setErrors(result.fieldErrors);
        toast.error(result.error ?? "E-posta değiştirilemedi");
        return;
      }
      toast.success("Onay maili yeni adrese gitti. Linke tıkla.");
      setSent(true);
    });
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-chalk bg-paw/10 p-4 text-[13px]">
        <strong className="text-obsidian">{email}</strong> adresine onay maili
        gitti. Linke tıkladığında yeni e-postan aktif olur.
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setEmail("");
          }}
          className="mt-2 block text-[12px] text-signal hover:underline"
        >
          Başka bir adres dene
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="newEmail" className="text-[12px] text-gravel">
          Yeni e-posta
        </Label>
        <Input
          id="newEmail"
          type="email"
          autoComplete="email"
          placeholder={currentEmail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!errors.email}
        />
        {errors.email ? (
          <p className="text-[12px] text-danger">{errors.email}</p>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={pending || !email}
        className="rounded-pill bg-obsidian px-5 py-2 text-[13px] font-medium text-eggshell transition hover:bg-obsidian/85 disabled:opacity-60"
      >
        {pending ? "Gönderiliyor…" : "Onay maili gönder"}
      </button>
    </form>
  );
}
