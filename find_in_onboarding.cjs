const fs = require('fs');
const file = 'c:/Users/haleemmamdouh/.gemini/antigravity/scratch/stride-rite-dashboard/src/components/OnboardingFlow.tsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

lines.forEach((line, index) => {
  if (line.toLowerCase().includes('signin') || line.toLowerCase().includes('sign_in') || line.toLowerCase().includes('auth.')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
