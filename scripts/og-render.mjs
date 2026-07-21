import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const ROOT = '/Users/hyun/daboonhae/daboonhae-front';
const logo = readFileSync(`${ROOT}/brand/daboonhae-logo-lockup.png`).toString('base64');
const logoUri = `data:image/png;base64,${logo}`;

const html = `<!doctype html><html><head><meta charset="utf-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { width:1200px; height:630px; }
  body {
    font-family: -apple-system, "Apple SD Gothic Neo", "Pretendard", "Noto Sans KR", sans-serif;
    background: #ffffff;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  /* 브랜드 그린 코너 악센트 */
  .blob {
    position:absolute; border-radius:50%;
    filter: blur(0px);
  }
  .b1 { width:520px; height:520px; right:-160px; top:-200px;
        background: radial-gradient(circle at 30% 30%, #dcfce7 0%, #f0fdf4 60%, #ffffff 100%); }
  .b2 { width:360px; height:360px; left:-140px; bottom:-160px;
        background: radial-gradient(circle at 60% 40%, #bbf7d0 0%, #f0fdf4 65%, #ffffff 100%); }
  .bar { position:absolute; top:0; left:0; right:0; height:10px; background:#16a34a; }
  .logo { width:660px; height:auto; margin-bottom:38px; position:relative; z-index:2; }
  .tagline {
    font-size:46px; font-weight:800; color:#111827; letter-spacing:-1.5px;
    position:relative; z-index:2;
  }
  .tagline .g { color:#16a34a; }
  .sub {
    margin-top:22px; font-size:27px; font-weight:600; color:#6b7280;
    letter-spacing:-0.5px; position:relative; z-index:2;
  }
  .chip {
    margin-top:34px; display:inline-flex; align-items:center; gap:10px;
    background:#f0fdf4; border:1.5px solid #bbf7d0; color:#15803d;
    font-size:22px; font-weight:700; padding:12px 22px; border-radius:999px;
    position:relative; z-index:2; letter-spacing:-0.3px;
  }
  .dot { width:11px; height:11px; border-radius:50%; background:#16a34a; }
</style></head>
<body>
  <div class="bar"></div>
  <div class="blob b1"></div>
  <div class="blob b2"></div>
  <img class="logo" src="${logoUri}" />
  <div class="tagline">다이어트 식품 <span class="g">비교·해석</span> 플랫폼</div>
  <div class="sub">영양성분을 분해하고, 제품 간 가격·성분을 비교합니다</div>
  <div class="chip"><span class="dot"></span>식약처 공시 영양정보 기반</div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'networkidle' });
await page.screenshot({ path: `${ROOT}/public/og/default.png` });
await browser.close();
console.log('rendered public/og/default.png');
