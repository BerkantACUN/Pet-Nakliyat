"use client";

import { cn } from "@/lib/utils";

interface LottiePawLoaderProps {
  size?: number;
  label?: string;
  className?: string;
}

/**
 * Tatlı yürüyen patik animasyonu — CSS only fallback.
 * İlerde public/lottie/paw-walking.json eklenince lottie-react ile değiştirilecek.
 */
export function LottiePawLoader({
  size = 48,
  label = "Yükleniyor",
  className,
}: LottiePawLoaderProps) {
  return (
    <div
      className={cn("inline-flex flex-col items-center gap-3", className)}
      role="status"
      aria-live="polite"
    >
      <div
        className="relative"
        style={{ width: size * 2.4, height: size }}
        aria-hidden
      >
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="paw-print"
            style={{
              left: `${i * (size * 0.6)}px`,
              animationDelay: `${i * 0.15}s`,
              width: size * 0.5,
              height: size * 0.5,
              top: i % 2 === 0 ? 0 : size * 0.4,
            }}
          />
        ))}
      </div>
      <span className="font-mono text-[10px] text-gravel">{label}</span>
      <style>{`
        .paw-print {
          position: absolute;
          background: var(--color-obsidian);
          opacity: 0;
          border-radius: 9999px;
          animation: pawWalk 1.6s var(--ease-out-soft) infinite;
          /* Basit patik şekli — 4 daire (parmak) + 1 oval (yastık) */
          box-shadow:
            -30% -65% 0 -55% var(--color-obsidian),
             30% -65% 0 -55% var(--color-obsidian),
            -65% -10% 0 -60% var(--color-obsidian),
             65% -10% 0 -60% var(--color-obsidian);
        }
        @keyframes pawWalk {
          0%   { opacity: 0; transform: scale(0.6); }
          20%  { opacity: 0.85; transform: scale(1); }
          80%  { opacity: 0.85; }
          100% { opacity: 0; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}
