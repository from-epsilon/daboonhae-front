---
name: daboonhae-design
description: Use this skill to generate well-branded interfaces and assets for 다분해 (Daboonhae) — a Korean diet-food information, analysis, and comparison service (think 화해 for cosmetics + 다나와 for comparison, but for diet foods). Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files:

- `README.md` — brand overview, what 다분해 is, content fundamentals, visual foundations, iconography, caveats, file index
- `colors_and_type.css` — design tokens (color/type/spacing/radii/shadow) + semantic type classes
- `fonts/` — Gmarket Sans TTFs (load from https://gds.gmarket.co.kr/file/GmarketSans.zip if absent)
- `assets/` — primary symbol + brand SVGs
- `preview/` — per-card foundation specimens (colors, type, spacing, components, food card, score gauge)
- `ui_kits/daboonhae-mobile/` — full interactive mobile app prototype with reusable JSX components (`Button`, `Chip`, `Badge`, `Score`, `FoodCard`, `MacroRow`, `NutritionTable`, `AppBar`, `TopTabs`, `BottomNav`, plus 5 screens). Read `components.jsx` first when building new screens — copy the closest archetype and modify.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. Always link `colors_and_type.css` and use CSS variables — never hard-code hex.

If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask which screen or flow, what diet goal context (고단백/저당/저칼로리/비건/etc), and any food category. Then act as an expert designer who outputs HTML artifacts _or_ production code.

## Quick reminders for new work

- **Brand pivot point: the 다분해 점수.** Every food gets a 0.0–10.0 score. Lead with it. Big Gmarket Sans bold, with `점` half-size. Score ≥ 7.0 wears `--green-500`; 4.0–6.9 wears `--orange-500`; under 4.0 wears `--red-500`.
- **Numbers first, opinion second.** Show macros and ingredients; let the user decide. Never use "good/bad food" copy.
- **Never moralize food.** Banned: "이건 안 좋아요", "위험", "최악". Use `당류 12g (높은 편)` with data attached.
- **Compare, don't rank.** No "1위/2위". Use side-by-side comparison.
- **Color discipline.** Brand green `#00C600` for verified/safe/high-score. CTA blue `#0028AC` for the primary "비교함에 담기" action. Red for 주의 성분 / high-sodium / high-sugar flags. Orange for 관찰 tier. Everything else gray.
- **No emoji. No gradients in product UI** (except the home-feed hero banner). No drop-shadows on home-feed food cards. Hairline 1px dividers do separation work.
- **Korean-first copy.** Imperative noun stems for buttons (`비교함에 담기`, `상세 보기`). Honorifics only in confirmation modals and legal copy. Macro units stick to the value (`22g`, `180kcal`).
- **Iconography** is Lucide-style outlined, 1.5px stroke, 24px. Custom inline SVG only for the brand mark and the score gauge.
