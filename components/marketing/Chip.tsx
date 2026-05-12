import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChipProps {
  children: ReactNode;
  className?: string;
}

export function Chip({ children, className }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-chalk bg-white px-3 py-1.5 text-[12px] font-medium text-obsidian",
        className,
      )}
    >
      {children}
    </span>
  );
}
