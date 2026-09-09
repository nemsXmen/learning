import { EngineInputError } from './types';

/** Clamps into [min, max]. Every score the engine returns passes through here. */
export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function clampPercent(value: number): number {
  return clamp(value, 0, 100);
}

export function clampUnit(value: number): number {
  return clamp(value, 0, 1);
}

/** Rounds to one decimal, so a delta reads as `+7.5` rather than `+7.4999`. */
export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/** Whole days between two instants; negative differences read as zero. */
export function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.max(0, ms / 86_400_000);
}

/** Lifts a 0..1 factor into [floor, 1] so it can never zero a product. */
export function withFloor(value: number, floor: number): number {
  return floor + (1 - floor) * clampUnit(value);
}

export function requireFinite(field: string, value: number): number {
  if (!Number.isFinite(value)) {
    throw new EngineInputError(field, `${field} doit être un nombre fini`);
  }
  return value;
}

export function requireRange(field: string, value: number, min: number, max: number): number {
  requireFinite(field, value);
  if (value < min || value > max) {
    throw new EngineInputError(field, `${field} doit être entre ${min} et ${max}, reçu ${value}`);
  }
  return value;
}

export function requireDate(field: string, value: Date): Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new EngineInputError(field, `${field} doit être une date valide`);
  }
  return value;
}
