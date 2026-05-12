import { FadeUp } from "@/components/motion";

const PROPS = [
  {
    dot: "var(--color-paw)",
    title: "Şeffaf km bazlı fiyat",
    body: "Adresleri seç, Mapbox sürüş mesafesi üzerinden tahmini fiyat aralığını gör. Sürpriz yok.",
  },
  {
    dot: "var(--color-signal)",
    title: "Sözleşmeli taşıyıcılar",
    body: "KYC tamamlamadan, uzun soluklu kullanıcı sözleşmesini imzalamadan kimse teklif veremez.",
  },
  {
    dot: "var(--color-clover)",
    title: "Puanlı sicil",
    body: "Her tamamlanan booking sonrası karşılıklı değerlendirme. Sicil, güven ve karar verdiriyor.",
  },
];

export function ValueProps() {
  return (
    <section className="border-t border-chalk">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-3 md:gap-8 md:py-24">
        {PROPS.map((p, i) => (
          <FadeUp key={p.title} delay={i * 0.08}>
            <article className="flex flex-col gap-3">
              <span
                className="inline-block size-3 rounded-full"
                style={{ background: p.dot }}
                aria-hidden
              />
              <h3 className="font-display text-[24px] leading-snug">
                {p.title}
              </h3>
              <p className="text-[15px] leading-7 text-gravel">{p.body}</p>
            </article>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}
