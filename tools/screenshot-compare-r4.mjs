// Round 4 데스크탑 비교 페이지 스크린샷 (1440x900)
// - 빈 상태: round4-compare-empty.png
// - 채워진 상태: round4-compare-filled.png (localStorage에 미리 ids 세팅)
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.join(process.cwd(), 'tools', 'screens');
fs.mkdirSync(OUT_DIR, { recursive: true });

const BASE = 'http://localhost:5173';
const VIEWPORT = { width: 1440, height: 900 };
const STORAGE_KEY = 'dabunhae:compare:v1';

async function shot(page, name) {
  const out = path.join(OUT_DIR, `${name}.png`);
  await page.screenshot({ path: out, fullPage: true });
  console.log(`OK ${name} -> ${out}`);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: VIEWPORT });
const page = await ctx.newPage();

const errors = [];
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`[console.error] ${msg.text()}`);
});

// 1) 빈 상태: localStorage 비움 후 이동
await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
await page.evaluate((k) => localStorage.removeItem(k), STORAGE_KEY);
await page.goto(`${BASE}/compare`, { waitUntil: 'networkidle', timeout: 15000 });
await page.waitForTimeout(500);
await shot(page, 'round4-compare-empty');

// 2) 채워진 상태: localStorage에 ids 세팅 후 reload
await page.evaluate(
  ({ k, v }) => localStorage.setItem(k, JSON.stringify(v)),
  { k: STORAGE_KEY, v: ['p005', 'p043', 'p044'] },
);
await page.goto(`${BASE}/compare`, { waitUntil: 'networkidle', timeout: 15000 });
await page.waitForTimeout(800); // 이미지 로딩 안정화
await shot(page, 'round4-compare-filled');

await browser.close();

if (errors.length > 0) {
  console.log('\n[errors]');
  for (const e of errors) console.log('  ' + e);
  process.exit(1);
} else {
  console.log('\nOK no console/page errors');
}
