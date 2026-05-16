import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Mesajlar — Patiyolu" };

export default async function MessagesPage() {
  await requireOnboardedUser();

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
          İletişim
        </span>
        <h1 className="font-display text-[28px] leading-tight">Mesajlar</h1>
      </header>

      <div className="grid place-items-center rounded-3xl border border-chalk bg-powder/40 px-6 py-16 text-center">
        <div className="grid size-14 place-items-center rounded-2xl bg-white">
          <MessageCircle className="size-6 text-gravel" />
        </div>
        <h2 className="mt-4 font-display text-[20px]">
          Henüz konuşma yok 🐾
        </h2>
        <p className="mt-1 max-w-sm text-[13px] text-gravel">
          Bir teklif kabul edilince taşıyıcı ile arandaki konuşma burada
          açılacak. İlanlarına bir bak istersen.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Button variant="pill" size="sm" render={<Link href="/musteri/ilanlarim" />}>
            İlanlarım
          </Button>
          <Button
            variant="pill-outline"
            size="sm"
            render={<Link href="/tasiyici/ilanlar" />}
          >
            İlan keşfet
          </Button>
        </div>
      </div>
    </div>
  );
}
