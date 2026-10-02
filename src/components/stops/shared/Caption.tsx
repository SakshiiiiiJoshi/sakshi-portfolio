import type { ReactNode } from "react";

export function Caption({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`hand inline-block ${className}`}>
      {children}
      <svg
        aria-hidden="true"
        viewBox="0 0 120 8"
        preserveAspectRatio="none"
        className="block h-2 w-full"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 4 Q12 0 22 4 T42 4 T62 4 T82 4 T102 4 T118 4" />
      </svg>
    </p>
  );
}
