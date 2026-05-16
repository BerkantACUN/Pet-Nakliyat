"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, RotateCcw, Trash2, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  deleteKycDocAction,
  recordKycDocAction,
} from "@/app/(panel)/tasiyici/kyc/actions";
import type { KycDocStatus, KycDocType } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";

interface KycUploaderProps {
  userId: string;
  docType: KycDocType;
  label: string;
  description: string;
  emoji: string;
  current: {
    status: KycDocStatus;
    storagePath: string;
    reviewerNote: string | null;
    updatedAt: string;
  } | null;
}

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

const STATUS_CHIP: Record<KycDocStatus, { label: string; cls: string }> = {
  pending: { label: "İncelemede", cls: "bg-powder text-foreground" },
  approved: { label: "Onaylandı", cls: "bg-clover/20 text-foreground" },
  rejected: { label: "Reddedildi", cls: "bg-danger/15 text-danger" },
};

export function KycUploader({
  userId,
  docType,
  label,
  description,
  emoji,
  current,
}: KycUploaderProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();

  const isLocked =
    current?.status === "approved" || current?.status === "pending";

  async function handleFile(file: File) {
    if (!ACCEPTED.includes(file.type)) {
      toast.error("Sadece JPG, PNG, WEBP veya PDF yükleyebilirsin");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Dosya 8 MB'dan büyük olamaz");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
      const storagePath = `${userId}/${docType}-${Date.now()}.${ext}`;
      const supabase = createClient();

      const { error: upErr } = await supabase.storage
        .from("kyc")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (upErr) {
        toast.error(upErr.message);
        setUploading(false);
        return;
      }

      const result = await recordKycDocAction({ docType, storagePath });
      if (!result.ok) {
        // Storage objesini geri al
        await supabase.storage.from("kyc").remove([storagePath]);
        toast.error(result.error ?? "Kayıt eklenemedi");
        setUploading(false);
        return;
      }

      toast.success(`${label} yüklendi ✨`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Yükleme başarısız");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteKycDocAction({ docType });
      if (!result.ok) {
        toast.error(result.error ?? "Silinemedi");
        return;
      }
      toast.success("Belge silindi");
      router.refresh();
    });
  }

  return (
    <div className="rounded-3xl border border-border bg-background p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden>
              {emoji}
            </span>
            <h3 className="text-sm font-medium text-foreground">{label}</h3>
          </div>
          <p className="mt-1 text-[12px] text-muted-foreground">
            {description}
          </p>
        </div>
        {current ? (
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${STATUS_CHIP[current.status].cls}`}
          >
            {STATUS_CHIP[current.status].label}
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-powder/80 px-2.5 py-1 text-[11px] text-gravel">
            Eksik
          </span>
        )}
      </div>

      {current?.status === "rejected" && current.reviewerNote ? (
        <div className="mt-3 rounded-2xl bg-danger/10 px-3 py-2 text-[12px] text-danger">
          <p className="font-medium">Reddedildi:</p>
          <p className="mt-0.5">{current.reviewerNote}</p>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        {!current || current.status === "rejected" ? (
          <Button
            type="button"
            variant="pill"
            size="lg"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="size-3.5" />
            {uploading
              ? "Yükleniyor…"
              : current?.status === "rejected"
                ? "Yeniden yükle"
                : "Yükle"}
          </Button>
        ) : null}

        {current?.status === "pending" ? (
          <>
            <span className="inline-flex items-center gap-1 rounded-full bg-powder/70 px-3 py-1 text-[11px] text-gravel">
              <Check className="size-3" />
              Yüklendi, inceleniyor
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={handleDelete}
            >
              <Trash2 className="size-3.5" />
              {pending ? "Siliniyor…" : "Sil"}
            </Button>
          </>
        ) : null}

        {current?.status === "approved" ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-clover/15 px-3 py-1 text-[11px] text-foreground">
            <Check className="size-3" />
            Onaylandı — değiştirilemez
          </span>
        ) : null}

        {!current && !uploading ? (
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            JPG / PNG / WEBP / PDF · max 8 MB
          </span>
        ) : null}
      </div>

      {isLocked && current?.status === "rejected" ? (
        <button
          type="button"
          className="mt-3 inline-flex items-center gap-1 text-[12px] text-muted-foreground underline-offset-2 hover:underline"
          onClick={() => fileInputRef.current?.click()}
        >
          <RotateCcw className="size-3" />
          Yeni dosya seç
        </button>
      ) : null}
    </div>
  );
}
