// ============================================================
// VECTOR MATH UTILITY LIBRARY
// ============================================================

import { Vec2 } from './types';

export const vec = {
  add: (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y }),
  sub: (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y }),
  scale: (v: Vec2, s: number): Vec2 => ({ x: v.x * s, y: v.y * s }),
  dot: (a: Vec2, b: Vec2): number => a.x * b.x + a.y * b.y,
  magSq: (v: Vec2): number => v.x * v.x + v.y * v.y,
  mag: (v: Vec2): number => Math.sqrt(vec.magSq(v)),
  dist: (a: Vec2, b: Vec2): number => vec.mag(vec.sub(a, b)),
  distSq: (a: Vec2, b: Vec2): number => vec.magSq(vec.sub(a, b)),

  normalize: (v: Vec2): Vec2 => {
    const m = vec.mag(v);
    if (m < 0.0001) return { x: 0, y: 0 };
    return { x: v.x / m, y: v.y / m };
  },

  limit: (v: Vec2, max: number): Vec2 => {
    const mSq = vec.magSq(v);
    if (mSq > max * max) {
      const m = Math.sqrt(mSq);
      return { x: (v.x / m) * max, y: (v.y / m) * max };
    }
    return { ...v };
  },

  setMag: (v: Vec2, mag: number): Vec2 => {
    return vec.scale(vec.normalize(v), mag);
  },

  lerp: (a: Vec2, b: Vec2, t: number): Vec2 => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  }),

  random: (scale: number = 1): Vec2 => {
    const angle = Math.random() * Math.PI * 2;
    return { x: Math.cos(angle) * scale, y: Math.sin(angle) * scale };
  },

  zero: (): Vec2 => ({ x: 0, y: 0 }),

  clone: (v: Vec2): Vec2 => ({ x: v.x, y: v.y }),

  angle: (v: Vec2): number => Math.atan2(v.y, v.x),
};

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerpNum(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 9).toUpperCase();
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}
