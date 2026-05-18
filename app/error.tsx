"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }, [error]);

  return (
    <main className="grid min-h-[100dvh] place-items-center bg-eggshell px-6 py-16">
      <div className="max-w-md text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-danger">
          Bir şey ters gitti
        </div>
        <div className="mt-4 text-6xl" aria-hidden>
          🦴
        </div>
        <h1 className="mt-4 font-display text-[32px] leading-tight">
          Şu an buradan devam edemiyoruz
        </h1>
        <p className="mt-2 text-[14px] text-gravel">
          Beklenmeyen bir hata oldu. Tekrar denemek istersen aşağıdaki düğmeyi
          kullan.
        </p>
        {error.digest ? (
          <p className="mt-3 font-mono text-[10px] text-gravel">
            ref: {error.digest}
          </p>
        ) : null}
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="pill" size="lg" onClick={reset}>
            Tekrar dene
          </Button>
          <Button variant="pill-outline" size="lg" render={<Link href="/" />}>
            Anasayfa
          </Button>
        </div>
      </div>
    </main>
  );
}
