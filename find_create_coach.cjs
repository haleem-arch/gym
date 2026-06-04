const fs = require('fs');
const file = 'c:/Users/haleemmamdouh/.gemini/antigravity/scratch/stride-rite-dashboard/src/pages/coach/DesktopCoachPortal.tsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

lines.forEach((line, index) => {
  if (line.includes('register-coach') || line.includes('role: \'coach\'') || line.includes('generated_passcode') || line.includes('myCoachProfile')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
