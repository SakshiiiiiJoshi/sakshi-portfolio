export type ViewMode = "walk" | "static";

const KEY = "walk-mode";

export function readStoredMode(): ViewMode | null {
  try {
    const v = window.sessionStorage.getItem(KEY);
    return v === "walk" || v === "static" ? v : null;
  } catch {
    return null;
  }
}

export function writeStoredMode(mode: ViewMode) {
  try {
    window.sessionStorage.setItem(KEY, mode);
  } catch {
    /* storage blocked: the choice just won't persist */
  }
}

/** Mirrors the inline script in layout.tsx: stored choice, else reduced motion → static, else walk. */
export function resolveInitialMode(): ViewMode {
  return readStoredMode() ?? (window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "static" : "walk");
}

/** Source of the inline <head> script (keep in sync with resolveInitialMode). */
export const MODE_BOOT_SCRIPT = `(function(){var d=document.documentElement;d.classList.add("js");var m=null;try{m=sessionStorage.getItem("${KEY}")}catch(e){}if(m!=="walk"&&m!=="static"){m=window.matchMedia("(prefers-reduced-motion: reduce)").matches?"static":"walk"}d.setAttribute("data-mode",m)})()`;
