import { site } from "@/content/site";

/**
 * Instant poster: a server-rendered, dependency-free stand-in for the Hello scene (dawn sky, two
 * hills, the path, the tortoise at rest). The headline is real HTML text, so it is the LCP element
 * and paints with the first HTML. Decorative only: the real <h1> lives in StaticView, so the whole
 * poster is aria-hidden. It sits under the live world (same fixed box) and is removed once the world
 * has faded in (html[data-world="ready"], see globals.css `.poster`).
 */
export function Poster() {
  return (
    <div className="poster" aria-hidden="true">
      <svg className="poster-scene" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" focusable="false">
        <defs>
          <linearGradient id="poster-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f3d9c4" />
            <stop offset="1" stopColor="#f8e7c8" />
          </linearGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#poster-sky)" />
        <circle cx="1120" cy="250" r="64" fill="var(--honey)" opacity="0.85" />
        <path d="M0 640C180 540 340 520 520 580S860 560 1040 500 1320 520 1440 560V900H0Z" fill="var(--sage)" />
        <path d="M0 720C220 650 420 650 640 700S1040 690 1220 650 1380 660 1440 680V900H0Z" fill="var(--moss)" />
        <path d="M0 790C260 760 520 790 760 780S1200 760 1440 790V900H0Z" fill="var(--paper-dim)" />
      </svg>
      <svg className="poster-tortoise" viewBox="0 0 200 130" focusable="false">
        <ellipse cx="100" cy="122" rx="70" ry="6" fill="var(--forest)" opacity="0.18" />
        <path d="M34 108C34 62 64 34 104 34s70 28 70 74Z" fill="var(--shell)" stroke="var(--forest)" strokeWidth="3" strokeLinejoin="round" />
        <path d="M70 108c0-26 10-44 34-44m30 44c0-24-8-40-30-44" fill="none" stroke="var(--forest)" strokeWidth="3" opacity="0.5" />
        <path d="M168 94c14-4 26 2 26 12s-12 14-26 8Z" fill="var(--moss)" stroke="var(--forest)" strokeWidth="3" strokeLinejoin="round" />
        <rect x="58" y="104" width="22" height="16" rx="7" fill="var(--moss)" stroke="var(--forest)" strokeWidth="3" />
        <rect x="132" y="104" width="22" height="16" rx="7" fill="var(--moss)" stroke="var(--forest)" strokeWidth="3" />
        <circle cx="186" cy="100" r="2.5" fill="var(--forest)" />
      </svg>
      <div className="poster-card paper-card">
        <p className="poster-h1 hello-h1">Hi, I&apos;m {site.displayName}.</p>
        <p className="poster-sub">{site.role}</p>
      </div>
    </div>
  );
}
