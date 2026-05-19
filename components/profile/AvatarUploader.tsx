"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { uploadAvatarAction } from "@/app/(panel)/profil/actions";

interface AvatarUploaderProps {
  avatarUrl: string | null;
  name: string;
}

export function AvatarUploader({ avatarUrl, name }: AvatarUploaderProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [pending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Hızlı önizleme
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    startTransition(async () => {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadAvatarAction(fd);
      if (!result.ok) {
        toast.error(result.error ?? "Yüklenemedi");
        setPreview(avatarUrl);
        return;
      }
      toast.success("Profil fotoğrafı güncellendi");
      router.refresh();
    });

    // Input'u temizle ki aynı dosyayı tekrar seçebilsin
    e.target.value = "";
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar className="size-20 border-2 border-chalk">
          {preview ? <AvatarImage src={preview} alt={name} /> : null}
          <AvatarFallback className="bg-paw/20 text-[24px] font-medium text-obsidian">
            {initials(name)}
          </AvatarFallback>
        </Avatar>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          aria-label="Profil fotoğrafı değiştir"
          className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full border-2 border-eggshell bg-obsidian text-eggshell shadow-sm transition hover:bg-obsidian/85 disabled:opacity-60"
        >
          <Camera className="size-3.5" />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={handleChange}
        />
      </div>
      <div>
        <p className="text-[14px] font-medium">{name}</p>
        <p className="text-[12px] text-gravel">
          {pending ? "Yükleniyor…" : "JPG/PNG, max 5 MB"}
        </p>
      </div>
    </div>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
