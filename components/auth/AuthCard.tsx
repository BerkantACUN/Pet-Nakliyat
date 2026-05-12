import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <div
      className={cn(
        "w-full max-w-md rounded-[28px] border border-chalk bg-white p-8 shadow-[0_12px_40px_-20px_rgba(17,17,17,0.15)]",
        className,
      )}
    >
      <h1 className="font-display text-[28px] leading-tight">{title}</h1>
      {subtitle ? (
        <p className="mt-2 text-[14px] leading-6 text-gravel">{subtitle}</p>
      ) : null}
      <div className="mt-6">{children}</div>
      {footer ? (
        <div className="mt-6 text-center text-[13px] text-gravel">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
