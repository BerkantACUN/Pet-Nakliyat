import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/motion";
import { PawDots } from "@/components/marketing/PawDots";

export function CTA() {
  return (
    <section className="bg-eggshell px-6 py-16 md:py-24">
      <div className="mx-auto max-w-4xl">
        <FadeUp>
          <div className="relative overflow-hidden rounded-[36px] bg-obsidian px-8 py-16 text-center md:px-16 md:py-20">
            <PawDots className="-right-20 -top-10 text-eggshell" opacity={0.05} />
            <PawDots className="-left-24 -bottom-20 text-eggshell" opacity={0.04} />

            <div className="relative">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-eggshell/60">
                bugün başla
              </span>
              <h2 className="font-display mt-4 text-[clamp(32px,5vw,52px)] leading-[1.05] tracking-[-0.025em] text-eggshell">
                Pati yolculuğu
                <br />
                <em className="not-italic text-eggshell/70">birkaç dokunuş uzakta.</em>
              </h2>
              <p className="mx-auto mt-5 max-w-md text-[15px] leading-7 text-eggshell/70">
                Ücretsiz hesap aç, ilanını oluştur. İlk yayın 49₺, anlaşma
                tamamlandığında %10 komisyon. O kadar.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button
                  variant="pill-outline"
                  size="lg"
                  className="border-eggshell/30 bg-eggshell text-obsidian hover:bg-eggshell/90"
                  render={<Link href="/kayit" />}
                >
                  Ücretsiz hesap aç →
                </Button>
                <Button
                  variant="pill-ghost"
                  size="lg"
                  className="text-eggshell hover:bg-eggshell/10"
                  render={<Link href="/sozlesme-ornegi" />}
                >
                  Sözleşmeyi oku
                </Button>
              </div>
              <div className="mt-8 flex justify-center gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-eggshell/40">
                <span>iOS — yakında</span>
                <span aria-hidden>·</span>
                <span>Android — yakında</span>
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
