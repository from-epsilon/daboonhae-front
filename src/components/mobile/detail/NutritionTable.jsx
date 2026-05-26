import { useMemo } from 'react';
import { Badge } from '../../ds/Badge.jsx';

const REQUIRED_ORDER = [
  { code: 'energy_kcal',     indent: false },
  { code: 'sodium_mg',       indent: false },
  { code: 'carbohydrate_g',  indent: false },
  { code: 'sugars_g',        indent: true },
  { code: 'dietary_fiber',   indent: true },
  { code: 'src_알룰로오스_g', indent: true },
  { code: 'fat_g',           indent: false },
  { code: 'trans_fat_g',     indent: true },
  { code: 'saturated_fat_g', indent: true },
  { code: 'cholesterol_mg',  indent: false },
  { code: 'protein_g',       indent: false },
];

const REQUIRED_CODES = new Set(REQUIRED_ORDER.map(r => r.code));

function formatValue(fn) {
  if (fn.amount_text) return fn.amount_text;
  const unit = fn.unit || fn.nutrients?.default_unit || '';
  return fn.amount != null ? `${fn.amount}${unit}` : '-';
}

function getEmphasis(code, amount) {
  if (amount == null) return null;
  if (code === 'sugars_g' && amount >= 10) return { variant: 'softOrange', label: '높음' };
  if (code === 'sugars_g' && amount <= 1) return { variant: 'softGreen', label: '낮음' };
  if (code === 'protein_g' && amount >= 20) return { variant: 'softGreen', label: '높음' };
  if (code === 'dietary_fiber' && amount >= 5) return { variant: 'softGreen', label: '높음' };
  return null;
}

function NutritionRow({ label, display, emphasis }) {
  return (
    <li className="m-detail-nutri-row">
      <span className="m-detail-nutri-label">{label}</span>
      <span className="m-detail-nutri-value">
        {emphasis && <Badge variant={emphasis.variant}>{emphasis.label}</Badge>}
        <span className="m-detail-nutri-num">{display}</span>
      </span>
    </li>
  );
}

export function NutritionTable({ nutrition, serving, foodNutrients }) {
  const rows = useMemo(() => {
    if (!foodNutrients || foodNutrients.length === 0) return [];

    const byCode = {};
    for (const fn of foodNutrients) {
      byCode[fn.nutrient_code] = fn;
    }

    const result = [];

    for (const spec of REQUIRED_ORDER) {
      const fn = byCode[spec.code];
      if (!fn) continue;
      result.push({
        key: spec.code,
        label: fn.nutrients?.name_ko || spec.code,
        display: formatValue(fn),
        emphasis: getEmphasis(spec.code, fn.amount),
      });
    }

    const extras = foodNutrients
      .filter(fn => !REQUIRED_CODES.has(fn.nutrient_code))
      .sort((a, b) => (a.nutrients?.display_order ?? 999) - (b.nutrients?.display_order ?? 999));

    for (const fn of extras) {
      result.push({
        key: fn.nutrient_code,
        label: fn.nutrients?.name_ko || fn.nutrient_code,
        display: formatValue(fn),
        emphasis: null,
      });
    }

    return result;
  }, [foodNutrients]);

  return (
    <section className="m-detail-card m-detail-nutri">
      <header className="m-detail-card-head">
        <h2 className="m-detail-card-title">영양성분</h2>
        {serving && <span className="m-detail-card-sub">{serving} 기준</span>}
      </header>
      <ul className="m-detail-nutri-list">
        {rows.map((r) => (
          <NutritionRow
            key={r.key}
            label={r.label}
            display={r.display}
            emphasis={r.emphasis}
          />
        ))}
      </ul>
    </section>
  );
}
