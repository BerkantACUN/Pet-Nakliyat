import { FadeUp, StaggerList, StaggerItem } from "@/components/motion";

const STEPS = [
  {
    n: "01",
    title: "İlanını aç",
    body: "Petini, alış–varış adresini, tarihi belirle. Kilometre bazlı tahmini fiyatı anında gör.",
  },
  {
    n: "02",
    title: "Teklifleri karşılaştır",
    body: "Doğrulanmış taşıyıcılar fiyat, ETA ve notlarıyla teklif gönderir. Puanlarını oku, seç.",
  },
  {
    n: "03",
    title: "Sözleşmeyle yolla",
    body: "Kabul ettiğin teklif imzalı sözleşmeyle koruma altına girer. Güvenli ödeme, anlık durum.",
  },
  {
    n: "04",
    title: "Değerlendir",
    body: "Teslimat sonrası taşıyıcıyı puanla. Sicil dürüst kalsın, bir sonraki sahibe yardım et.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-t border-chalk bg-eggshell">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <FadeUp>
          <span className="font-mono text-[10px] text-gravel">nasıl çalışır</span>
          <h2 className="font-display mt-3 text-[36px] leading-[1.13] tracking-[-0.72px] md:text-[44px]">
            Dört adımda gönül rahatlığı.
          </h2>
        </FadeUp>

        <StaggerList className="mt-12 grid gap-px overflow-hidden rounded-xl border border-chalk bg-chalk md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <StaggerItem key={step.n}>
              <div className="flex h-full flex-col gap-3 bg-eggshell p-6">
                <span className="font-mono text-[10px] text-gravel">
                  {step.n}
                </span>
                <h3 className="font-display text-[20px] leading-snug">
                  {step.title}
                </h3>
                <p className="text-[14px] leading-6 text-gravel">{step.body}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>
      </div>
    </section>
  );
}
