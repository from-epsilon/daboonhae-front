# Fonts — Gmarket Sans

This folder is where the official **Gmarket Sans** webfont should live:

```
fonts/GmarketSansTTFLight.ttf    (300)
fonts/GmarketSansTTFMedium.ttf   (500)
fonts/GmarketSansTTFBold.ttf     (700)
```

Download the zip from the official source:
**https://gds.gmarket.co.kr/file/GmarketSans.zip**

The TTFs inside that zip are licensed for free commercial use; G마켓 released them as a brand asset in 2018.

### Why it's missing here

This environment cannot download zips from external sites, so we couldn't bundle the TTFs automatically. `colors_and_type.css` is wired up to load them from this folder (via `@font-face` + `local()` fallbacks) — drop the three TTFs in and everything Just Works.

### Fallback stack

Until the TTFs are added, all `var(--font-display)` and `var(--font-numeric)` consumers will fall back to **Noto Sans KR** (loaded from Google Fonts). The geometric character of Gmarket Sans — especially in price numerals — won't be reproduced; this is a known visual gap, flagged in the README.
