import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateOg() {
  console.log('Starting OG Image Generation...');
  let browser;
  try {
    const templatePath = path.resolve(__dirname, '../public/og-template.html');
    const outputPath = path.resolve(__dirname, '../public/og-preview.png');
    
    console.log(`Loading template: ${templatePath}`);
    console.log(`Output destination: ${outputPath}`);

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 630 });
    
    // Open the local html template
    await page.goto(`file://${templatePath}`, {
      waitUntil: 'networkidle0'
    });

    // Capture the screenshot
    await page.screenshot({
      path: outputPath,
      type: 'png'
    });

    console.log('✓ OG Image successfully generated at public/og-preview.png');
  } catch (error) {
    console.error('✗ Failed to generate OG image:', error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

generateOg();
