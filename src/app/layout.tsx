import type { Metadata, Viewport } from "next";
import { Caveat, Fraunces, JetBrains_Mono, Nunito } from "next/font/google";
import { site } from "@/content/site";
import { MODE_BOOT_SCRIPT } from "@/lib/a11y/modeStorage";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--nf-display",
  subsets: ["latin"],
  axes: ["SOFT", "opsz"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--nf-body",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--nf-hand",
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
  preload: false, // accents only: fetched when first used, so display + body own the critical path
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--nf-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: `${site.displayName} — ${site.role}`,
  description: `Walk with ${site.tortoiseName} the tortoise through ${site.displayName}'s story: projects, skills, experience and how to hire a ${site.role}.`,
};

// viewport-fit=cover makes env(safe-area-inset-*) resolve to real values on notched phones.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F3D9C4", // dawn; Experience updates it as the walk settles on each stop
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: MODE_BOOT_SCRIPT }} />
      </head>
      <body
        className={`${fraunces.variable} ${nunito.variable} ${caveat.variable} ${jetbrainsMono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
