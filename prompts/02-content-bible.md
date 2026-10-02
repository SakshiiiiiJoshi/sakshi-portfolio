# 02 — Content Bible

> Fill every `{{PLACEHOLDER}}`. Sample copy is provided so the site can be built and read before your real facts are in. Replace it before launch. All final copy lives in `src/content/*.ts` (see `05`), never hardcoded in components.

---

## 0. Your facts (fill this first)

```yaml
name: {{FULL_NAME}}
display_name: {{FIRST_NAME or NICKNAME}}
role: {{e.g. Full-Stack Software Developer}}
location: {{CITY, COUNTRY}}
years_experience: {{N}}
availability: {{Open to full-time roles | Open to freelance | Not looking}}
tagline: {{One line, ≤ 12 words}}
tortoise_name: {{Pebble}}
email: {{you@example.com}}
github: {{url}}
linkedin: {{url}}
twitter_x: {{url or leave blank}}
resume_pdf: {{/resume.pdf}}   # file to place in /public
site_url: {{https://yourdomain.com}}
primary_stack: [{{TypeScript}}, {{React}}, {{Node.js}}, {{PostgreSQL}}]
```

Guiding questions to answer before writing copy:
1. What is the one thing you want a stranger to remember about you?
2. What kind of work do you want more of?
3. What are you proudest of (shipped, not just built)?
4. What do friends say you are like to work with?

---

## 1. Global strings

| Key | Sample copy |
|---|---|
| Site title | `{{FIRST_NAME}} — {{ROLE}}` |
| Meta description | "Walk with {{TORTOISE_NAME}} the tortoise through {{FIRST_NAME}}'s story: projects, skills, experience and how to hire a {{ROLE}}." |
| Scroll hint (desktop) | "Scroll, swipe, or use ← → to walk" |
| Scroll hint (mobile) | "Swipe to walk" |
| Skip button | "Skip the walk" |
| Back to walk button | "Back to the walk" |
| Sound toggle (off / on) | "Sound off" / "Sound on" |
| Loading text | "{{TORTOISE_NAME}} is lacing up…" |
| 404 | "This path leads nowhere. {{TORTOISE_NAME}} is just as confused." + button "Back to the start" |

---

## 2. Stop 1 — Hello (`hello`, dawn)

**Scene caption (Caveat, narrator):** "Dawn. {{TORTOISE_NAME}} wakes and sees you."

**Hero headline (Fraunces):** "Hi, I'm {{FIRST_NAME}}."
**Sub-headline:** "I'm a {{ROLE}} who builds {{WHAT_YOU_BUILD, e.g. fast, friendly web products}}."
**Tagline (Caveat):** "Slow is smooth, smooth is fast."
**Speech bubble from the tortoise:** "Walk with me? I'll show you around."
**Primary hint:** "Scroll, swipe, or use ← → to begin" + an animated chevron.
**Secondary:** the availability chip, "● {{AVAILABILITY}}".

Notes: the headline must be readable immediately, before any interaction. The page `<h1>` lives here.

---

## 3. Stop 2 — About (`about`, morning)

**Narrator caption:** "Morning. The meadow is quiet, the path is long."
**Title:** "A little about me"
**Bio (speech bubble / card, 60–90 words, first person):**
> "I'm {{FIRST_NAME}}, a {{ROLE}} based in {{LOCATION}}. I got into code {{HOW/WHEN YOU STARTED}}, and I've been hooked on {{WHAT YOU LOVE, e.g. turning messy problems into clear, calm software}} ever since. I like {{VALUES, e.g. small teams, clear writing, boring technology that works}}. When I build something, I want it to feel as good as it works."

**Quick-facts strip (mono chips):** `{{N}} yrs experience` · `{{LOCATION}}` · `{{LANGUAGES SPOKEN}}` · `{{TIMEZONE}}`
**Three "I care about" icons with 1-line captions:**
1. **Craft:** "Details are the product."
2. **Clarity:** "Simple beats clever."
3. **Care:** "Software is for people."
(Replace with your own three values.)
**Backpack item acquired:** a leaf (`+ curiosity`) — a tiny toast, optional.

---

## 4. Stop 3 — Skills Garden (`skills`, late morning)

**Narrator caption:** "Late morning. Something is growing here."
**Title:** "What grows well"
**Intro line:** "Plants are skills. Taller means I use it daily; sprouts are what I'm learning."

