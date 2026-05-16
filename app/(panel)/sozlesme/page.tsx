import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Markdown } from "@/lib/markdown";
import { ContractSignForm } from "@/components/contract/ContractSignForm";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Taşıyıcı Sözleşmesi — Patiyolu",
};

export default async function ContractPage() {
  const user = await requireOnboardedUser();
  const supabase = await createClient();

  const { data: template } = await supabase
    .from("contract_templates")
    .select("*")
    .eq("audience", "transporter")
    .order("effective_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!template) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-3xl border border-border bg-background p-8 text-center text-sm text-muted-foreground">
          Sözleşme bulunamadı. Lütfen daha sonra tekrar dene.
        </div>
      </div>
    );
  }

  const { data: signature } = await supabase
    .from("contract_signatures")
    .select("id, signed_full_name, signed_at, signature_hash")
    .eq("user_id", user.id)
    .eq("template_id", template.id)
    .maybeSingle();

  if (signature) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-6">
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            v{template.version}
          </p>
          <h1 className="mt-1 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
            {template.title}
          </h1>
        </header>

        <div className="rounded-3xl border border-clover/40 bg-clover/10 p-6">
          <p className="text-sm font-medium text-foreground">
            Sözleşme imzalandı 🐾
          </p>
          <dl className="mt-4 space-y-2 text-[13px] text-muted-foreground">
            <div className="flex justify-between gap-3">
              <dt>İmzalayan</dt>
              <dd className="text-foreground">{signature.signed_full_name}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Tarih</dt>
              <dd className="text-foreground">
                {new Date(signature.signed_at).toLocaleString("tr-TR")}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Hash (SHA-256)</dt>
              <dd className="break-all font-mono text-[11px] text-foreground">
                {signature.signature_hash.slice(0, 24)}…
              </dd>
            </div>
          </dl>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="pill" size="lg" render={<Link href="/tasiyici/kyc" />}>
              KYC adımına geç
            </Button>
            <Button
              variant="pill-outline"
              size="lg"
              render={<Link href="/panel" />}
            >
              Panele dön
            </Button>
          </div>
        </div>

        <details className="mt-8 rounded-3xl border border-border bg-background p-5 text-sm text-muted-foreground">
          <summary className="cursor-pointer font-medium text-foreground">
            İmzaladığım metni göster
          </summary>
          <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2">
            <Markdown source={template.content_md} />
          </div>
        </details>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-6">
        <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          v{template.version} · {template.word_count} kelime
        </p>
        <h1 className="mt-1 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          {template.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Taşıyıcı olarak teklif verebilmen için bu sözleşmeyi okuyup
          imzalaman gerekiyor. Hayvanın güvenliği bizim için kritik — sorumluluk
          maddelerini özellikle dikkatlice incele.
        </p>
      </header>

      <ContractSignForm
        templateId={template.id}
        defaultFullName={user.profile?.full_name ?? ""}
      >
        <Markdown source={template.content_md} />
      </ContractSignForm>
    </div>
  );
}
