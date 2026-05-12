import { FadeUp } from "@/components/motion";

const FEATURES = [
  {
    emoji: "📍",
    accent: "var(--color-paw)",
    title: "Şeffaf km bazlı fiyat",
    body:
      "Adresleri seç, sürüş mesafesinden tahmini fiyat aralığını saniyeler içinde gör. Sürpriz fatura yok.",
  },
  {
    emoji: "🤝",
    accent: "var(--color-signal)",
    title: "Sözleşmeli taşıyıcılar",
    body:
      "KYC tamamlanmadan ve uzun soluklu kullanıcı sözleşmesi imzalanmadan kimse teklif veremez. Sorumluluk net.",
  },
  {
    emoji: "★",
    accent: "var(--color-clover)",
    title: "Puanlı sicil",
    body:
      "Her tamamlanan yolculuk sonrası karşılıklı değerlendirme. Sicil dürüst, karar verirken işine yarar.",
  },
];

export function ValueProps() {
  return (
    <section className="bg-powder">
      <div className="mx-auto max-w-5xl px-6 py-20 md:py-24">
        <FadeUp className="text-center">
          <span className="font-mono text-[10px] text-gravel">
            neden patiyolu
          </span>
          <h2 className="font-display mx-auto mt-3 max-w-2xl text-[clamp(28px,4vw,40px)] leading-[1.1] tracking-[-0.025em]">
            Üç şey için varız: <em className="not-italic text-gravel">şeffaflık, güven, sicil.</em>
          </h2>
        </FadeUp>

        <div className="mt-12 grid gap-4 md:grid-cols-3 md:gap-5">
          {FEATURES.map((f, i) => (
            <FadeUp key={f.title} delay={i * 0.08}>
              <article className="group h-full rounded-3xl border border-chalk bg-eggshell p-6 shadow-[0_2px_8px_-4px_rgba(17,17,17,0.05)] transition-shadow duration-300 hover:shadow-[0_12px_28px_-12px_rgba(17,17,17,0.1)]">
                <div
                  className="grid size-12 place-items-center rounded-2xl text-2xl"
                  style={{ background: `${f.accent}1f` }}
                >
                  {f.emoji}
                </div>
                <h3 className="font-display mt-5 text-[22px] leading-snug">
                  {f.title}
                </h3>
                <p className="mt-3 text-[14px] leading-6 text-gravel">
                  {f.body}
                </p>
              </article>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
