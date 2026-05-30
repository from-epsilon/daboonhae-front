// Round 4 데스크탑 디테일 페이지 스크린샷 (1회용)
// - viewport 1440x900
// - http://localhost:<PORT>/product/p005
// - tools/screens/round4-detail-desktop.png (첫 화면)
// - tools/screens/round4-detail-desktop-full.png (fullPage)
import { chromium } from 'playwright';

const PORT = process.env.PORT || '5179';
const URL = `http://localhost:${PORT}/product/p005`;
const VIEWPORT = { width: 1440, height: 900 };

async function capture() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 });
  const page = await context.newPage();

  // 콘솔 에러는 출력 (조기 발견)
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.error('[console.error]', msg.text());
  });

  await page.goto(URL, { waitUntil: 'networkidle' });
  // ScoreGauge 애니메이션(400ms) + 이미지 로딩 안정화 대기
  await page.waitForTimeout(900);

  await page.screenshot({ path: 'tools/screens/round4-detail-desktop.png', fullPage: false });
  console.log('saved round4-detail-desktop.png');

  await page.screenshot({ path: 'tools/screens/round4-detail-desktop-full.png', fullPage: true });
  console.log('saved round4-detail-desktop-full.png');

  await browser.close();
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
