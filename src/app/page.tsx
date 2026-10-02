import { site } from "@/content/site";

export default function Home() {
  return (
    <main className="flex h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-5xl font-bold" style={{ fontFamily: "var(--font-display), serif" }}>
        Hi, I&apos;m {site.displayName}.
      </h1>
      <p className="text-lg">
        I&apos;m a {site.role} who builds {site.whatYouBuild}.
      </p>
      <p className="text-2xl" style={{ fontFamily: "var(--font-hand), cursive" }}>
        {site.tagline}
      </p>
    </main>
  );
}
