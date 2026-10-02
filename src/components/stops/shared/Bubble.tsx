import type { ReactNode } from "react";

type BubbleProps = {
  tail: "left" | "right" | "down";
  variant?: "paper" | "night";
  visible?: boolean;
  className?: string;
  children: ReactNode;
};

export function Bubble({ tail, variant = "paper", visible = true, className = "", children }: BubbleProps) {
  return (
    <div
      className={`bubble ${className}`}
      data-tail={tail}
      data-variant={variant}
      data-visible={visible}
    >
      {children}
    </div>
  );
}
