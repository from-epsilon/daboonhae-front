// 모바일 UI/UX 감사용 스크린샷 — iPhone 13 뷰포트(390x844)로 4페이지 캡처
// detail/compare는 데이터 의존이라 list 첫 카드 클릭 → detail, 비교 담기 → compare 순으로 이동
import { chromium, devices } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.join(process.cwd(), 'tools', 'screens');
fs.mkdirSync(OUT_DIR, { recursive: true });
const BASE = process.env.BASE_URL || 'http://localhost:5173';

const iphone = devices['iPhone 13'];
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...iphone });
const page = await ctx.newPage();

const errors = [];
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(`[console.error] ${msg.text()}`); });

async function clearOverlay() {
  await page.evaluate(() => document.querySelectorAll('vite-error-overlay').forEach((el) => el.remove()));
}
async function shot(name) {
  await page.waitForTimeout(700);
  await clearOverlay();
  const out = path.join(OUT_DIR, `audit-mobile-${name}.png`);
  await page.screenshot({ path: out, fullPage: true });
  console.log(`OK ${name} -> ${out}`);
}

try {
  // 1. 홈
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 20000 });
  await shot('home');

  // 2. 리스트
  await page.goto(`${BASE}/list`, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(1000);
  await shot('list');

  // 3. 상세 — 리스트 첫 카드 클릭
  const firstCard = page.locator('a[href^="/product/"], [class*="food-card"], [class*="m-list"] a').first();
  if (await firstCard.count()) {
    await firstCard.click();
    await page.waitForURL('**/product/**', { timeout: 8000 }).catch(() => {});
    await shot('detail');
  } else {
    console.log('SKIP detail: no card found');
  }

  // 4. 비교 — 빈 상태 먼저
  await page.goto(`${BASE}/compare`, { waitUntil: 'networkidle', timeout: 20000 });
  await shot('compare-empty');
} catch (e) {
  console.log(`FAIL: ${e.message}`);
}

await browser.close();
if (errors.length) { console.log('\n[errors]'); errors.forEach((e) => console.log('  ' + e)); }
else console.log('\nNo console/page errors');
