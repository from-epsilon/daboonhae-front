// 상세 페이지 구간별 뷰포트 캡처 — 영양표/분석/후기 또렷하게 확인
import { chromium, devices } from 'playwright';
import path from 'node:path';

const OUT_DIR = path.join(process.cwd(), 'tools', 'screens');
const BASE = process.env.BASE_URL || 'http://localhost:5173';
const iphone = devices['iPhone 13'];
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...iphone });
const page = await ctx.newPage();

await page.goto(`${BASE}/list`, { waitUntil: 'networkidle', timeout: 20000 });
await page.waitForTimeout(1000);
const card = page.locator('.m-list-cards > div').first();
await card.waitFor({ state: 'visible', timeout: 15000 });
await card.click();
await page.waitForURL('**/product/**', { timeout: 10000 });
await page.waitForTimeout(1500);
await page.evaluate(() => document.querySelectorAll('vite-error-overlay').forEach((el) => el.remove()));

const shots = [
  { y: 600, name: 'detail-s1.png' },   // 매크로~영양표
  { y: 1200, name: 'detail-s2.png' },  // 영양표~분석
  { y: 1900, name: 'detail-s3.png' },  // 분석~원료~후기
];
for (const s of shots) {
  await page.evaluate((y) => window.scrollTo(0, y), s.y);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT_DIR, s.name) });
  console.log('OK', s.name, '@', s.y);
}

await browser.close();
