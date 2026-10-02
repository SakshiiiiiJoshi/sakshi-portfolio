/** Tiny hand-drawn shell mark (currentColor, decorative). */
export function ShellLogo({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 22c0-8 5-15 12-15s12 7 12 15z" />
      <path d="M16 7v15M9.5 11.5 12 22M22.5 11.5 20 22M5.5 17h21" />
      <path d="M3 22h26" />
    </svg>
  );
}
