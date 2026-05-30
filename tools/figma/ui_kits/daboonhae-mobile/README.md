# 다분해 Mobile UI Kit

Interactive recreation of the 다분해 mobile app — a diet-food information, analysis, and comparison service. Built against the design system in this project's root.

## What's in here

- **`index.html`** — single-page React prototype. Lands on Home; sidebar lets you jump between screens; bottom tab bar persists.
- **`components.jsx`** — shared atoms (`Button`, `Chip`, `Badge`, `Score`, `ScoreGauge`, `MacroRow`, `FoodCard`, `AppBar`, `TopTabs`, `BottomNav`) + Lucide-style icons + demo food data (8 Korean diet products with macros + scores + ingredients).
- **`Home.jsx`** — discover feed: 오늘의 PICK hero, goal-filter rail, scroll tabs, "고단백 TOP" horizontal scroller, 2-column food grid with `+` to add to 비교함.
- **`Search.jsx`** — empty state with 최근 검색어 + 인기 검색어; results view with diet-goal filter chips and list-mode food cards.
- **`Category.jsx`** — 2-pane category browser (diet food categories on left, sub-categories on right).
- **`FoodDetail.jsx`** — **the brand-signature screen**: hero, title block with `ScoreGauge`, sub-score breakdown (단백질 / 저칼로리 / 저당 / 성분 안전성), macro card with stacked bar, in-page tabs for 다분해 분석 / 영양정보 / 리뷰 / Q&A. Ingredient analysis with 안전/관찰/주의 dots.
- **`Compare.jsx`** — side-by-side comparison of up to 3 foods. Per-row "▲ 우수" winner indicators, summary recommendation block.
- **`MyD.jsx`** — user card with diet-goal badge, today's intake summary, 찜한 식품 / 최근 본 / 내 리뷰 / 다이어리 quick row, recent food list with scores.

## Interactions wired

- Tap a food card → food detail.
- Tap the `+` on any food card (or "비교함 담기" in detail) → adds to 비교함 (max 3). Cart-style red badge appears on bottom tab.
- 비교함 shows score, kcal, protein, carbs, fat, price side-by-side with per-row winner indicators and a recommendation block at the bottom.
- Search input commits on Enter; tapping a recent/popular query re-runs the search.
- Bottom tab bar switches between Home / Category / Compare / MyD.

## Brand pivots respected

- **Score-first.** The 다분해 점수 is featured on every food card (corner badge), the detail page (88px gauge), the compare table (top row), and the recent-list (small badge).
- **Color-coded by score tier** — green ≥7, orange 4-7, red <4. Same in the Comparison "우수" indicator.
- **No prices on home/list cards** — the prominent number is *score*, not 원. Price only appears in the macro detail card and the compare table.
- **No moralizing copy.** Ingredient flags are 안전/관찰/주의 with explanatory `note` field — never "위험".
- **Stacked bar macros** (protein green, carbs orange, fat blue) make nutrition glanceable.

## Known gaps

- **Gmarket Sans not bundled.** Score numbers / headings will use Noto Sans KR until TTFs are added to `/fonts/`.
- **No real product photography.** Gradients stand in for food shots — replace with `<image-slot>` or real images.
- **Icon set is Lucide-style hand-rolled**, not a 다분해-owned library.
- **Q&A** in food detail is a stub.
- **Search results filter** is a fuzzy contains-match against demo data, not real search.
- **Diary / goal tracking screens** are MyD stubs — full diary surface not yet designed.
