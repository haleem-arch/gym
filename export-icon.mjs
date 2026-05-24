// export-icon.mjs — renders the dumbbell icon as a transparent PNG using @napi-rs/canvas
// Run: node export-icon.mjs
import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync } from 'fs';

const SIZE = 1024;           // output size in px (very high res)
const canvas = createCanvas(SIZE, SIZE);
const ctx    = canvas.getContext('2d');

// Transparent background (no fill = fully transparent PNG)
ctx.clearRect(0, 0, SIZE, SIZE);

// --- helpers ---
function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Move origin to center, rotate 45°
ctx.save();
ctx.translate(SIZE / 2, SIZE / 2);
ctx.rotate(-Math.PI / 4);

const SCALE = SIZE / 512;    // scale factor from original 512-viewBox design

// ── Bar / Handle ──
ctx.fillStyle = '#1f2937';
roundRect(-120 * SCALE, -16 * SCALE, 240 * SCALE, 32 * SCALE, 8 * SCALE);
ctx.fill();

// ── Left inner plate ──
ctx.fillStyle = '#3b82f6';
roundRect(-110 * SCALE, -60 * SCALE, 30 * SCALE, 120 * SCALE, 8 * SCALE);
ctx.fill();

// ── Left outer plate ──
ctx.fillStyle = '#3b82f6';
roundRect(-150 * SCALE, -80 * SCALE, 30 * SCALE, 160 * SCALE, 10 * SCALE);
ctx.fill();

// ── Left endcap ──
ctx.fillStyle = '#60a5fa';
roundRect(-170 * SCALE, -40 * SCALE, 10 * SCALE, 80 * SCALE, 4 * SCALE);
ctx.fill();

// ── Right inner plate ──
ctx.fillStyle = '#3b82f6';
roundRect(80 * SCALE, -60 * SCALE, 30 * SCALE, 120 * SCALE, 8 * SCALE);
ctx.fill();

// ── Right outer plate ──
ctx.fillStyle = '#3b82f6';
roundRect(120 * SCALE, -80 * SCALE, 30 * SCALE, 160 * SCALE, 10 * SCALE);
ctx.fill();

// ── Right endcap ──
ctx.fillStyle = '#60a5fa';
roundRect(160 * SCALE, -40 * SCALE, 10 * SCALE, 80 * SCALE, 4 * SCALE);
ctx.fill();

ctx.restore();

// Save to PNG
const buffer = canvas.toBuffer('image/png');
writeFileSync('icon-transparent.png', buffer);
console.log('✅  icon-transparent.png saved  (' + SIZE + 'x' + SIZE + 'px, transparent background)');
