/**
 * Run difficulty as a function of distance (metres). All tuning numbers live here.
 *
 * 0–392 m keeps the original curve (10.5 → 15.2 m/s, row spacing 24 → 17.5 m). After that the
 * run keeps getting harder until FULL_DIFFICULTY_DISTANCE (~1,840 m, about 2 minutes in):
 * speed climbs to MAX_RUN_SPEED, rows arrive more often, and more rows block two or three lanes.
 */
export const BASE_RUN_SPEED = 10.5;
export const EARLY_TOP_SPEED = 15.2;
export const MAX_RUN_SPEED = 21.0;
const EARLY_RAMP_END = 392; // m: where the original curve reached 15.2 m/s
const EARLY_SPEED_RATE = 0.012; // m/s gained per metre in the early ramp
const LATE_SPEED_RATE = 0.004; // m/s gained per metre after the early ramp
export const FULL_DIFFICULTY_DISTANCE = EARLY_RAMP_END + (MAX_RUN_SPEED - EARLY_TOP_SPEED) / LATE_SPEED_RATE;

/** Seconds between hazard rows at the end of the early ramp and at full difficulty. */
const ROW_TIME_EARLY = 1.15;
// A row every 1.0 s still leaves a full jump (0.65 s) plus ~0.35 s to react before the next row.
const ROW_TIME_FULL = 1.0;
const MIN_ROW_SPACING = 17.5;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

/** 0 at the start of a run, 1 at full difficulty. */
export function difficultyAt(distance: number): number {
  return clamp01(distance / FULL_DIFFICULTY_DISTANCE);
}

export function runSpeedAt(distance: number): number {
  if (distance < EARLY_RAMP_END) return BASE_RUN_SPEED + distance * EARLY_SPEED_RATE;
  return Math.min(MAX_RUN_SPEED, EARLY_TOP_SPEED + (distance - EARLY_RAMP_END) * LATE_SPEED_RATE);
}

/** Metres between hazard rows for the current distance and speed. */
export function rowSpacingAt(distance: number, speed: number): number {
  if (distance < EARLY_RAMP_END) return Math.max(MIN_ROW_SPACING, 24.0 - distance * 0.018);
  const late = clamp01((distance - EARLY_RAMP_END) / (FULL_DIFFICULTY_DISTANCE - EARLY_RAMP_END));
  const rowTime = ROW_TIME_EARLY + (ROW_TIME_FULL - ROW_TIME_EARLY) * late;
  return Math.max(MIN_ROW_SPACING, speed * rowTime);
}

export interface RowPatternWeights {
  puluKisi: number;
  slidingGate: number;
  single: number; // one lane blocked
  double: number; // two lanes blocked, one open
  squeeze: number; // all three lanes occupied: two tall blocks plus one jump/slide obstacle
}

/**
 * Chance of each hazard-row pattern. At distance 0 these equal the original mix
 * (18 / 20.5 / 31.5 / 30 / 0 %); by full difficulty single-lane rows are rare and squeeze rows common.
 * Squeeze rows start appearing after ~250 m.
 */
export function rowPatternWeightsAt(distance: number): RowPatternWeights {
  const k = difficultyAt(distance);
  const squeeze = 0.22 * clamp01((distance - 250) / (FULL_DIFFICULTY_DISTANCE - 250));
  const puluKisi = 0.18 - 0.03 * k;
  const slidingGate = 0.205 - 0.025 * k;
  const double = 0.30 + 0.05 * k;
  return { puluKisi, slidingGate, single: 1 - puluKisi - slidingGate - double - squeeze, double, squeeze };
}
