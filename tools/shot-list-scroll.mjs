// 리스트 페이지 스크롤 동작 확인 — 상단 클로즈업 + 스크롤 후 sticky 헤더 상태
import { chromium, devices } from 'playwright';
import path from 'node:path';

const OUT_DIR = path.join(process.cwd(), 'tools', 'screens');
const BASE = process.env.BASE_URL || 'http://localhost:5173';
const iphone = devices['iPhone 13'];
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...iphone });
const page = await ctx.newPage();

await page.goto(`${BASE}/list`, { waitUntil: 'networkidle', timeout: 20000 });
await page.waitForTimeout(1200);
await page.evaluate(() => document.querySelectorAll('vite-error-overlay').forEach((el) => el.remove()));

// 1) 상단 클로즈업 (viewport only)
await page.screenshot({ path: path.join(OUT_DIR, 'list-top.png') });
console.log('OK list-top');

// 2) 400px 스크롤 후 — sticky 헤더 위 공백 여부 확인
await page.evaluate(() => window.scrollTo(0, 400));
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(OUT_DIR, 'list-scrolled.png') });
console.log('OK list-scrolled');

await browser.close();
