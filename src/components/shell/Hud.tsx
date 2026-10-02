"use client";

import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { hud, site } from "@/content/site";
import { trapFocus } from "@/lib/a11y/focus";
import { useHudVisibility } from "@/lib/hud/useHudVisibility";
import { DotNav } from "./DotNav";
import { Hint } from "./Hint";
import { ShellLogo } from "./ShellLogo";
import { SoundToggle } from "./SoundToggle";

function HelpPopover({ onClose, id }: { onClose: () => void; id: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.querySelector<HTMLElement>("button")?.focus();
    const release = trapFocus(el, onClose);
    const onDown = (e: PointerEvent) => {
      if (e.target instanceof Node && !el.contains(e.target) && !(e.target as Element).closest?.("[data-help-trigger]")) onClose();
    };
    document.addEventListener("pointerdown", onDown);
    return () => {
      release();
      document.removeEventListener("pointerdown", onDown);
    };
  }, [onClose]);

  return (
    <div ref={ref} id={id} className="hud-help" role="dialog" aria-modal="false" aria-labelledby={`${id}-t`} data-scroll-region>
      <h2 id={`${id}-t`} className="hud-help-title">
        {hud.helpTitle}
      </h2>
      <dl className="hud-help-list">
        {hud.keys.map((k) => (
          <div key={k.keys}>
            <dt>
              <kbd>{k.keys}</kbd>
            </dt>
            <dd>{k.does}</dd>
          </div>
        ))}
      </dl>
      <button type="button" className="hud-help-close" onClick={onClose}>
        {hud.helpClose}
      </button>
    </div>
  );
}

/** Always-on overlay. In static mode only the logo shows (the SkipLink is the "Back to the walk" control). */
export function Hud({ progressRef, staticMode = false }: { progressRef?: RefObject<number>; staticMode?: boolean }) {
  const helpId = useId();
  const [helpOpen, setHelpOpen] = useState(false);
  const helpTrigger = useRef<HTMLButtonElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  useHudVisibility(hudRef);

  const closeHelp = () => {
    setHelpOpen(false);
    helpTrigger.current?.focus();
  };

  const logo = (
    <>
      <ShellLogo />
      <span className="hud-name">{site.displayName}</span>
    </>
  );

  return (
    <div ref={hudRef} className="hud" data-hud data-static={staticMode ? "" : undefined}>
      <header className="hud-top">
        {staticMode ? (
          <span className="hud-logo hud-logo-static">{logo}</span>
        ) : (
          <button type="button" className="hud-logo" aria-label={`${site.displayName} — ${hud.logoLabel}`} onClick={() => window.dispatchEvent(new CustomEvent("walk:goto", { detail: { id: "hello" } }))}>
            {logo}
          </button>
        )}
        {!staticMode && (
          <div className="hud-actions">
            <SoundToggle />
            <button
              ref={helpTrigger}
              type="button"
              className="hud-btn"
              data-help-trigger
              aria-label={hud.helpLabel}
              aria-expanded={helpOpen}
              aria-controls={helpOpen ? helpId : undefined}
              onClick={() => (helpOpen ? closeHelp() : setHelpOpen(true))}
            >
              ?
            </button>
            {helpOpen && <HelpPopover id={helpId} onClose={closeHelp} />}
          </div>
        )}
      </header>
      {!staticMode && progressRef && (
        <>
          <DotNav progressRef={progressRef} />
          <Hint />
        </>
      )}
    </div>
  );
}
