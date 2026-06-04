const fs = require('fs');
const file = 'c:/Users/haleemmamdouh/.gemini/antigravity/scratch/stride-rite-dashboard/src/pages/coach/DesktopCoachPortal.tsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

let start = 0;
lines.forEach((line, index) => {
  if (line.includes('if (!coachUserId)') || line.includes('if (!session)') || line.includes('!coachUserId')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
