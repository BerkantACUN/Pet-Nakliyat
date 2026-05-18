import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { KycUploader } from "@/components/kyc/KycUploader";
import { Button } from "@/components/ui/button";
import type { KycDocType } from "@/lib/supabase/types";

export const metadata = {
  title: "KYC Doğrulama — Patiyolu",
};

const DOC_SLOTS: Array<{
  type: KycDocType;
  label: string;
  description: string;
  emoji: string;
}> = [
  {
    type: "id_front",
    label: "Kimlik (ön yüz)",
    description: "T.C. kimliğinin ön yüzü, net ve okunabilir.",
    emoji: "🪪",
  },
  {
    type: "id_back",
    label: "Kimlik (arka yüz)",
    description: "Kimliğin arka yüzü; köşeler tamamen görünsün.",
    emoji: "🪪",
  },
  {
    type: "plate_photo",
    label: "Araç plakası",
    description: "Aracının plakasının yakın çekim fotoğrafı (gündüz).",
    emoji: "🚐",
  },
  {
    type: "vehicle_registration",
    label: "Araç ruhsatı",
    description: "Ruhsatın tüm sayfaları (PDF veya peş peşe fotoğraf).",
    emoji: "📄",
  },
];

export default async function KycPage() {
  const user = await requireOnboardedUser();
  const supabase = await createClient();

  // Sözleşme imzalı mı?
  let { data: tp } = await supabase
    .from("transporter_profiles")
    .select("kyc_status, contract_signature_id, contract_signed_at")
    .eq("user_id", user.id)
    .maybeSingle();

  // Backfill: profil var ama sözleşme link'i yoksa, contract_signatures tablosunda
  // ara — imzalanmış ama eski race condition yüzünden link'lenmemiş olabilir.
  if (tp && !tp.contract_signature_id) {
    const { data: tpl } = await supabase
      .from("contract_templates")
      .select("id")
      .eq("audience", "transporter")
      .order("effective_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (tpl) {
      const { data: sig } = await supabase
        .from("contract_signatures")
        .select("id, signed_at")
        .eq("user_id", user.id)
        .eq("template_id", tpl.id)
        .maybeSingle();
      if (sig) {
        await supabase
          .from("transporter_profiles")
          .update({
            contract_signature_id: sig.id,
            contract_signed_at: sig.signed_at,
          })
          .eq("user_id", user.id);
        tp = {
          ...tp,
          contract_signature_id: sig.id,
          contract_signed_at: sig.signed_at,
        };
      }
    }
  }

  if (!tp) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-3xl border border-border bg-background p-8 text-center">
          <p className="font-serif text-2xl text-foreground">
            Önce taşıyıcı profili oluştur
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Teklif verebilmen için taşıyıcı modunu açmalısın.
          </p>
          <Button
            className="mt-5"
            variant="pill"
            size="lg"
            render={<Link href="/profil" />}
          >
            Profile git
          </Button>
        </div>
      </div>
    );
  }

  if (!tp.contract_signature_id) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-3xl border border-border bg-background p-8 text-center">
          <p className="font-serif text-2xl text-foreground">
            Önce sözleşmeyi imzala 📜
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            KYC belgelerini yükleyebilmen için taşıyıcı sözleşmesini elektronik
            olarak imzalaman gerekiyor.
          </p>
          <Button
            className="mt-5"
            variant="pill"
            size="lg"
            render={<Link href="/sozlesme" />}
          >
            Sözleşmeyi oku & imzala
          </Button>
        </div>
      </div>
    );
  }

  const { data: docs } = await supabase
    .from("kyc_documents")
    .select("doc_type, status, storage_path, reviewer_note, updated_at")
    .eq("user_id", user.id);

  const byType = new Map(docs?.map((d) => [d.doc_type, d]) ?? []);

  const totalApproved = docs?.filter((d) => d.status === "approved").length ?? 0;
  const totalNeeded = DOC_SLOTS.length;
  const isFullyApproved = totalApproved === totalNeeded;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-6">
        <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          Adım 2 / 2
        </p>
        <h1 className="mt-1 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          Kimlik & araç doğrulama
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Müşteriler güvenli hissetsin diye taşıyıcıları doğruluyoruz. Belgeler
          özel kalır, sadece Patiyolu inceleme ekibi görür.
        </p>
      </header>

      <div className="mb-6 rounded-3xl border border-border bg-background p-4">
        <div className="flex items-center justify-between gap-3 text-sm">
          <p className="text-foreground">
            <span className="font-medium">{totalApproved}</span>
            <span className="text-muted-foreground"> / {totalNeeded} onaylı</span>
          </p>
          {isFullyApproved ? (
            <span className="rounded-full bg-clover/20 px-3 py-1 text-[11px] font-medium text-foreground">
              Tamamlandı ✨
            </span>
          ) : (
            <span className="rounded-full bg-powder/70 px-3 py-1 text-[11px] text-gravel">
              {totalNeeded - totalApproved} belge bekliyor
            </span>
          )}
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-powder">
          <div
            className="h-full rounded-full bg-foreground transition-[width] duration-500"
            style={{
              width: `${Math.round((totalApproved / totalNeeded) * 100)}%`,
            }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {DOC_SLOTS.map((slot) => {
          const doc = byType.get(slot.type);
          return (
            <KycUploader
              key={slot.type}
              userId={user.id}
              docType={slot.type}
              label={slot.label}
              description={slot.description}
              emoji={slot.emoji}
              current={
                doc
                  ? {
                      status: doc.status,
                      storagePath: doc.storage_path,
                      reviewerNote: doc.reviewer_note,
                      updatedAt: doc.updated_at,
                    }
                  : null
              }
            />
          );
        })}
      </div>

      <div className="mt-8 rounded-3xl bg-powder/40 p-4 text-[12px] leading-6 text-gravel">
        <p>
          <strong className="text-foreground">İnceleme süresi:</strong> Yüklenen
          belgeler 1-3 iş günü içinde manuel olarak incelenir. Reddedilen
          belgeler için sebep yazılır ve yeniden yükleyebilirsin.
        </p>
        <p className="mt-2">
          <strong className="text-foreground">Gizlilik:</strong> Belgeler
          Supabase Storage'da özel bir bucket'ta tutulur. Sadece sen ve inceleme
          ekibi görür; üçüncü taraflara açılmaz.
        </p>
      </div>
    </div>
  );
}
