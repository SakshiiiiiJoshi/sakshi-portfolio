export interface Site {
  name: string;
  displayName: string;
  role: string;
  location: string;
  yearsExperience: number;
  availability: string;
  tagline: string;
  tortoiseName: string;
  email: string;
  github: string;
  linkedin: string;
  twitterX: string;
  resumePdf: string;
  siteUrl: string;
  primaryStack: string[];
  whatYouBuild: string;
  languages: string;
  timezone: string;
}

export const site: Site = {
  name: "Sakshi",
  displayName: "Sakshi",
  role: "Full-Stack Developer",
  location: "Mumbai, India",
  yearsExperience: 0,
  availability: "Freelancing · open to contract work",
  tagline: "Learning by doing — bugs included.",
  tortoiseName: "Pebble",
  email: "joshisakshi1204@gmail.com",
  github: "https://github.com/SakshiiiiiJoshi",
  linkedin: "https://linkedin.com/in/sakshi-joshi300",
  twitterX: "",
  resumePdf: "/resume.pdf",
  siteUrl: "https://example.com",
  primaryStack: ["Next.js", "React", "Node.js", "SQL"],
  whatYouBuild: "polished web apps from design to database",
  languages: "English, Hindi & Marathi",
  timezone: "IST (UTC+5:30)",
};

/** Stop 1 — Hello copy (02-content-bible.md §2). */
export const hello = {
  bubble: "Walk with me? I'll show you around.",
};

/** Global HUD strings (02-content-bible.md §1, 04 §3). */
export const hud = {
  skip: "Skip the walk",
  back: "Back to the walk",
  soundLabel: "Sound on/off",
  soundOn: "Sound on",
  soundOff: "Sound off",
  navLabel: "Story stops",
  logoLabel: "Back to the start",
  hintDesktop: "Scroll, swipe, or use ← → to walk",
  hintMobile: "Swipe to walk",
  helpLabel: "Keyboard help",
  helpTitle: "Keyboard map",
  helpClose: "Close",
  announce: (n: number, total: number, title: string) => `Stop ${n} of ${total}: ${title}`,
  keys: [
    { keys: "→ ↓ Space PgDn", does: "Next stop" },
    { keys: "← ↑ PgUp", does: "Previous stop" },
    { keys: "Shift + arrows", does: "Walk a little" },
    { keys: "Home / End", does: "First / last stop" },
    { keys: "1 – 7", does: "Jump to a stop" },
    { keys: "Esc", does: "Close a card" },
    { keys: "S", does: "Skip / resume the walk" },
    { keys: "T", does: "Make the tortoise spin" },
  ],
};

export interface AboutValue {
  icon: "craft" | "clarity" | "care";
  title: string;
  caption: string;
}

/** Stop 2 — About copy (02-content-bible.md §3). Bio must stay <= 90 words. */
export const about = {
  title: "A little about me",
  bio: `I'm ${site.displayName}, a ${site.role} based in ${site.location}. I'm a 3rd-year IT engineering student who builds things to learn — full-stack web apps, polished UIs and everything in between. I like solving real problems with clean code, and I'm not afraid of a good bug-hunt at midnight. ${site.tagline}`,
  facts: [
    "IT Engg. · 3rd year",
    site.location,
    site.languages,
    site.timezone,
  ],
  careAbout: "I care about",
  values: [
    { icon: "craft", title: "Craft", caption: "Details are the product." },
    { icon: "clarity", title: "Clarity", caption: "Simple beats clever." },
    { icon: "care", title: "Care", caption: "Software is for people." },
  ] satisfies AboutValue[],
  toast: "+ curiosity",
};
