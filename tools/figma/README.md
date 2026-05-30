# 다분해 Design System

Design system for **다분해 (Daboonhae)** — a diet-food information, analysis, and comparison service. Think 화해(coupang) for cosmetics ingredients meets 다나와 for price comparison, but focused on diet foods: protein bars, shakes, low-cal meals, supplements. We *break everything down* (다 분해) — calories, macros, ingredients, additives — and help users pick what's actually good for their goals.

This project contains the design tokens, brand assets, content guidelines, and reusable UI kit components for designing 다분해 surfaces.

> **Reference.** Visual foundations were derived with reference to the [G마켓 Design System](https://gds.gmarket.co.kr/) — a well-documented Korean e-commerce DS — for typography, spacing, and Korean web conventions. The brand identity, content, and product surfaces are all 다분해-specific.

## What 다분해 is

- A **product database** for diet/health foods sold in Korea. Each item has nutrition facts, ingredient list, brand info, price range.
- An **analysis engine** that scores foods on a 0–10 scale across goals (protein, low-cal, low-sugar, keto, vegan…). Each food carries badges like `고단백 9.2` or `저당 7.5`.
- A **comparison tool** — users add 2–3 foods to 비교함 and see side-by-side macros, ingredients, ratings.
- A **community layer** — diet diaries, reviews, "after 3 weeks" before/after posts.

Compared with adjacent services:
- **다나와** → 다분해 = the same UI density for comparison, but optimized for nutrition rather than price/spec.
- **화해** → 다분해 = the same ingredient-safety vocabulary (성분 점수, 위험 성분), but for ingestibles instead of cosmetics.
- **MyFitnessPal / Fooducate** → 다분해 = Korean-first, product-database first (not user-logging first).

## Sources & references

- **Visual reference site:** https://gds.gmarket.co.kr/ — used only as a Korean-web type/spacing/color benchmark, not as a brand source.
- **Adjacent product references** (UI patterns / content tone): https://www.danawa.com, https://www.hwahae.co.kr
- **Live product:** (not yet) — this is greenfield, the brand and DS exist before the product ships.

---

## Brand at a glance

다분해 is **green** because diet/health categories are green by default in Korea. The brand mark is a **decomposing circle** — a half-broken arc with three particles drifting outward — that reads as "we break it down" (the macros, the ingredients, the marketing copy). Voice is **clinical-but-friendly**, like a nutritionist friend: trustworthy data first, opinion second, no hard-sell.

The visual identity is dense, score-forward, comparison-friendly. Every food card carries a single big number — the 다분해 점수 — and from that one number, everything else (ingredients, reviews, sourcing) is a click away.

---

## Content fundamentals

**Language.** Korean-first. English appears in macro names (Protein, Carbs, Fat — sometimes), brand names, scientific ingredients (e.g. *말토덱스트린*, *수크랄로스*), and the wordmark.

**Tone.** Clinical-but-friendly, like a nutritionist friend reading you a label. Three rules:
1. **Numbers first, opinion second.** State the data, then interpret. "단백질 22g · 9.2점 — 한 끼 단백질 보충용으로 충분해요."
2. **Never moralize food.** "이건 안 좋아요" is banned. Use "당류가 높은 편이에요 (12g/회)" with the data attached.
3. **Compare, don't rank.** Foods are "A는 단백질이 더 많고, B는 칼로리가 더 낮아요" — not "1위 / 2위" rankings.

**Casing & punctuation.** Korean has no caps; English brand names are TitleCased ("MyProtein", not "MYPROTEIN"). Periods only inside full Korean sentences in confirmations and modals. Macros use units without space: `22g`, `180kcal`, `0.5g`. Scores always carry one decimal: `8.5점`, never `8점` or `8.50점`.

**Microcopy examples** (use these as templates):

| Where | Copy |
|---|---|
| Score badge | `다분해 점수 8.5` |
| Trust label | `공식 영양정보` |
| Filter chip | `고단백`, `저당`, `비건`, `글루텐프리` |
| Empty state CTA | `식품 둘러보기` (not "쇼핑 시작하기") |
| Confirm dialog | `비교함에 추가하시겠어요?` |
| Warning toast | `이미 비교함에 담긴 상품이에요.` |
| Ingredient flag | `주의 성분 1` (not "위험 성분") |
| Nutrient label | `단백질 / Protein` (bilingual where it helps) |

**Numerals.** Always Latin digits. Gmarket Sans bold + tabular numerals for any quantitative display: 점수, kcal, g, mg, ₩가격, 리뷰 수, before/after weight. The brand's most-prominent visual gesture is a **big score number** (24–40px display) next to the food name.

**Emoji.** Not part of the brand. Status uses icons, badges, and labels.

**Vibe.** "Here are the numbers. You decide." Trustworthy, transparent, no diet-influencer hype, no fat-shaming, no "기적의" or "다이어트의 정답". Friendly to beginners (단백질이 뭔지 설명 가능), respectful of advanced users (전성분 다 보여주는 게 기본).

---

## Visual foundations

**Color palette.** Narrow and role-locked.

- **Brand Green `#00C600`** — score-good, verified, primary action. *Anything above 7.0 on the 다분해 점수 wears green.*
- **CTA Blue `#0028AC`** — "비교함에 담기" (the equivalent of "add to cart"); the primary purchase action when prices are involved.
- **Warning Red `#EF2B2A`** — 주의 성분, high-sodium / high-sugar flags. Used surgically — never on whole rows, only on the specific flagged value or badge.
- **Caution Orange `#F9560E`** — "관찰" tier (between safe and warning) — high-cal items, moderately processed ingredients.
- **Info Blue `#067DFD`** — 공식 영양정보 verified badge, ★ rating color, "official" trust signals.
- **Gray scale 50→900** — everything that isn't one of the above.

Color discipline: do not invent new hues; do not use a hue's mid-range steps (300/400) for primary surfaces — only the 500s. 50s are for soft backgrounds (info banners).

**Backgrounds.** White (`#FFFFFF`) and off-white (`#F5F5F5`). Cards on the home feed sit on `bg-card-ui` (`#FAFAFA`). **No gradients in product UI.** The only places gradient appears: the home-feed hero banner (a 135deg brand-green gradient) and score gauges. Marketing/empty-state imagery uses real product photography on neutral background — never illustrations of running people, never "fitness influencer" stock photos. Empty illustrations are single-color line drawings (green or gray-700).

**Type vibe.** Two-typeface system:
- **Gmarket Sans** for display, score numbers, headings, buttons (geometric, modern, distinctly Korean).
- **Noto Sans KR** for body, ingredients, reviews, long-form content.
- Latin and macro units (`g`, `kcal`, `mg`) inherit from Gmarket Sans for numerals, Noto for words.

**Score type treatment.** The 다분해 점수 is the brand's signature element. Always:
- Gmarket Sans, weight 700
- Trailing `점` is 0.5× the score size and `--text-secondary` color
- Big surfaces: 32–40px; cards: 18–22px; chips: 13–14px
- Tabular numerals (`font-feature-settings: 'tnum'`)
- Surrounded by 8–12px of negative space — give the number room

**Animation.** Subtle. Score gauges fill in over 400ms `ease-out` on view. Score number counts up from 0 to value over 600ms (numeric easing). Card press: opacity 0.85, 100ms. Modal entry: fade + 4px translate up, 200ms. No bounces, no springs.

**Hover (desktop).** Cards lift `shadow-sm → shadow-md`. Buttons darken one ramp step (`green-500 → green-600`). Icon buttons get a `gray-100` halo.

**Press / active.** Tighten visually, never scale: bg drops one more ramp step, no transform.

**Borders.** Hairline 1px only. `border-tertiary` (#E0E0E0) for dividers, `border-active` (#222) for focused inputs. Cards on the home feed have *no* borders — only dividers between adjacent cards.

**Shadows.** Mostly flat. Sheets/popovers/toasts use very soft drops. Home-feed food cards have no shadow.

**Layout rules.** Mobile: 16px horizontal padding, 12px between cards, 4px hairline dividers between list rows. Desktop: 1240px max content width centered. Fixed 52px top app bar, fixed 56px bottom tab bar. Floating "비교하기 (2)" button bottom-right when 비교함 has items.

**Transparency / blur.** Rare. Only the iOS-native sheet backdrop; scrim overlays are solid `rgba(0,0,0,0.5)`.

**Imagery.** Product photography is bright, white-background, true color, top-down or 3/4 hero — same energy as 화해's product shots. Ingredient micro-imagery (where used) is line-drawn, single-color.

**Corner radii.** Conservative. 4px (badges), 8px (buttons, inputs, cards), 12–16px (sheets, dialogs, score chips). Pill `999px` only for filter chips and floating action buttons.

**Cards.** Three archetypes:
1. **Food card** (product tile) — white bg, no shadow, 8px radius; thumbnail → name → big score → 1-line summary → macro row.
2. **Comparison card** — `bg-card-ui` fill, 12px radius, 16px padding, 1px `border-tertiary`. Used in the side-by-side compare view and on detail pages for ingredient breakdown.
3. **Info banner** — colored background tinted from a ramp's 50 step (`green-50` / `orange-50` / `red-50` / `blue-50`), no border, 8px radius.

---

## Iconography

Outlined, 1.5px stroke, 24×24 default. We use **Lucide Icons** (CDN: `https://unpkg.com/lucide-static@latest/icons/`) as the system icon set. Brand-specific glyphs (logo mark, score gauge, comparison arrow) ship as inline SVG in `assets/`.

**Approach in this design system.**

- **No icon font.** All icons inline SVG or `<img>` from `assets/`.
- **Lucide for system** (chevron, search, heart, share, x, plus/minus, settings, user, bell, home).
- **Custom for brand** (logo mark — the dispersing-circle motif).
- **No emoji** anywhere — including on score badges, where we use the numeric score itself.
- **No unicode pseudo-icons** (no `★ → ✓ ⚠`). Always SVG.

When you need an icon and aren't sure if 다분해 has its own, default to a Lucide icon at `stroke-width: 1.5`, `width/height: 24`, `color: var(--gray-900)`.

> ⚠️ **Substitution flag.** Lucide is a working stand-in. When we ship our own icon set, this section gets updated.

**Logos shipped.**
- `assets/daboonhae-mark.svg` — primary symbol (dispersing-circle, brand green)
- `preview/logos.html` — all 6 lockup variants (symbol on light/brand/dark, wordmark, horizontal lockup, brand block)

---

## Caveats & substitutions

1. **Gmarket Sans webfont not bundled.** TTFs live behind `gds.gmarket.co.kr/file/GmarketSans.zip` and couldn't be fetched here. CSS is wired to load them from `fonts/`. Until then, display + numeric text falls back to Noto Sans KR — prices and scores will *look correct enough* but lose the geometric character. **Action for user:** download the zip and drop the three TTFs into `fonts/`.
2. **Iconography substitution.** Lucide stands in for an eventual 다분해-owned icon set.
3. **No real product photography.** UI kit uses neutral color gradients in place of food photos.
4. **Component coverage is partial.** We've prioritized the visually-distinctive components (Food card, Score gauge, Macro row, Compare list, Tabs, Buttons, Chips, Text fields, Dialogs). Accordions, dropdowns, popovers can be added on request.
5. **The visual foundation is referenced from G마켓's open design system** — the type scale, spacing, and Korean conventions are deliberately benchmarked against a known Korean e-commerce DS. That's a *good thing for familiarity*; flag it if you want a more distinct direction (e.g. softer, wellness-y like Noom).

---

## Project index

```
README.md                 ← you are here
SKILL.md                  ← Agent-Skill-compatible entry point
colors_and_type.css       ← CSS variables + semantic classes
fonts/                    ← Gmarket Sans TTFs go here (currently empty)
assets/
  daboonhae-mark.svg              ← primary symbol
preview/                  ← per-card foundation specimens (Design System tab)
  colors-brand.html, colors-grays.html, colors-state.html, colors-text.html
  type-display.html, type-body.html, type-numerics.html
  spacing-scale.html, radii-shadows.html
  buttons.html, chips-badges.html, text-fields.html
  food-card.html          ← (was item-card) food tile w/ score + macros
  score-gauge.html        ← brand-signature score visualization
  nav-tabs.html, dialogs-banners.html
  logos.html              ← 다분해 logo system
ui_kits/
  daboonhae-mobile/
    index.html            ← interactive mobile app prototype
    Home.jsx, Search.jsx, FoodDetail.jsx, Compare.jsx, MyD.jsx
    components.jsx        ← shared atoms (Button, Chip, Badge, FoodCard, ScoreGauge…)
    README.md
```

---

## Quick start for agents

1. Always import `colors_and_type.css`.
2. Use CSS variables — never hard-code hex.
3. **The 다분해 점수 is the brand signature** — when in doubt, lead with the score.
4. For new components, copy the closest archetype from `ui_kits/daboonhae-mobile/components.jsx` and modify.
5. Reach for Lucide for system icons and SVGs from `assets/` for brand-specific glyphs.
6. **Never moralize food.** Show the data, let the user decide.
