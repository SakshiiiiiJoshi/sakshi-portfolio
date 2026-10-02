import { Experience } from "@/components/shell/Experience";
import { Poster } from "@/components/shell/Poster";
import { StaticView } from "@/components/static/StaticView";

export default function Home() {
  return (
    <>
      <Poster />
      <Experience />
      <main id="main">
        <StaticView />
      </main>
      <noscript>
        <p className="noscript-note">JavaScript is off, so the animated walk is unavailable. Everything is here as a plain page.</p>
      </noscript>
    </>
  );
}