**Skill model (all stored as data):**
```ts
{ name: string, group: "frontend"|"backend"|"data"|"tools"|"practices",
  level: 1|2|3|4|5,        // plant height: 1 sprout … 5 tall flower
  note?: string,           // one short line shown on hover/focus
  learning?: boolean }     // renders as a sprout with a tiny watering can
```

**Sample groups** (replace with the user's truth):
- **Frontend (sunflowers):** TypeScript 5, React 5, Next.js 4, Tailwind 5, GSAP 3
- **Backend (mushrooms):** Node.js 4, Express/Fastify 4, REST + GraphQL 4, Auth 3
- **Data (tulips):** PostgreSQL 4, Prisma 3, Redis 2, MongoDB 3
- **Tools (ferns):** Git 5, Docker 3, CI/CD 3, Vercel/AWS 3, Figma 3
- **Practices (daisies):** Testing 3, Code review 4, Accessibility 4, Performance 4
- **Learning (sprouts):** {{e.g. Rust, WebGL, Go}}

**Interaction copy:** hover/focus on a plant shows a tooltip "{{Skill}} — {{note}}"; groups have handwritten labels on small signs ("Frontend patch").
**Backpack item:** a seed packet.
**Accessibility:** also render a plain list (visually hidden but screen-reader-available) of skills with levels as text, e.g. "TypeScript, advanced".

---

## 5. Stop 4 — Stepping Stones: Projects (`projects`, noon)

**Narrator caption:** "Noon. A stream cuts across the path. {{TORTOISE_NAME}} hops from stone to stone."
**Title:** "Things I've built"
**Intro line:** "Each stone is a project. Step on one to read the story."

### 5.1 Project data model
```ts
{
  slug: string,
  title: string,
  oneLiner: string,            // ≤ 90 chars
  role: string,                // "Solo developer" | "Frontend lead" ...
  year: string,
  stack: string[],             // 3–8 tags
  problem: string,             // 1–2 sentences
  approach: string,            // 2–3 sentences: key decisions, tradeoffs
  outcome: string,             // measurable result if possible
  highlights?: string[],       // up to 3 bullets
  links: { live?: string, repo?: string, writeup?: string },
  image?: string,              // optional screenshot (alt text required)
  stoneColor: "moss"|"sage"|"honey"|"coral"  // stone tint
}
```

### 5.2 Case-study card layout
Title (h2) → role · year (mono) → one-liner → **Problem / What I did / Result** (three short labeled blocks) → stack tags → links (Live, Code, Write-up) → optional screenshot (framed like a polaroid).

### 5.3 Project slots (3–5 stones; sample content)
**Stone 1 — {{PROJECT_1_TITLE}}**
- One-liner: "{{A short punchy summary}}"
- Problem: "{{Who had what pain?}}"
- What I did: "{{Key design/engineering decisions. Say why.}}"
- Result: "{{e.g. Cut checkout time 38%, 12k monthly users}}"
- Stack: `{{Next.js}}` `{{TypeScript}}` `{{Postgres}}`
- Links: live `{{url}}`, repo `{{url}}`

**Stone 2 — {{PROJECT_2_TITLE}}** (same fields)
**Stone 3 — {{PROJECT_3_TITLE}}** (same fields)
**Stone 4 (optional) — {{PROJECT_4_TITLE}}**
**Stone 5 (optional) — "More on GitHub":** a small mossy stone linking to the GitHub profile.

**Writing tips:** lead with the problem, not the tech; include one real number; mention one tradeoff you made; keep each block ≤ 35 words.
**Backpack item:** a folded map.

---

## 6. Stop 5 — Experience Trail (`experience`, golden hour)

**Narrator caption:** "Golden hour. The path climbs. Each signpost marks a chapter."
**Title:** "The road so far"

### 6.1 Role data model
```ts
{ company: string, role: string, start: "YYYY-MM", end: "YYYY-MM"|"Present",
  location?: string, summary: string,          // 1–2 sentences
  wins: string[],                              // 2–3 bullets, each with a verb and a result
  stack?: string[] }
```

### 6.2 Sample entries (replace)
1. **{{COMPANY_NOW}}** — {{ROLE}} · {{START}} → Present
   "{{One-line scope}}" · Wins: "{{Shipped X that did Y}}", "{{Mentored N engineers}}"
2. **{{COMPANY_PREV}}** — {{ROLE}} · {{START}} → {{END}}
3. **{{COMPANY_FIRST}}** — {{ROLE or Internship}} · {{START}} → {{END}}
4. (Optional) **Education / Certifications** — {{DEGREE}}, {{SCHOOL}}, {{YEAR}}
Order: newest at the **top of the hill** (the path climbs to the present), so the visitor walks from oldest (bottom) to newest (top).

**Signpost format:** a wooden plank with the company + dates in mono, and a hanging card with summary + wins.
**Backpack item:** a lantern.

---

## 7. Stop 6 — Fun Facts Campfire (`fun`, dusk)

**Narrator caption:** "Dusk. The fire crackles. Story time."
**Title:** "Off the clock"
**Intro line:** "Pull up a log. A few things about me that aren't on the résumé."

**Facts (4–6, each ≤ 20 words, with a small emoji-free icon):**
1. "{{Hobby 1, e.g. I brew way too much coffee.}}"
2. "{{Hobby 2, e.g. I hike on weekends and take bad photos of good views.}}"
3. "{{Game / book / music}}"
4. "{{A weird skill or a fun stat}}"
5. "{{What you're currently learning/reading}}"
6. "{{Hidden easter-egg hint: 'Click the tortoise's shell.'}}"

**Marshmallow joke (optional, Caveat):** "My code is like this marshmallow: best slowly toasted."
**Backpack item:** a marshmallow stick.

---

## 8. Stop 7 — Contact Pond (`contact`, night)

**Narrator caption:** "Night. Fireflies. {{TORTOISE_NAME}} has one last thing to say."
**Title:** "Let's build something."
**Body:** "I'm {{AVAILABILITY_SENTENCE, e.g. open to full-time roles starting {{MONTH YEAR}}}}. If you have a problem worth solving, I'd love to hear about it."
**Primary CTA:** "Say hello" → `mailto:{{EMAIL}}`
**Secondary CTAs:** "Download résumé" (`/resume.pdf`), "GitHub", "LinkedIn".
**Availability chip:** "● {{AVAILABILITY}}" (honey dot, subtle pulse).
**Response-time line (Caveat):** "I usually reply within {{24 hours}}."
**Tortoise:** waves; after 20 s idle, falls asleep. A bubble: "Thanks for walking with me."
**Footer micro-line:** "Hand-drawn with SVG, GSAP, and patience. © {{YEAR}} {{NAME}}."
**Backpack item:** a letter (the tortoise holds it out).

---

## 9. Narrator captions (full list, Caveat, shown top-center of the scene on arrival, 3 s fade)
| Stop | Caption |
|---|---|
| hello | "Dawn. {{TORTOISE_NAME}} wakes and sees you." |
| about | "Morning. The meadow is quiet, the path is long." |
| skills | "Late morning. Something is growing here." |
| projects | "Noon. A stream cuts across the path." |
| experience | "Golden hour. The path climbs." |
| fun | "Dusk. The fire crackles. Story time." |
| contact | "Night. Fireflies. One last thing to say." |

## 10. Transitional micro-text between stops (optional, small Caveat at path edge)
- hello→about: "…a few steps on…"
- about→skills: "…something smells like soil…"
- skills→projects: "…is that water?"
- projects→experience: "…the hill begins…"
- experience→fun: "…the sky turns orange…"
- fun→contact: "…almost home."

## 11. Easter eggs (cheap, delightful)
1. Click/tap the tortoise → it hides in its shell, then peeks back out.
2. Press `T` → the tortoise does a tiny happy spin.
3. Konami code → fireflies swarm and briefly spell the first letter of the name.
4. At the Contact stop, wait 20 s → the tortoise sleeps and "z z z" floats up.
5. Console message: "🐢 Hi, curious dev. Want to talk? {{EMAIL}}".

## 12. Static view content mapping (for `StaticView`, P16)
Same data files, rendered as a normal scrolling page with one section per stop: Hello (h1) · About · Skills (grouped lists) · Projects (cards) · Experience (timeline list) · Fun facts · Contact. No illustrations required except a small tortoise in the header.

## 13. Image alt-text rules
- Decorative scenery: `alt=""` / `aria-hidden="true"`.
- Tortoise: `role="img"` with `aria-label` reflecting the state ("{{TORTOISE_NAME}} the tortoise walking").
- Screenshots: describe the interface in one sentence.
