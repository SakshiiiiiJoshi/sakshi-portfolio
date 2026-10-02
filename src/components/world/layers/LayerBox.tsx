import type { CSSProperties, ReactNode } from "react";

export interface LayerBoxProps {
  id: string;
  /** viewBox size in design units; on screen the box is (w, h) * --s. */
  w: number;
  h: number;
  /** Parallax speed; the hook translates by -p * WORLD_W * speed. */
  speed: number;
  /** If set, the offset wraps modulo this tile width (seamless endless layers). */
  wrap?: number;
  /** Paper-cut depth (counts against the <= 5 filtered layers budget). */
  shadow?: boolean;
  /** Distance from the stage top in design units (default: bottom-anchored). */
  top?: number;
  children: ReactNode;
}

/** A parallax layer: absolutely positioned, translated imperatively by useWorldTransform. */
export function LayerBox({ id, w, h, speed, wrap, shadow, top, children }: LayerBoxProps) {
  const style: CSSProperties = {
    width: `calc(var(--s) * ${w}px)`,
    height: `calc(var(--s) * ${h}px)`,
  };
  if (top === undefined) style.bottom = 0;
  else style.top = `calc(var(--s) * ${top}px)`;
  return (
    <div
      aria-hidden="true"
      className={shadow ? "world-layer layer-shadow" : "world-layer"}
      data-layer={id}
      data-speed={speed}
      data-wrap={wrap}
      style={style}
    >
      <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMinYMin meet" style={{ display: "block", overflow: "visible" }}>
        {children}
      </svg>
    </div>
  );
}
