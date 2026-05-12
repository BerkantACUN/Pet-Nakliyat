import { cn } from "@/lib/utils";

interface PawDotsProps {
  className?: string;
  opacity?: number;
}

/**
 * Arka plan deko — yumuşak pati izi pattern'i.
 */
export function PawDots({ className, opacity = 0.06 }: PawDotsProps) {
  return (
    <svg
      className={cn("pointer-events-none absolute", className)}
      width="640"
      height="640"
      viewBox="0 0 640 640"
      fill="currentColor"
      style={{ opacity }}
      aria-hidden
    >
      {[
        [80, 100],
        [200, 220],
        [340, 80],
        [480, 200],
        [120, 380],
        [280, 460],
        [440, 380],
        [520, 540],
      ].map(([cx, cy], i) => (
        <g key={i} transform={`translate(${cx}, ${cy}) rotate(${i * 17})`}>
          <circle cx="0" cy="0" r="10" />
          <circle cx="-14" cy="-22" r="6" />
          <circle cx="14" cy="-22" r="6" />
          <circle cx="-22" cy="-2" r="5" />
          <circle cx="22" cy="-2" r="5" />
        </g>
      ))}
    </svg>
  );
}
