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
  title: {
    default: "Patiyolu — Evcil Dostlar için Güvenli Nakliyat",
    template: "%s · Patiyolu",
  },
  description:
    "Şehir içi ve şehirler arası evcil hayvan taşımacılığı. Şeffaf km bazlı fiyat, imzalı sözleşmeli taşıyıcılar, puanlı sicil.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://patiyolu.app",
  ),
  openGraph: {
    title: "Patiyolu — Evcil Dostlar için Güvenli Nakliyat",
    description:
      "Şeffaf fiyat, imzalı sözleşmeli taşıyıcılar, puanlı sicil. Türkiye'nin pet nakliyat platformu.",
    locale: "tr_TR",
    type: "website",
    siteName: "Patiyolu",
  },
  twitter: {
    card: "summary_large_image",
    title: "Patiyolu",
    description: "Evcil dostlar için güvenli nakliyat.",
  },
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.ico" },
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
