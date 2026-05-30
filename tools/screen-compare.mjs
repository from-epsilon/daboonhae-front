// Round 3 Compare 페이지 모바일 스크린샷 (390x844)
// - 빈 상태 1장 + localStorage seed 후 3개 채워진 상태 1장
import { chromium, devices } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const URL_BASE = 'http://localhost:5173';
const OUT_DIR = 'tools/screens';

async function ensureDir(p) {
  await mkdir(dirname(p), { recursive: true });
}

async function shot(browser, name, seed) {
  const ctx = await browser.newContext({
    ...devices['iPhone 13'],
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  // 1. 빈 페이지 먼저 로드해 origin 확보 후 localStorage seed
  const page = await ctx.newPage();
  await page.goto(`${URL_BASE}/`, { waitUntil: 'domcontentloaded' });
  if (seed) {
    await page.evaluate((ids) => {
      localStorage.setItem('dabunhae:compare:v1', JSON.stringify(ids));
    }, seed);
  } else {
    await page.evaluate(() => localStorage.removeItem('dabunhae:compare:v1'));
  }
  // 2. /compare 진입
  await page.goto(`${URL_BASE}/compare`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  const out = `${OUT_DIR}/${name}`;
  await ensureDir(out);
  await page.screenshot({ path: out, fullPage: true });
  console.log('saved:', out);
  await ctx.close();
}

const browser = await chromium.launch();
try {
  await shot(browser, 'round3-compare.png', null);
  await shot(browser, 'round3-compare-filled.png', ['p005', 'p043', 'p044']);
} finally {
  await browser.close();
}
