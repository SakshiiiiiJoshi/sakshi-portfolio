import type { ReactNode } from "react";

type ButtonProps = {
  variant?: "primary" | "secondary" | "night-primary" | "night-secondary";
  href?: string;
  onClick?: () => void;
  className?: string;
  "aria-label"?: string;
  /** Anchor only: download the target (true) or save it under this file name. */
  download?: boolean | string;
  children: ReactNode;
};

const base =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-[22px] py-3 font-body font-bold transition duration-[120ms] hover:-translate-y-px";

const variants = {
  primary: "bg-moss-dark text-paper hover:bg-forest",
  secondary: "border-2 border-forest text-forest bg-transparent hover:bg-sage/30",
  "night-primary": "bg-honey text-night hover:bg-honey-soft",
  "night-secondary": "border-2 border-paper text-paper bg-transparent hover:bg-paper/15",
};

export function Button({ variant = "primary", href, onClick, className = "", download, children, ...rest }: ButtonProps) {
  const cls = `${base} ${variants[variant]} ${className}`;
  const label = rest["aria-label"];
  if (href) {
    const external = /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        className={cls}
        aria-label={label}
        onClick={onClick}
        download={download}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls} aria-label={label}>
      {children}
    </button>
  );
}
