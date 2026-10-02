import { experience, type Role } from "@/content/experience";
import { WORLD_W } from "./constants";
import { pathYAt } from "./path";
import { camProgress } from "./stones";

/** The climb: progress range in which the tortoise walks past the signposts, oldest to newest. */
export const TRAIL = { start: 0.58, end: 0.74 } as const;
const SPAN = TRAIL.end - TRAIL.start;
/** Progress at which the Experience stop sits (set wrappers are anchored here). */
const STOP_P = 0.66;
const MARGIN = 0.012;
/** Fraction of a cell the progress must overshoot before the index flips back (anti-jitter). */
const HYSTERESIS = 0.12;
/** Signs stand this far ahead of the tortoise's feet (design units). */
const SIGN_AHEAD = 200;

/** Roles in walking order: oldest first (the data file is newest first). */
export const trailRoles = (roles: Role[] = experience): Role[] => [...roles].reverse();

export const inTrail = (p: number) => p >= TRAIL.start - MARGIN && p <= TRAIL.end + MARGIN;

/** Progress at the middle of role i's cell (what keyboard / click / snap glide to). */
export function roleCenter(i: number, m: number): number {
  const k = Math.min(Math.max(i, 0), m - 1);
  return TRAIL.start + ((k + 0.5) / m) * SPAN;
}

/** Active role: the cell the progress is in (nearest within +-1/(2M)); -1 off the climb. */
export function roleIndexAt(p: number, m: number, prev: number): number {
  if (m <= 0 || !inTrail(p)) return -1;
  const c = ((p - TRAIL.start) / SPAN) * m;
  if (prev >= 0 && prev < m && c > prev - HYSTERESIS && c < prev + 1 + HYSTERESIS) return prev;
  return Math.min(Math.max(Math.floor(c), 0), m - 1);
}

/**
 * Sign position in set-local design units (x = 0 where the tortoise stands at the Experience stop).
 * Uses camProgress: below 0.6 the camera lags progress, so the ground under the feet is camera-keyed.
 */
export function signAnchor(i: number, m: number, anchorX: number): { x: number; y: number } {
  const dx = (camProgress(roleCenter(i, m)) - STOP_P) * WORLD_W + SIGN_AHEAD;
  return { x: dx, y: pathYAt(STOP_P * WORLD_W + anchorX + dx) };
}

const YM = /^(\d{4})-(0[1-9]|1[0-2])$/;

function monthIndex(s: string, now: Date): number | null {
  if (s === "Present") return now.getFullYear() * 12 + now.getMonth();
  const m = YM.exec(s);
  return m ? Number(m[1]) * 12 + Number(m[2]) - 1 : null;
}

/** "2 yrs 4 mos" (inclusive of both months). null if a date is unparseable or the range is reversed. */
export function formatDuration(start: string, end: string, now: Date = new Date()): string | null {
  const a = monthIndex(start, now);
  const b = monthIndex(end, now);
  if (a === null || b === null || b < a) return null;
  const total = b - a + 1;
  const y = Math.floor(total / 12);
  const mo = total % 12;
  const parts = [];
  if (y) parts.push(`${y} ${y === 1 ? "yr" : "yrs"}`);
  if (mo) parts.push(`${mo} ${mo === 1 ? "mo" : "mos"}`);
  return parts.join(" ");
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Jun 2022" (or "Present"); falls back to the raw string. */
export function formatMonth(s: string): string {
  const m = YM.exec(s);
  return m ? `${MONTHS[Number(m[2]) - 1]} ${m[1]}` : s;
}
