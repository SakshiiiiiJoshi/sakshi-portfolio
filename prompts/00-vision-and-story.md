# 00 — Vision & Story

## 1. One-line pitch
A storybook where a tortoise walks you through a developer's story. You never scroll the page; you walk with the tortoise.

## 2. Why a tortoise
- It reads as **patience, craft, durability, steady progress**, which are good traits for an engineer.
- It carries its home on its back, a natural place for the "tech stack" to live (the shell pattern).
- It is slow, so the site can be **unhurried and calm** where most portfolios are loud and busy.
- The fable (the tortoise wins) gives a subtle, memorable theme: *consistency beats flash*.
- It is not a cliché developer mascot (no robots or laptops), so the site is memorable.

## 3. Audience and what each wants in 30 seconds
| Visitor | Wants | The story must give them |
|---|---|---|
| Recruiter | Role, stack, years, availability, resume | Hello + Contact stops, `StaticView`, resume button |
| Hiring manager / tech lead | Proof of skill, real projects, decisions | Projects stop with case studies, Skills garden |
| Founder / client | Can this person ship, and are they pleasant to work with? | About + Fun facts tone, Projects outcomes |
| Fellow dev / peer | Craft, taste, curiosity | The site itself, Easter eggs, tech details |

## 4. Narrative arc (the walk)
The story is a day, from dawn to night, and a journey, from home to a pond, with seven chapters.

1. **Hello (dawn):** The tortoise wakes at the start of the path and sees the visitor. It introduces the developer: name, role, one-line promise.
2. **About (morning):** The tortoise strolls through a meadow and shares the developer's story: where they're from, how they got into code, what they care about.
3. **Skills Garden (late morning):** The tortoise stops in a garden where each plant is a skill. Visitors learn what grows well (strong skills) and what is still sprouting (learning).
4. **Stepping Stones (noon):** A stream crosses the path. Each stone is a project. The tortoise hops from stone to stone. Each stone opens a mini case study.
5. **Experience Trail (golden hour):** The path climbs a hill with wooden signposts, one per role, showing the career journey and growth.
6. **Fun Facts Campfire (dusk):** The tortoise sits by a fire. The tone gets personal: hobbies, quirks, what the developer does away from the keyboard.
7. **Contact Pond (night):** Fireflies, still water, a moon. The tortoise waves and the CTA appears: "Let's build something."

**Emotional curve:** curiosity → warmth → competence → trust → closeness → invitation.

## 5. Tone of voice
- **Warm, plain, a little wry.** Like a friendly narrator in a picture book, but the facts are precise.
- Short sentences. Active verbs. No buzzword soup ("synergy", "passionate rockstar").
- The tortoise narrates in the **third person** for scene-setting captions (*"Tuck pauses at the garden gate."*) and the developer speaks in the **first person** inside speech bubbles and case studies (*"I built this to…"*).
- One tiny joke per stop at most. Humor never blocks information.
- Numbers beat adjectives: "cut load time 4.2 s → 1.1 s" beats "made it fast".

## 6. The tortoise character bible
- **Name:** `{{TORTOISE_NAME}}`. Options: *Tuck*, *Pebble*, *Gigi*, *Moss*, *Shelby*, *Bit*. Default if undecided: **Pebble**.
- **Species look:** a rounded, friendly Hermann-style tortoise. A domed shell in olive/moss tones with a honey-colored hex pattern. Cream-colored plastron and belly, sage-green skin, and small dark round eyes with a tiny highlight.
- **Personality:** patient, curious, quietly determined, a bit shy. It never rushes, and it gets visibly delighted by small things (butterflies, a good bug fix).
- **Signature details:**
  - A tiny **backpack or satchel** strapped on the shell that gains items along the walk (a leaf at About, a seed packet at Skills, a map at Projects, a lantern at Experience, a marshmallow stick at Fun, and a letter at Contact).
  - A faint **shell pattern** whose hex cells light up in the colors of the tech stack as skills are revealed (optional polish, see P08).
  - Slow **blink** every ~4 seconds while idle.
- **Behaviors by state:**
  | State | Trigger | Description |
  |---|---|---|
  | `idle` | no input for 1 s | breathing, blinking, head tilts slightly |
  | `walk` | progress changing | alternating diagonal legs, subtle shell bob, head forward |
  | `peek` | arrival at a stop | head extends and looks at the content |
  | `hide` | fast scroll or easter egg (click shell) | head and legs retract; shell wobbles |
  | `wave` | contact stop | front-right leg lifts and waves |
  | `sleep` | idle > 20 s at contact | eyes closed, "z z z" bubbles |
- **Never:** speaks in the first person, gets human clothes, or looks scary or glossy. Keep it matte, paper-cut and gentle.

## 7. Differentiators (what makes this not "just another portfolio")
1. The page **never scrolls**. The interaction *is* the story.
2. The scenery tells the **time of day** and the **mood** of each chapter.
3. Projects are not a grid. They are **stones the visitor hops across**.
4. A visible **backpack** that fills up, a quiet metaphor for accumulated experience.
5. A **"Skip the walk"** button for impatient recruiters. It respects their time and shows confidence.

## 8. Success criteria
- A first-time visitor understands in 10 seconds: *who this is, what they do, and how to scroll*.
- A recruiter can reach the resume or contact info in under 15 seconds (via the HUD or Skip).
- The walk feels **smooth (60 fps on a mid-range laptop and a recent phone)**.
- Lighthouse: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
- At least one stranger says "ooh, cute" and one says "I'd hire this person."

## 9. Out of scope (v1)
Blog, CMS, dark/light toggle (the day→night *is* the theme), multi-language, user accounts, heavy 3D, long audio loops. Possible v2: blog "trail extension", guestbook, tortoise skins.

## 10. Open questions to resolve before building
Answer these in `02-content-bible.md`:
- The developer's name, title and location?
- The tortoise's name?
- 3–5 projects to feature (with real links and outcomes)?
- Roles and dates for the experience trail?
- Resume file and contact links?
- Do you want ambient sound (default: **off**, with an opt-in toggle)?
