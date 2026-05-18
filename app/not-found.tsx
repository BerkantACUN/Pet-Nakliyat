import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Sayfa bulunamadı — Patiyolu" };

export default function NotFound() {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-eggshell px-6 py-16">
      <div className="max-w-md text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-gravel">
          404
        </div>
        <div className="mt-4 text-6xl" aria-hidden>
          🐾
        </div>
        <h1 className="mt-4 font-display text-[36px] leading-tight">
          Sayfa bulunamadı
        </h1>
        <p className="mt-2 text-[14px] text-gravel">
          Aradığın yer ya taşındı ya da hiç var olmadı. Anasayfaya geri dönelim
          mi?
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="pill" size="lg" render={<Link href="/" />}>
            Anasayfa
          </Button>
          <Button
            variant="pill-outline"
            size="lg"
            render={<Link href="/musteri/ilan-olustur" />}
          >
            İlan oluştur
          </Button>
        </div>
      </div>
    </main>
  );
}
