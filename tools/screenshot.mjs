// 다분해 dev 서버 페이지 스크린샷 (1회용)
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.join(process.cwd(), 'tools', 'screens');
fs.mkdirSync(OUT_DIR, { recursive: true });

const BASE = 'http://localhost:5173';
const pages = [
  { name: '01-main', url: `${BASE}/` },
  { name: '02-list', url: `${BASE}/list` },
  { name: '03-detail', url: `${BASE}/product/p005` },
  { name: '04-compare', url: `${BASE}/compare` },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

// 콘솔 에러 캡처
const errors = [];
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`[console.error] ${msg.text()}`);
});

for (const { name, url } of pages) {
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(500); // 폰트/이미지 안정화
    const out = path.join(OUT_DIR, `${name}.png`);
    await page.screenshot({ path: out, fullPage: true });
    console.log(`✅ ${name} → ${out}`);
  } catch (e) {
    console.log(`❌ ${name} 실패: ${e.message}`);
  }
}

await browser.close();

if (errors.length > 0) {
  console.log('\n[페이지 에러/콘솔 에러]');
  for (const e of errors) console.log('  ' + e);
} else {
  console.log('\n✅ 콘솔/페이지 에러 없음');
}
