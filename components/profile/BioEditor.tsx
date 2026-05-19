"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateBioAction } from "@/app/(panel)/profil/actions";

interface BioEditorProps {
  defaultBio: string;
}

export function BioEditor({ defaultBio }: BioEditorProps) {
  const router = useRouter();
  const [bio, setBio] = useState(defaultBio);
  const [pending, startTransition] = useTransition();
  const remaining = 280 - bio.length;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateBioAction({ bio });
      if (!result.ok) {
        toast.error(result.error ?? "Güncellenemedi");
        return;
      }
      toast.success("Bio güncellendi ✨");
      router.refresh();
    });
  }

  const dirty = bio !== defaultBio;

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor="bio" className="text-[12px] text-gravel">
          Kendinden bahset
        </label>
        <span
          className={`font-mono text-[10px] ${
            remaining < 0 ? "text-danger" : "text-gravel"
          }`}
        >
          {remaining}
        </span>
      </div>
      <Textarea
        id="bio"
        rows={3}
        maxLength={300}
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Mesela: 5 yıllık deneyimli pet taşıyıcıyım, klimalı vanım var, kediler ve köpekler için özel kafeslerim var…"
      />
      {dirty ? (
        <div className="flex gap-2">
          <Button
            type="submit"
            variant="pill"
            size="sm"
            disabled={pending || remaining < 0}
          >
            {pending ? "Kaydediliyor…" : "Bio'yu kaydet"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setBio(defaultBio)}
            disabled={pending}
          >
            İptal
          </Button>
        </div>
      ) : null}
    </form>
  );
}
