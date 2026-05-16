import Link from "next/link";
import { ArrowRight, FileText, Plus, ShieldCheck } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/marketing/Chip";

export const metadata = { title: "Panel · Patiyolu" };

export default async function PanelHomePage() {
  const user = await requireOnboardedUser();
  const supabase = await createClient();

  let transporterStep: "contract" | "kyc" | "ready" | null = null;
  if (user.roles.includes("transporter")) {
    const { data: tp } = await supabase
      .from("transporter_profiles")
      .select("contract_signature_id, kyc_status")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!tp?.contract_signature_id) transporterStep = "contract";
    else if (tp.kyc_status !== "approved") transporterStep = "kyc";
    else transporterStep = "ready";
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
          {greeting()} —
        </span>
        <h1 className="font-display text-[32px] leading-tight">
          Merhaba, {firstName(user.profile!.full_name)} 🐾
        </h1>
        <p className="text-[14px] text-gravel">
          Pati yolculuğun nereden başlasın?
        </p>
      </header>

      {transporterStep && transporterStep !== "ready" ? (
        <section
          className="rounded-3xl border p-5"
          style={{
            borderColor: "var(--color-chalk)",
            background:
              transporterStep === "contract"
                ? "color-mix(in oklch, var(--color-paw) 12%, white)"
                : "color-mix(in oklch, var(--color-signal) 8%, white)",
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="grid size-10 shrink-0 place-items-center rounded-2xl"
              style={{
                background:
                  transporterStep === "contract"
                    ? "color-mix(in oklch, var(--color-paw) 25%, white)"
                    : "color-mix(in oklch, var(--color-signal) 20%, white)",
              }}
            >
              {transporterStep === "contract" ? (
                <FileText className="size-5" />
              ) : (
                <ShieldCheck className="size-5" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
                Taşıyıcı kurulumu — {transporterStep === "contract" ? "1/2" : "2/2"}
              </p>
              <h2 className="mt-0.5 font-display text-[20px] leading-tight">
                {transporterStep === "contract"
                  ? "Sözleşmeni imzala 📜"
                  : "Kimlik & araç doğrulaması"}
              </h2>
              <p className="mt-1 text-[13px] text-gravel">
                {transporterStep === "contract"
                  ? "Teklif verebilmen için taşıyıcı sözleşmesini elektronik olarak imzalaman gerekiyor."
                  : "Belgelerini yükle, inceleme ekibimiz 1-3 iş günü içinde dönsün."}
              </p>
              <Button
                variant="pill"
                size="sm"
                className="mt-3"
                render={
                  <Link
                    href={
                      transporterStep === "contract"
                        ? "/sozlesme"
                        : "/tasiyici/kyc"
                    }
                  />
                }
              >
                {transporterStep === "contract"
                  ? "Sözleşmeye git"
                  : "Belgeleri yükle"}
                <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-3">
        <ActionCard
          href="/musteri/ilan-olustur"
          emoji="📍"
          accent="var(--color-paw)"
          title="Yeni nakliyat ilanı"
          body="Petini, adresleri ve tarihi seç. Tahmini fiyat anında."
        />
        <ActionCard
          href="/musteri/ilanlarim"
          emoji="📦"
          accent="var(--color-signal)"
          title="İlanlarım"
          body="Açık ilanların ve gelen teklifler."
        />
        {user.roles.includes("transporter") ? (
          <ActionCard
            href="/tasiyici/ilanlar"
            emoji="🚐"
            accent="var(--color-clover)"
            title="Taşıyıcı paneli"
            body="Yeni ilanları browse et, teklif at."
          />
        ) : (
          <ActionCard
            href="/tasiyici-ol"
            emoji="🤝"
            accent="var(--color-clover)"
            title="Taşıyıcı ol"
            body="KYC ve sözleşmeyle ek gelir kapısı."
          />
        )}
      </section>

      <section className="rounded-3xl border border-chalk bg-powder p-5">
        <h2 className="font-display text-[20px] leading-snug">
          Henüz bir hareket yok
        </h2>
        <p className="mt-1 text-[13px] text-gravel">
          İlanın olunca aktivitelerin burada görünecek.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Chip className="bg-white">
            <span aria-hidden>✨</span> Yeni
          </Chip>
          <Chip className="bg-white">
            <span aria-hidden>🆔</span> {user.profile!.city ?? "Şehir belirtilmedi"}
          </Chip>
        </div>
        <Button
          variant="pill"
          size="sm"
          className="mt-4"
          render={<Link href="/musteri/ilan-olustur" />}
        >
          <Plus className="size-3.5" /> İlk ilanını aç
        </Button>
      </section>
    </div>
  );
}

interface ActionCardProps {
  href: string;
  emoji: string;
  accent: string;
  title: string;
  body: string;
}

function ActionCard({ href, emoji, accent, title, body }: ActionCardProps) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-3xl border border-chalk bg-white p-4 transition hover:bg-powder"
    >
      <div
        className="grid size-12 shrink-0 place-items-center rounded-2xl text-2xl"
        style={{ background: `${accent}1f` }}
      >
        {emoji}
      </div>
      <div className="flex-1">
        <div className="font-display text-[17px] leading-tight">{title}</div>
        <div className="text-[12px] text-gravel">{body}</div>
      </div>
      <ArrowRight className="size-4 text-gravel transition group-hover:translate-x-0.5 group-hover:text-obsidian" />
    </Link>
  );
}

function firstName(full: string): string {
  return full.split(" ")[0];
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "iyi geceler";
  if (h < 12) return "günaydın";
  if (h < 18) return "tünaydın";
  return "iyi akşamlar";
}
