// path sampling helpers (progress → x, y, angle) — filled in by P05
export interface PathSample {
  x: number;
  y: number;
  angle: number;
}

export function samplePath(progress: number): PathSample {
  void progress;
  return { x: 0, y: 0, angle: 0 };
}
