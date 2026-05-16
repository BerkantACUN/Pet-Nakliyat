"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { reviewKycAction } from "@/app/admin/kyc/actions";

interface KycReviewRowProps {
  docId: string;
  docType: string;
  userName: string;
  userEmail: string | null;
  signedUrl: string;
  createdAt: string;
}

const LABEL: Record<string, string> = {
  id_front: "Kimlik (ön)",
  id_back: "Kimlik (arka)",
  plate_photo: "Plaka",
  vehicle_registration: "Ruhsat",
};

export function KycReviewRow({
  docId,
  docType,
  userName,
  userEmail,
  signedUrl,
  createdAt,
}: KycReviewRowProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [signedUrl]);

  function decide(decision: "approved" | "rejected") {
    if (decision === "rejected" && !note.trim()) {
      setShowNote(true);
      toast.message("Lütfen red gerekçesi yaz");
      return;
    }
    startTransition(async () => {
      const result = await reviewKycAction({
        docId,
        decision,
        note: note.trim() || undefined,
      });
      if (!result.ok) {
        toast.error(result.error ?? "İşlem başarısız");
        return;
      }
      toast.success(decision === "approved" ? "Onaylandı" : "Reddedildi");
      router.refresh();
    });
  }

  const isPdf = signedUrl.toLowerCase().includes(".pdf");

  return (
    <div className="rounded-3xl border border-chalk bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
            {LABEL[docType] ?? docType}
          </p>
          <p className="mt-0.5 font-display text-[16px]">{userName}</p>
          <p className="text-[11px] text-gravel">
            {userEmail} ·{" "}
            {new Date(createdAt).toLocaleString("tr-TR", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </p>
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-2xl border border-chalk">
        {isPdf ? (
          <a
            href={signedUrl}
            target="_blank"
            rel="noreferrer"
            className="block bg-powder px-4 py-6 text-center text-[13px] text-obsidian hover:bg-chalk/60"
          >
            PDF aç ↗
          </a>
        ) : imgError ? (
          <a
            href={signedUrl}
            target="_blank"
            rel="noreferrer"
            className="block bg-powder px-4 py-6 text-center text-[13px] text-obsidian hover:bg-chalk/60"
          >
            Dosyayı yeni sekmede aç ↗
          </a>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={signedUrl}
            alt={LABEL[docType] ?? docType}
            className="max-h-[280px] w-full bg-powder object-contain"
            onError={() => setImgError(true)}
          />
        )}
      </div>

      {showNote ? (
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Red gerekçesi (kullanıcıya gösterilir)"
          className="mt-3 w-full resize-none rounded-input border border-chalk px-3 py-2 text-[13px] outline-none focus:border-foreground"
        />
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant="pill"
          size="sm"
          disabled={pending}
          onClick={() => decide("approved")}
        >
          Onayla
        </Button>
        <Button
          variant="destructive"
          size="sm"
          disabled={pending}
          onClick={() => decide("rejected")}
        >
          Reddet
        </Button>
        {!showNote ? (
          <button
            type="button"
            className="text-[12px] text-gravel underline-offset-2 hover:underline"
            onClick={() => setShowNote(true)}
          >
            Not ekle
          </button>
        ) : null}
      </div>
    </div>
  );
}
