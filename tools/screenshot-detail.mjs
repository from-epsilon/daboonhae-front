// Round 3 디테일 페이지 스크린샷 캡처
// - 모바일 viewport (390 x 844) — iPhone 12 Pro 기준
// - http://localhost:5173/product/p005 접속
// - tools/screens/round3-detail.png (위 영역) + round3-detail-full.png (full page)

import { chromium } from 'playwright';

const URL = 'http://localhost:5173/product/p005';
const VIEWPORT = { width: 390, height: 844 };

async function capture() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
  });
  const page = await context.newPage();

  // 콘솔 에러는 출력 (우리 코드 문제 조기 발견)
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.error('[console.error]', msg.text());
  });

  await page.goto(URL, { waitUntil: 'networkidle' });
  // 게이지 애니메이션(400ms) 종료 대기
  await page.waitForTimeout(700);

  await page.screenshot({ path: 'tools/screens/round3-detail.png', fullPage: false });
  console.log('saved round3-detail.png');

  await page.screenshot({ path: 'tools/screens/round3-detail-full.png', fullPage: true });
  console.log('saved round3-detail-full.png');

  await browser.close();
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
