# Ambient audio (optional, off by default)

Sound is opt-in: nothing is fetched or played until the visitor turns the sound toggle on (after a
user gesture). With no files listed in `manifest.json`, the audio module does nothing and logs
nothing.

## Add files

1. Drop the files below into this folder.
2. List the ones you added in `manifest.json`, e.g.
   `{ "files": ["wind-meadow.mp3", "stream.mp3", "crickets-dusk.mp3", "night-pond.mp3", "step.mp3"] }`
   (the manifest keeps the browser from requesting files that do not exist).

| File | Plays | Notes |
|---|---|---|
| `wind-meadow.mp3` | progress 0 – 0.44 (stops 1–3) | soft wind / meadow bed, seamless loop |
| `stream.mp3` | 0.34 – 0.62 (stop 4) | gentle stream, seamless loop |
| `crickets-dusk.mp3` | 0.54 – 0.94 (stops 5–6) | evening crickets, seamless loop |
| `night-pond.mp3` | 0.86 – 1.0 (stop 7) | night crickets + pond, seamless loop |
| `step.mp3` | while walking | one short footstep tick (not a loop); rate follows walk speed |

## Specs

- Mono, 64 kbps MP3, ≤ 150 KB each, loops ≤ 60 s and seamless (no click at the loop point).
- Licensed CC0 or self-made. If a license requires credit, add it to the site footer.
- Playback: master gain 0.35, crossfades ≤ 0.6 s, auto-muted when the tab loses focus.
