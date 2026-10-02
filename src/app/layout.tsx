import type { Metadata } from "next";
import { Caveat, Fraunces, JetBrains_Mono, Nunito } from "next/font/google";
import { site } from "@/content/site";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
  axes: ["SOFT", "opsz"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${site.displayName} — ${site.role}`,
  description: `Walk with ${site.tortoiseName} the tortoise through ${site.displayName}'s story: projects, skills, experience and how to hire a ${site.role}.`,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${nunito.variable} ${caveat.variable} ${jetbrainsMono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
