interface PawLoaderProps {
  label?: string;
  /** sm=küçük inline, md=panel default, lg=full-page */
  size?: "sm" | "md" | "lg";
}

/**
 * Patiyolu yüklenme ekranı — köpek pati izleri sıçrayarak ekranı geçer.
 * Reduced-motion açıkken sadece statik patiler gözükür, animasyon devre dışı.
 */
export function PawLoader({ label = "Bir saniye…", size = "md" }: PawLoaderProps) {
  const dim =
    size === "lg" ? "min-h-[60vh]" : size === "sm" ? "py-8" : "min-h-[40vh]";
  const pawSize =
    size === "lg" ? "size-9" : size === "sm" ? "size-5" : "size-7";

  return (
    <div className={`grid w-full place-items-center ${dim}`}>
      <div className="flex flex-col items-center gap-4">
        <div
          className="flex items-center gap-2"
          role="status"
          aria-live="polite"
          aria-label={label}
        >
          {[0, 1, 2].map((i) => (
            <Paw
              key={i}
              className={`${pawSize} text-foreground/80 paw-bounce`}
              style={{ animationDelay: `${i * 140}ms` }}
            />
          ))}
        </div>
        <p className="text-[12px] text-gravel">{label}</p>
      </div>

      <style>{`
        @keyframes pawBounce {
          0%, 80%, 100% {
            transform: translateY(0) rotate(-10deg);
            opacity: 0.35;
          }
          40% {
            transform: translateY(-10px) rotate(-10deg);
            opacity: 1;
          }
        }
        .paw-bounce {
          animation: pawBounce 1.4s var(--ease-out-soft, ease-out) infinite both;
          transform-origin: center;
        }
        @media (prefers-reduced-motion: reduce) {
          .paw-bounce { animation: none; opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

function Paw({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      style={style}
    >
      {/* main pad */}
      <ellipse cx="16" cy="22" rx="6.5" ry="5.2" />
      {/* toes */}
      <ellipse cx="9.5" cy="14" rx="2.6" ry="3.2" />
      <ellipse cx="22.5" cy="14" rx="2.6" ry="3.2" />
      <ellipse cx="13" cy="9" rx="2.2" ry="2.8" />
      <ellipse cx="19" cy="9" rx="2.2" ry="2.8" />
    </svg>
  );
}
