import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";
import { PawDots } from "@/components/marketing/PawDots";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-eggshell">
      <PawDots className="-left-32 -top-20 text-paw" opacity={0.07} />
      <PawDots
        className="-right-24 bottom-0 text-signal"
        opacity={0.04}
      />

      <header className="relative px-6 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-display text-[18px] tracking-tight"
        >
          <span aria-hidden>🐾</span>
          patiyolu
        </Link>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-6 py-10">
        {children}
      </main>
      <Toaster richColors position="top-center" />
    </div>
  );
}
