import { Bubble } from "@/components/stops/shared/Bubble";
import { Button } from "@/components/stops/shared/Button";
import { Caption } from "@/components/stops/shared/Caption";
import { Card } from "@/components/stops/shared/Card";
import { Tag } from "@/components/stops/shared/Tag";
import { Grain } from "@/components/world/layers/Grain";

const core = [
  ["paper", "#F6EEDC"], ["moss", "#5B7F4A"], ["sage", "#A8BF8A"], ["forest", "#2F4A3A"],
  ["shell", "#7A8F3C"], ["honey", "#F2B84B"], ["coral", "#E8875B"], ["mist", "#CFE5E0"],
  ["plum", "#5B4B6B"], ["night", "#1F2A44"], ["ink", "#2B2A26"],
  ["paper-dim", "#EADFC6"], ["moss-dark", "#46663A"], ["honey-soft", "#F8D98E"],
  ["coral-soft", "#F2B297"], ["mist-deep", "#A9CFC8"], ["night-soft", "#2E3B5F"], ["ink-soft", "#5A574D"],
];

const skies: [string, string][] = [
  ["hello · dawn", "#F3D9C4, #F8E7C8, #CFE5E0"],
  ["about · morning", "#DCEBE4, #F6EEDC"],
  ["skills · late morning", "#CFE5E0, #F6EEDC"],
  ["projects · noon", "#BFDDE0, #E4F0E8"],
  ["experience · golden hour", "#F2B84B, #F6D9A8, #E8875B"],
  ["fun · dusk", "#E8875B, #B8657A, #5B4B6B"],
  ["contact · night", "#2E3B5F, #1F2A44"],
];

const scale = [
  ["hero", "var(--text-hero)", "font-display font-bold"],
  ["h1", "var(--text-h1)", "font-display font-bold"],
  ["h2", "var(--text-h2)", "font-display font-semibold"],
  ["h3", "var(--text-h3)", "font-display font-semibold"],
  ["body", "var(--text-body)", "font-body"],
  ["small", "var(--text-small)", "font-body font-semibold"],
  ["hand", "var(--text-hand)", "font-hand"],
  ["mono", "var(--text-mono)", "font-mono"],
] as const;

function Showcase({ variant }: { variant: "paper" | "night" }) {
  const night = variant === "night";
  return (
    <div className={`flex flex-col items-start gap-6 rounded-lg p-6 ${night ? "bg-night text-paper" : "bg-paper-dim"}`}>
      <Caption>Narrator caption ({variant})</Caption>
      <Bubble tail="down" variant={variant}>Walk with me? I&apos;ll show you around.</Bubble>
      <Bubble tail="left" variant={variant}>Tail left</Bubble>
      <Bubble tail="right" variant={variant}>Tail right</Bubble>
      <Card title="Case study title" variant={variant}>
        <p>Card body copy sits on a paper surface with a stitched dashed border.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Tag variant={variant}>TypeScript</Tag>
          <Tag variant={variant}>React</Tag>
        </div>
      </Card>
      <div className="flex flex-wrap gap-3">
        {night ? (
          <Button variant="night-primary" href="#">Night primary</Button>
        ) : (
          <>
            <Button href="#">Primary</Button>
            <Button variant="secondary" href="#">Secondary</Button>
          </>
        )}
        <Button variant={night ? "night-primary" : "primary"} href="https://example.com">External</Button>
      </div>
    </div>
  );
}

export default function StyleguidePage() {
  return (
    <div className="fixed inset-0 overflow-y-auto">
      <main className="mx-auto flex max-w-5xl flex-col gap-12 px-4 py-12">
        <h1>Styleguide</h1>

        <section className="flex flex-col gap-4">
          <h2>Colors</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {core.map(([name, hex]) => (
              <div key={name} className="overflow-hidden rounded-sm shadow-paper-1">
                <div className="h-16" style={{ background: `var(--${name})` }} />
                <div className="bg-paper p-2 mono">--{name}<br />{hex}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2>Type scale</h2>
          {scale.map(([name, size, cls]) => (
            <p key={name} className={cls} style={{ fontSize: size }}>
              {name} — Slow is smooth, smooth is fast.
            </p>
          ))}
        </section>

        <section className="flex flex-col gap-4">
          <h2>Components</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Showcase variant="paper" />
            <Showcase variant="night" />
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2>Sky gradients</h2>
          {skies.map(([label, stops]) => (
            <div
              key={label}
              className="mono flex h-16 items-end rounded-md p-2 text-ink"
              style={{ background: `linear-gradient(to bottom, ${stops})` }}
            >
              <span className="rounded-sm bg-paper/80 px-2">{label}</span>
            </div>
          ))}
        </section>
      </main>
      <Grain />
    </div>
  );
}
