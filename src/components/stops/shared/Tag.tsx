import type { ReactNode } from "react";

type TagProps = {
  variant?: "paper" | "night";
  children: ReactNode;
};

export function Tag({ variant = "paper", children }: TagProps) {
  return (
    <span className="chip" data-variant={variant}>
      {children}
    </span>
  );
}
