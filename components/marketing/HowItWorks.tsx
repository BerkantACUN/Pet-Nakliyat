import { FadeUp, StaggerList, StaggerItem } from "@/components/motion";

const STEPS = [
  {
    n: "01",
    emoji: "📝",
    title: "İlanını aç",
    body: "Petini, alış–varış adresini, tarihi belirle. Tahmini fiyat aralığını anında gör.",
  },
  {
    n: "02",
    emoji: "📬",
    title: "Teklifleri al",
    body: "Doğrulanmış taşıyıcılar fiyat, ETA ve notlarıyla teklif gönderir. Puanlarını oku.",
  },
  {
    n: "03",
    emoji: "✍️",
    title: "Sözleşmeyle yolla",
    body: "Kabul ettiğin teklif imzalı sözleşmeyle koruma altına girer. Güvenli ödeme.",
  },
  {
    n: "04",
    emoji: "🐾",
    title: "Değerlendir",
    body: "Teslimat sonrası taşıyıcıyı puanla. Sicil dürüst kalsın, sonraki sahibe yardım et.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-eggshell">
      <div className="mx-auto max-w-5xl px-6 py-20 md:py-24">
        <FadeUp className="text-center">
          <span className="font-mono text-[10px] text-gravel">nasıl çalışır</span>
          <h2 className="font-display mt-3 text-[clamp(28px,4vw,40px)] leading-[1.1] tracking-[-0.025em]">
            Dört dokunuş, <em className="not-italic text-gravel">gönül rahatlığı.</em>
          </h2>
        </FadeUp>

        <StaggerList className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <StaggerItem key={step.n}>
              <div className="relative flex h-full flex-col gap-3 rounded-3xl border border-chalk bg-eggshell p-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-gravel">{step.n}</span>
                  <span className="text-2xl" aria-hidden>
                    {step.emoji}
                  </span>
                </div>
                <h3 className="font-display mt-2 text-[20px] leading-snug">
                  {step.title}
                </h3>
                <p className="text-[13px] leading-6 text-gravel">{step.body}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>
      </div>
    </section>
  );
}
