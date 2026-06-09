import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync } from 'fs';

const SIZE = 1024;
const canvas = createCanvas(SIZE, SIZE);
const ctx    = canvas.getContext('2d');

// Fully transparent background first
ctx.clearRect(0, 0, SIZE, SIZE);

// Draw a perfect white circle in the center, taking up full size
ctx.fillStyle = '#ffffff';
ctx.beginPath();
ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
ctx.closePath();
ctx.fill();

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

const SCALE = SIZE / 512;

// ── Bar / Handle ── (Pill-shaped)
ctx.fillStyle = '#1f2937';
roundRect(-120 * SCALE, -16 * SCALE, 240 * SCALE, 32 * SCALE, 16 * SCALE);
ctx.fill();

// ── Left inner plate ── (More rounded)
ctx.fillStyle = '#3b82f6';
roundRect(-110 * SCALE, -60 * SCALE, 30 * SCALE, 120 * SCALE, 15 * SCALE);
ctx.fill();

// ── Left outer plate ── (More rounded)
ctx.fillStyle = '#3b82f6';
roundRect(-150 * SCALE, -80 * SCALE, 30 * SCALE, 160 * SCALE, 15 * SCALE);
ctx.fill();

// ── Left endcap ── (More rounded)
ctx.fillStyle = '#60a5fa';
roundRect(-170 * SCALE, -40 * SCALE, 10 * SCALE, 80 * SCALE, 5 * SCALE);
ctx.fill();

// ── Right inner plate ── (More rounded)
ctx.fillStyle = '#3b82f6';
roundRect(80 * SCALE, -60 * SCALE, 30 * SCALE, 120 * SCALE, 15 * SCALE);
ctx.fill();

// ── Right outer plate ── (More rounded)
ctx.fillStyle = '#3b82f6';
roundRect(120 * SCALE, -80 * SCALE, 30 * SCALE, 160 * SCALE, 15 * SCALE);
ctx.fill();

// ── Right endcap ── (More rounded)
ctx.fillStyle = '#60a5fa';
roundRect(160 * SCALE, -40 * SCALE, 10 * SCALE, 80 * SCALE, 5 * SCALE);
ctx.fill();

ctx.restore();

// Save to PNG
const buffer = canvas.toBuffer('image/png');
const targetFile1 = 'app_icon_rounded.png';
const targetFile2 = '../owner-console/app_icon_rounded.png';

writeFileSync(targetFile1, buffer);
console.log('Saved white-background circular logo to ' + targetFile1);

try {
  writeFileSync(targetFile2, buffer);
  console.log('Saved white-background circular logo to ' + targetFile2);
} catch (err) {
  console.log('Could not write directly to console path, will copy later.');
}
