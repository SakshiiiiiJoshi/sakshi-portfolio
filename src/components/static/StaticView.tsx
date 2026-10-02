import Image from "next/image";
import { about, site } from "@/content/site";
import { groupLabels, levelWords, skills, skillsCopy, type SkillGroup } from "@/content/skills";
import { projects, projectsCopy } from "@/content/projects";
import { experience, experienceCopy } from "@/content/experience";
import { funCopy, funFacts } from "@/content/fun";
import { contactCopy } from "@/content/contact";
import { ShellLogo } from "@/components/shell/ShellLogo";
import { CtaLink, EmailActions, TakeTheWalk } from "./StaticActions";
import { StaticRoot } from "./StaticRoot";

/*
 * The semantic page, server-rendered once from src/content/*. Visible in static mode and with JS off;
 * in walk mode it is clipped and aria-hidden (see StaticRoot + docs/a11y-strategy.md).
 * Heading ids use an `s-` prefix so they never collide with the walk overlays' ids.
 */

const GROUPS: SkillGroup[] = ["frontend", "backend", "data", "tools", "practices"];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function fmt(ym: string) {
  if (ym === "Present") return ym;
  const [y, m] = ym.split("-");
  return `${MONTHS[Number(m) - 1]} ${y}`;
}

function Section({ id, title, intro, children }: { id: string; title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section id={`s-${id}`} aria-labelledby={`s-${id}-title`} className="static-section">
      <h2 id={`s-${id}-title`} tabIndex={-1}>
        {title}
      </h2>
      {intro && <p className="static-intro">{intro}</p>}
      {children}
    </section>
  );
}

export function StaticView() {
  return (
    <StaticRoot>
      <div className="static-view">
        <span className="static-path" aria-hidden="true" />
        <header id="s-hello" className="static-header">
          <span className="static-mark" aria-hidden="true">
            <ShellLogo size={56} />
          </span>
          <h1 id="s-hello-title" tabIndex={-1}>
            Hi, I&apos;m {site.displayName}.
          </h1>
          <p className="static-role">
            {site.role} · {site.location}
          </p>
          <p className="static-avail">{site.availability}</p>
          <p className="static-intro">{site.tagline}</p>
          <div className="static-actions">
            <TakeTheWalk />
            <CtaLink type="github" href={site.github}>
              {contactCopy.github}
            </CtaLink>
            <CtaLink type="linkedin" href={site.linkedin}>
              {contactCopy.linkedin}
            </CtaLink>
            <CtaLink type="resume" href={site.resumePdf}>
              {contactCopy.resume}
            </CtaLink>
          </div>
        </header>

        <nav aria-label="Sections" className="static-toc">
          <ul>
            {[
              ["about", about.title],
              ["skills", skillsCopy.title],
              ["projects", projectsCopy.title],
              ["experience", experienceCopy.title],
              ["fun", funCopy.title],
              ["contact", contactCopy.title],
            ].map(([id, label]) => (
              <li key={id}>
                <a href={`#s-${id}`}>{label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <Section id="about" title={about.title}>
          <p>{about.bio}</p>
          <ul className="static-facts">
            {about.facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <h3>{about.careAbout}</h3>
          <ul className="static-values">
            {about.values.map((v) => (
              <li key={v.title}>
                <strong>{v.title}.</strong> {v.caption}
              </li>
            ))}
          </ul>
        </Section>

        <Section id="skills" title={skillsCopy.title} intro={skillsCopy.intro}>
          {GROUPS.map((g) => {
            const list = skills.filter((s) => s.group === g);
            if (!list.length) return null;
            return (
              <div key={g} className="static-group">
                <h3>{groupLabels[g]}</h3>
                <ul>
                  {list.map((s) => (
                    <li key={s.name}>
                      <span className="static-skill">{s.name}</span> — {s.learning ? "Learning" : levelWords[s.level]}
                      {s.note ? `. ${s.note}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </Section>

        <Section id="projects" title={projectsCopy.title} intro={projectsCopy.intro}>
          <ul className="static-cards">
            {projects.map((p) => (
              <li key={p.slug} className="static-card">
                <h3>{p.title}</h3>
                <p className="static-meta">
                  {p.role} · {p.year}
                </p>
                <p>{p.oneLiner}</p>
                {p.image && <Image src={p.image} alt={p.imageAlt ?? `Screenshot of ${p.title}`} width={800} height={500} className="static-shot" />}
                <dl>
                  <dt>Problem</dt>
                  <dd>{p.problem}</dd>
                  <dt>What I did</dt>
                  <dd>{p.approach}</dd>
                  <dt>Result</dt>
                  <dd>{p.outcome}</dd>
                </dl>
                <ul className="static-tags" aria-label="Tech used">
                  {p.stack.map((t) => (
                    <li key={t} className="chip">
                      {t}
                    </li>
                  ))}
                </ul>
                <p className="static-links">
                  {p.links.live && (
                    <a href={p.links.live} target="_blank" rel="noopener noreferrer">
                      Live site<span className="sr-only"> for {p.title}</span>
                    </a>
                  )}
                  {p.links.repo && (
                    <a href={p.links.repo} target="_blank" rel="noopener noreferrer">
                      Source code<span className="sr-only"> for {p.title}</span>
                    </a>
                  )}
                  {p.links.writeup && (
                    <a href={p.links.writeup} target="_blank" rel="noopener noreferrer">
                      Write-up<span className="sr-only"> for {p.title}</span>
                    </a>
                  )}
                </p>
              </li>
            ))}
          </ul>
          <p>
            <a href={site.github} target="_blank" rel="noopener noreferrer">
              {projectsCopy.moreCta}
            </a>
            . {projectsCopy.moreBody}
          </p>
        </Section>

        <Section id="experience" title={experienceCopy.title}>
          <ol className="static-timeline">
            {experience.map((r) => (
              <li key={`${r.company}-${r.start}`}>
                <h3>
                  {r.role}, {r.company}
                </h3>
                <p className="static-meta">
                  {fmt(r.start)} – {fmt(r.end)}
                  {r.location ? ` · ${r.location}` : ""}
                </p>
                <p>{r.summary}</p>
                <ul>
                  {r.wins.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
                {r.stack && (
                  <ul className="static-tags" aria-label="Tech used">
                    {r.stack.map((t) => (
                      <li key={t} className="chip">
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </Section>

        <Section id="fun" title={funCopy.title} intro={funCopy.intro}>
          <ul>
            {funFacts.map((f) => (
              <li key={f.text}>{f.text}</li>
            ))}
          </ul>
        </Section>

        <Section id="contact" title={contactCopy.title}>
          <p>{contactCopy.body}</p>
          <p>{contactCopy.replyTime}</p>
          <div className="static-actions">
            <EmailActions />
            <CtaLink type="resume" href={site.resumePdf}>
              {contactCopy.resume}
            </CtaLink>
            <CtaLink type="github" href={site.github}>
              {contactCopy.github}
            </CtaLink>
            <CtaLink type="linkedin" href={site.linkedin}>
              {contactCopy.linkedin}
            </CtaLink>
          </div>
        </Section>

        <footer className="static-footer">
          <p>{contactCopy.footer(new Date().getFullYear())}</p>
        </footer>
      </div>
    </StaticRoot>
  );
}
