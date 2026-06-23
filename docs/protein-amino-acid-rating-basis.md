# Protein Amino Acid Rating Basis

## Scope

This note documents the summary-card rating thresholds used in the desktop detail analysis report for protein drinks.

The relevant cards are:

- Protein amount
- Essential amino acids (EAA)
- BCAA

The thresholds are intended to make the EAA/BCAA cards visually and semantically comparable to the protein amount card. They are not a clinical or medical recommendation.

## Data Snapshot

Reference dataset:

- Active `protein_drink` products from Supabase
- Product count: 102
- Snapshot taken during local analysis on 2026-06-16

Positive-value distribution:

| Metric | n | Min | P10 | P25 | Median | P67 | P75 | P90 | Max |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Protein (g) | 102 | 4.2 | 12.6 | 20 | 21 | 24 | 25 | 40 | 60 |
| EAA (mg) | 38 | 3,400 | 7,381 | 8,000 | 8,325 | 8,856 | 9,000 | 17,181 | 23,000 |
| BCAA (mg) | 77 | 1,000 | 2,000 | 3,212 | 4,200 | 4,500 | 4,800 | 7,500 | 11,000 |
| EAA / protein | 38 | 13.6% | 34.8% | 36.9% | 40.0% | 41.5% | 41.7% | 42.9% | 49.7% |
| BCAA / protein | 77 | 4.8% | 12.5% | 15.7% | 19.2% | 20.0% | 20.5% | 22.5% | 31.0% |

Missing values:

- EAA missing: 64 of 102 products
- BCAA missing: 25 of 102 products

## Interpretation

The protein amount card uses product-market-friendly fixed cutoffs:

- 10g
- 15g
- 20g
- 25g
- 35g
- 40g

The 20g mark aligns with the product distribution lower-middle band for protein drinks, and 40g aligns roughly with the high end of mainstream products in the dataset. Values above 40g use a separate `very-high` tone so that the upper band is not collapsed into the same visual state as 35-40g products.

EAA and BCAA should therefore not use coarse arbitrary thresholds. Their thresholds should follow two signals:

- The observed protein-drink distribution.
- The typical scale relative to total protein.

In the current dataset, EAA clusters around 35-42% of protein, and BCAA clusters around 16-21% of protein. The chosen thresholds map those scales onto the protein-card resolution while keeping round, explainable values.

## Current Thresholds

### Tone Resolution

All three cards use the same 7 positive-value tones:

- `poor`
- `light`
- `near`
- `solid`
- `strong`
- `high`
- `very-high`

### Color Tokens

Rating colors are centralized in `src/styles/design-tokens.css`. Summary cards use `--rating-*-bg` and `--rating-*-border`; row tags use `--rating-*-text` and `--rating-*-tag-bg`.

| Tone | Color direction | Token prefix |
| --- | --- | --- |
| `poor` | Orange | `--rating-poor-*` |
| `light` | Orange | `--rating-light-*` |
| `near` | Yellow | `--rating-near-*` |
| `solid` | Green | `--rating-solid-*` |
| `strong` | Mint green | `--rating-strong-*` |
| `high` | Blue | `--rating-high-*` |
| `very-high` | Purple | `--rating-very-high-*` |

### Category Rank Tiers

The "동일 카테고리 위치" table shows a tier for each comparison mode. The tier is calculated only when protein, EAA, and BCAA ranks are all available for that mode.

For each mode, average the three `topPercent` values:

- Protein percentile
- EAA percentile
- BCAA percentile

| Average top percentile | Label | Color direction | Token prefix |
| --- | --- | --- | --- |
| `<= 15%` | 최상위권 | Gold | `--category-rank-top-*` |
| `<= 35%` | 상위권 | Silver | `--category-rank-upper-*` |
| `<= 70%` | 중위권 | Bronze | `--category-rank-mid-*` |
| `> 70%` | 하위권 | Gray | `--category-rank-low-*` |

### Protein

| Range | Label | Tone |
| --- | --- | --- |
| Missing | 단백질 정보 없음 | neutral |
| `< 10g` | 보충용으론 낮음 | poor |
| `< 15g` | 가벼운 간식 수준 | light |
| `< 20g` | 20g 기준 근접 | near |
| `< 25g` | 양호 | solid |
| `< 35g` | 넉넉한 함량 | strong |
| `<= 40g` | 고함량 | high |
| `> 40g` | 매우 높음 | very-high |

### EAA

| Range | Label | Tone |
| --- | --- | --- |
| Missing | 정보 없음 | caution |
| `< 4,000mg` | 낮음 | poor |
| `< 6,000mg` | 낮은 편 | light |
| `< 8,000mg` | 양호권 근접 | near |
| `< 10,000mg` | 양호 | solid |
| `< 14,000mg` | 높은 편 | strong |
| `< 18,000mg` | 고함량 | high |
| `>= 18,000mg` | 매우 높음 | very-high |

### BCAA

| Range | Label | Tone |
| --- | --- | --- |
| Missing | 정보 없음 | caution |
| `< 2,000mg` | 낮음 | poor |
| `< 3,000mg` | 낮은 편 | light |
| `< 4,000mg` | 양호권 근접 | near |
| `< 5,000mg` | 양호 | solid |
| `< 7,000mg` | 높은 편 | strong |
| `< 9,000mg` | 고함량 | high |
| `>= 9,000mg` | 매우 높음 | very-high |

## Notes

- EAA is computed from all 9 essential amino acids when all individual values are available. Otherwise, the DB aggregate `src_eaa_mg` is used.
- BCAA is computed from leucine, isoleucine, and valine when all individual values are available. Otherwise, the DB aggregate `src_bcaa_mg` is used.
- Because EAA coverage is sparse, EAA summary-card interpretation should continue to mention data limitations in the help tooltip.
- If the product database changes substantially, recompute the distribution before changing these thresholds again.
