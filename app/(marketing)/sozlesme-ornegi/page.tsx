import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Markdown } from "@/lib/markdown";
import { Chip } from "@/components/marketing/Chip";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Taşıyıcı Sözleşmesi (örnek) — Patiyolu",
  description:
    "Patiyolu'da taşıyıcı olmadan önce kabul edilen sözleşmenin tam metnini önceden incele.",
};

export default async function ContractSamplePage() {
  const supabase = await createClient();
  const { data: template } = await supabase
    .from("contract_templates")
    .select("version, title, content_md, word_count, effective_at")
    .eq("audience", "transporter")
    .order("effective_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-4 pt-12 pb-4 sm:pt-20">
        <Chip className="mb-4 bg-powder">📜 Sözleşme önizleme</Chip>
        <h1 className="font-display text-[36px] leading-[1.05] tracking-tight sm:text-[48px]">
          Taşıyıcı sözleşmesi
        </h1>
        {template ? (
          <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-gravel">
            v{template.version} · {template.word_count} kelime · yürürlük:{" "}
            {new Date(template.effective_at).toLocaleDateString("tr-TR")}
          </p>
        ) : null}
        <p className="mt-3 max-w-xl text-[14px] text-gravel">
          Aşağıda taşıyıcı olarak imzalayacağın sözleşmenin tam metni var.
          Üyelik öncesinde dilediğin gibi incele.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-6">
        {template ? (
          <article className="rounded-3xl border border-chalk bg-white px-6 py-8 sm:px-10">
            <Markdown source={template.content_md} />
          </article>
        ) : (
          <div className="rounded-3xl border border-chalk bg-powder/60 p-8 text-center text-[14px] text-gravel">
            Sözleşme yakında burada görünecek. Hazırlığımız tamamlanmadı.
          </div>
        )}
      </section>

      <section className="mx-auto max-w-3xl px-4 py-10 text-center">
        <p className="text-[13px] text-gravel">
          Sözleşmeyi imzalayıp taşıyıcı programına katılmak ister misin?
        </p>
        <Button
          variant="pill"
          size="lg"
          className="mt-4"
          render={<Link href="/kayit?rol=tasiyici" />}
        >
          Taşıyıcı hesabı aç
        </Button>
      </section>
    </MarketingShell>
  );
}
