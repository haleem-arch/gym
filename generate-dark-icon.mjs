import { createCanvas, loadImage } from '@napi-rs/canvas';
import { writeFileSync } from 'fs';

async function generate() {
  const SIZE = 1024;
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');

  // Draw dark circular background
  const grad = ctx.createRadialGradient(SIZE / 2, SIZE / 2, SIZE * 0.1, SIZE / 2, SIZE / 2, SIZE / 2);
  grad.addColorStop(0, '#1e293b');
  grad.addColorStop(1, '#0f172a');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();

  // Load the existing transparent logo icon
  const logo = await loadImage('icon-transparent.png');
  
  // Draw it on top, centered
  ctx.drawImage(logo, 0, 0, SIZE, SIZE);

  // Save to app_icon_rounded.png
  const buffer = canvas.toBuffer('image/png');
  writeFileSync('app_icon_rounded.png', buffer);
  console.log('✅ Generated rounded dark app icon by layering the existing transparent logo!');
}

generate().catch(console.error);
