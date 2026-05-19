"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { createPostAction } from "@/app/(panel)/posts/actions";

interface PostComposerProps {
  authorName: string;
  avatarUrl: string | null;
}

export function PostComposer({ authorName, avatarUrl }: PostComposerProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [body, setBody] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const remaining = 1000 - body.length;
  const canSubmit = body.trim().length > 0 && remaining >= 0 && !pending;

  function pickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Görsel en fazla 8 MB olabilir");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview(null);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.append("body", body);
      if (imageFile) fd.append("image", imageFile);
      const result = await createPostAction(fd);
      if (!result.ok) {
        toast.error(result.error ?? "Paylaşılamadı");
        return;
      }
      toast.success("Paylaşıldı 🐾");
      setBody("");
      clearImage();
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-chalk bg-white p-4"
    >
      <div className="flex gap-3">
        <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border border-chalk bg-paw/20">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={authorName} className="size-full object-cover" />
          ) : (
            <span className="text-[12px] font-medium text-obsidian">
              {initials(authorName)}
            </span>
          )}
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          maxLength={1100}
          placeholder="Tüylü dostunla ne yaptın bugün? 🐾"
          className="flex-1 resize-none bg-transparent text-[14px] outline-none"
        />
      </div>

      {imagePreview ? (
        <div className="relative mt-3 overflow-hidden rounded-2xl border border-chalk">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagePreview}
            alt="Önizleme"
            className="block max-h-80 w-full object-cover"
          />
          <button
            type="button"
            onClick={clearImage}
            aria-label="Görseli kaldır"
            className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-obsidian/80 text-eggshell hover:bg-obsidian"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : null}

      <div className="mt-3 flex items-center justify-between border-t border-chalk pt-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-pill border border-chalk px-3 py-1.5 text-[12px] hover:bg-powder"
        >
          <ImageIcon className="size-3.5" /> Görsel ekle
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={pickImage}
        />
        <div className="flex items-center gap-3">
          <span
            className={`font-mono text-[10px] ${
              remaining < 0 ? "text-danger" : "text-gravel"
            }`}
          >
            {remaining}
          </span>
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-pill bg-obsidian px-4 py-1.5 text-[12px] font-medium text-eggshell transition hover:bg-obsidian/85 disabled:opacity-60"
          >
            {pending ? "Paylaşılıyor…" : "Paylaş"}
          </button>
        </div>
      </div>
    </form>
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
