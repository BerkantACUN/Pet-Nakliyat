import type { Metadata } from "next";
import { Fraunces, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Patiyolu — Evcil Dostlar için Güvenli Nakliyat",
  description:
    "Şehir içi ve şehirler arası evcil hayvan taşımacılığı. Şeffaf km bazlı fiyat, imzalı sözleşmeli taşıyıcılar, puanlı sicil.",
  metadataBase: new URL("https://patiyolu.app"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="tr"
      className={cn(
        fraunces.variable,
        inter.variable,
        geistMono.variable,
        "h-full antialiased",
      )}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
