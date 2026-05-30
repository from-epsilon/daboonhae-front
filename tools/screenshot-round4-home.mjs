// Round 4 데스크탑 홈 페이지 스크린샷 (1440x900 viewport)
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.join(process.cwd(), 'tools', 'screens');
fs.mkdirSync(OUT_DIR, { recursive: true });

const BASE = process.env.BASE_URL || 'http://localhost:5176';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
const page = await ctx.newPage();

const errors = [];
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`[console.error] ${msg.text()}`);
});

try {
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(800);
  // Vite dev error overlay 제거 (다른 에이전트 작업 중인 페이지의 import 에러 가림)
  await page.evaluate(() => {
    document.querySelectorAll('vite-error-overlay').forEach((el) => el.remove());
  });
  await page.waitForTimeout(200);
  const out = path.join(OUT_DIR, 'round4-home-desktop.png');
  await page.screenshot({ path: out, fullPage: true });
  console.log(`OK home-desktop -> ${out}`);
} catch (e) {
  console.log(`FAIL home-desktop: ${e.message}`);
}

await browser.close();

if (errors.length > 0) {
  console.log('\n[errors]');
  for (const e of errors) console.log('  ' + e);
} else {
  console.log('\nNo console/page errors');
}
