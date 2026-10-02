import type { ReactNode } from "react";

type CardProps = {
  title: string;
  as?: "h2" | "h3";
  variant?: "paper" | "night";
  className?: string;
  children?: ReactNode;
};

export function Card({ title, as: Heading = "h2", variant = "paper", className = "", children }: CardProps) {
  return (
    <section
      className={`paper-card w-[calc(100%-32px)] max-w-[560px] p-6 sm:p-8 ${className}`}
      data-variant={variant}
    >
      <Heading className={variant === "night" ? "!text-paper" : undefined}>{title}</Heading>
      <div className="relative z-10 mt-3">{children}</div>
    </section>
  );
}
