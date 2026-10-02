# Setup

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm typecheck  # tsc --noEmit
pnpm lint
pnpm format
pnpm build && pnpm start
```

## Folder map

- `src/app/` — layout (fonts), page, globals, not-found, icon
- `src/components/` — `shell/` (Experience, Stage, HUD), `world/` (layers, sets), `tortoise/`, `stops/`, `static/`
- `src/lib/` — `walk/` (constants, store, engine, path, timeline), `a11y/`, `perf/`, `gsap.ts`
- `src/content/` — typed copy: site, skills, projects, experience, fun, captions
- `public/` — resume.pdf, art/, audio/

Stubs say which prompt fills them in (e.g. `// filled in by P05`).

## Build prompts

The specs and ordered build prompts live in [`prompts/`](./prompts/README.md). Run P01 → P19 in order.
