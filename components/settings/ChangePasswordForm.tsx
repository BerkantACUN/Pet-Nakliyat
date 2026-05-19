"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePasswordAction } from "@/app/(panel)/ayarlar/actions";

export function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    startTransition(async () => {
      const result = await changePasswordAction({
        currentPassword: current,
        newPassword: next,
      });
      if (!result.ok) {
        if (result.fieldErrors) setErrors(result.fieldErrors);
        toast.error(result.error ?? "Şifre değiştirilemedi");
        return;
      }
      toast.success("Şifren güncellendi 🔐");
      setCurrent("");
      setNext("");
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="currentPassword" className="text-[12px] text-gravel">
          Mevcut şifre
        </Label>
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          aria-invalid={!!errors.currentPassword}
        />
        {errors.currentPassword ? (
          <p className="text-[12px] text-danger">{errors.currentPassword}</p>
        ) : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="newPassword" className="text-[12px] text-gravel">
          Yeni şifre
        </Label>
        <Input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          aria-invalid={!!errors.newPassword}
        />
        {errors.newPassword ? (
          <p className="text-[12px] text-danger">{errors.newPassword}</p>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={pending || !current || !next}
        className="rounded-pill bg-obsidian px-5 py-2 text-[13px] font-medium text-eggshell transition hover:bg-obsidian/85 disabled:opacity-60"
      >
        {pending ? "Kaydediliyor…" : "Şifreyi değiştir"}
      </button>
    </form>
  );
}
