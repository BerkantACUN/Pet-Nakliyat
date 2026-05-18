import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://patiyolu.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, priority: 1 },
    { url: `${SITE_URL}/nasil-calisir`, lastModified: now, priority: 0.8 },
    { url: `${SITE_URL}/tasiyici-ol`, lastModified: now, priority: 0.8 },
    { url: `${SITE_URL}/tasiyicilar`, lastModified: now, priority: 0.7 },
    { url: `${SITE_URL}/sozlesme-ornegi`, lastModified: now, priority: 0.6 },
    { url: `${SITE_URL}/giris`, lastModified: now, priority: 0.4 },
    { url: `${SITE_URL}/kayit`, lastModified: now, priority: 0.6 },
  ];
}
