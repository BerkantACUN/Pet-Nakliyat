import { cn } from "@/lib/utils";

interface PhonePreviewProps {
  className?: string;
}

/**
 * Patiyolu app ön izleme — gerçek bir telefon frame'i içinde app içeriği.
 * Yeni İlan akışından bir kesit gösteriyor.
 */
export function PhonePreview({ className }: PhonePreviewProps) {
  return (
    <div
      className={cn(
        "relative mx-auto w-[280px] shrink-0 rounded-[44px] bg-obsidian p-2 shadow-[0_30px_60px_-20px_rgba(17,17,17,0.25),0_10px_20px_-10px_rgba(17,17,17,0.15)]",
        className,
      )}
      aria-hidden
    >
      {/* Notch */}
      <div className="absolute left-1/2 top-2 z-10 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-obsidian" />

      <div className="relative h-[580px] overflow-hidden rounded-[36px] bg-eggshell">
        {/* Status bar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 font-mono text-[9px] text-obsidian">
          <span>09:41</span>
          <span className="flex gap-1">
            <span>●●●</span>
            <span>📶</span>
          </span>
        </div>

        {/* App header */}
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <button
              className="grid size-8 place-items-center rounded-full border border-chalk text-obsidian"
              aria-label="Geri"
            >
              ←
            </button>
          </div>
          <span className="font-mono text-[10px] text-gravel">
            yeni i̇lan · 3 / 4
          </span>
          <div className="size-8" />
        </div>

        {/* Pet card */}
        <div className="mx-5 mb-3 rounded-2xl border border-chalk bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-full bg-paw/15 text-2xl">
              🐶
            </div>
            <div>
              <div className="font-display text-[16px] leading-tight">Paşa</div>
              <div className="text-[11px] text-gravel">
                Golden Retriever · 28 kg
              </div>
            </div>
          </div>
        </div>

        {/* Route */}
        <div className="mx-5 mb-3 rounded-2xl bg-powder p-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex flex-col items-center">
              <span className="size-2 rounded-full bg-signal" />
              <span className="my-1 h-8 w-px bg-chalk" />
              <span className="size-2 rounded-full bg-paw" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <div className="font-mono text-[9px] text-gravel">alış</div>
                <div className="text-[13px]">Kadıköy, İstanbul</div>
              </div>
              <div>
                <div className="font-mono text-[9px] text-gravel">varış</div>
                <div className="text-[13px]">Karşıyaka, İzmir</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-[20px] leading-none">480</div>
              <div className="font-mono text-[9px] text-gravel">km</div>
            </div>
          </div>
        </div>

        {/* Price quote */}
        <div className="mx-5 mb-3 rounded-2xl border border-chalk bg-white p-4">
          <div className="font-mono text-[9px] text-gravel">tahmini fiyat</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-display text-[24px] leading-none">
              1.450
            </span>
            <span className="text-[13px] text-gravel">– 2.100 ₺</span>
          </div>
          <div className="mt-2 text-[11px] text-gravel">
            Standart hız · sözleşmeli taşıyıcı · %10 komisyon dahil
          </div>
        </div>

        {/* CTA bottom */}
        <div className="absolute inset-x-5 bottom-6">
          <button className="flex w-full items-center justify-center gap-2 rounded-full bg-obsidian px-5 py-3.5 text-[13px] font-medium text-eggshell">
            Teklif almaya başla
            <span aria-hidden>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
