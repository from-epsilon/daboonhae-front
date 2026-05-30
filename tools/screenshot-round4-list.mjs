// Round 4 데스크탑 리스트 페이지 스크린샷 (1440x900 viewport)
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
  await page.goto(`${BASE}/list`, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(800);
  const out = path.join(OUT_DIR, 'round4-list-desktop.png');
  // viewport-only 캡처 — 1440x900 한 화면에 디자인이 어떻게 보이는지 확인용
  await page.screenshot({ path: out, fullPage: false });
  console.log(`OK list-desktop -> ${out}`);

  const outFull = path.join(OUT_DIR, 'round4-list-desktop-full.png');
  await page.screenshot({ path: outFull, fullPage: true });
  console.log(`OK list-desktop-full -> ${outFull}`);
} catch (e) {
  console.log(`FAIL list-desktop: ${e.message}`);
}

await browser.close();

if (errors.length > 0) {
  console.log('\n[errors]');
  for (const e of errors) console.log('  ' + e);
} else {
  console.log('\nNo console/page errors');
}
