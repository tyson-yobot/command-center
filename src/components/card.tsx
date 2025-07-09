// ===============================================
// client/src/components/ui/card.tsx  (FINAL PRODUCTION VERSION)
// Self‑contained • No external deps • Compatible with any React/TS setup
// ===============================================
import React, { type ReactNode } from "react";
import type { HTMLAttributes } from "react";

// local class concatenator (no external clsx)
const cn = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");

type DivProps = HTMLAttributes<HTMLDivElement>;

export interface CardProps extends DivProps {
  variant?: "default" | "glass" | "bordered";
}

export const Card = ({
  children,
  className = "",
  variant = "default",
  ...rest
}: CardProps) => {
  const variants = {
    default: "bg-zinc-900/80 backdrop-blur border border-zinc-700",
    glass: "bg-white/5 backdrop-blur-lg border border-white/10",
    bordered: "border border-blue-500 bg-zinc-900/60",
  } as const;

  return (
    <div
      {...rest}
      className={cn(
        "rounded-2xl p-6 shadow-lg transition-all duration-200",
        variants[variant],
        className
      )}
    >
      {children}
    </div>
  );
};

// ── Section Sub‑Components ────────────────────────────────────────────────

type SectionProps = DivProps;

export const CardHeader = ({ children, className = "", ...rest }: SectionProps) => (
  <div className={cn("mb-3 flex items-center justify-between", className)} {...rest}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = "", ...rest }: SectionProps) => (
  <h3 className={cn("text-lg font-semibold tracking-tight text-white", className)} {...rest}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = "", ...rest }: SectionProps) => (
  <p className={cn("text-sm text-zinc-400", className)} {...rest}>
    {children}
  </p>
);

export const CardContent = ({ children, className = "", ...rest }: SectionProps) => (
  <div className={cn("space-y-3", className)} {...rest}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = "", ...rest }: SectionProps) => (
  <div className={cn("pt-4 border-t border-zinc-800 mt-4", className)} {...rest}>
    {children}
  </div>
);


