import { useMemo, useState } from 'react';
import { Badge } from '../../ds/Badge.jsx';

// 더보기/접기 caret — 펼침 상태면 180도 회전 (외부 아이콘 의존 제거)
function Caret({ open }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease' }}
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

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

function formatValue(fn, ratio = 1) {
  if (ratio === 1 && fn.amount_text) return fn.amount_text;
  const unit = fn.unit || fn.nutrients?.default_unit || '';
  if (fn.amount == null) return '-';
  const converted = Math.round(fn.amount * ratio * 10) / 10;
  return `${converted}${unit}`;
}

function getEmphasis(code, amount) {
  if (amount == null) return null;
  if (code === 'sugars_g' && amount >= 10) return { variant: 'softOrange', label: '높음' };
  if (code === 'sugars_g' && amount <= 1) return { variant: 'softGreen', label: '낮음' };
  if (code === 'protein_g' && amount >= 20) return { variant: 'softGreen', label: '높음' };
  if (code === 'dietary_fiber' && amount >= 5) return { variant: 'softGreen', label: '높음' };
  return null;
}

function NutritionRow({ label, display, emphasis, indent = false }) {
  return (
    <li className={`m-detail-nutri-row${indent ? ' is-indent' : ''}`}>
      <span className="m-detail-nutri-label">{label}</span>
      <span className="m-detail-nutri-value">
        {emphasis && <Badge variant={emphasis.variant}>{emphasis.label}</Badge>}
        <span className="m-detail-nutri-num">{display}</span>
      </span>
    </li>
  );
}

export function NutritionTable({
  nutrition,
  serving,
  foodNutrients,
  categoryCode,
  servingSize,
  servingUnit,
  unitPrice,
  priceBasisSource,
  children,
}) {
  const [basis, setBasis] = useState('serving');
  const basisUnit = servingUnit?.includes('ml') ? 'ml' : 'g';
  const calories = Number(nutrition?.calories);
  const basisOptions = [
    { key: 'serving', label: '1회 제공량', enabled: true },
    { key: 'per100', label: `100${basisUnit}`, enabled: servingSize > 0 && servingSize !== 100 },
    { key: 'kcal', label: '100kcal', enabled: calories > 0 },
    { key: 'price', label: '1,000원', enabled: unitPrice > 0 },
  ].filter((option) => option.enabled);
  const activeBasis = basisOptions.some((option) => option.key === basis) ? basis : 'serving';
  const priceBasisNote = priceBasisSource === 'list_price'
    ? '정가를 개당 가격으로 환산한 값이며, 실제 구매 가격과 다를 수 있습니다.'
    : '구매링크 최저가와 정가 중 낮은 기준가격으로 환산하며, 실제 가격과 다를 수 있습니다.';
  const ratio = (() => {
    if (activeBasis === 'per100') return 100 / servingSize;
    if (activeBasis === 'kcal') return 100 / calories;
    if (activeBasis === 'price') return 1000 / unitPrice;
    return 1;
  })();

  // 필수 영양소(탄단지당나트륨 등)와 그 외 미량성분(아미노산 등)을 분리
  // - 미량성분은 기본 접힘 → 핵심 지표가 묻히지 않도록
  const { mainRows, extraRows } = useMemo(() => {
    if (!foodNutrients || foodNutrients.length === 0) {
      return { mainRows: [], extraRows: [] };
    }

    const byCode = {};
    for (const fn of foodNutrients) {
      byCode[fn.nutrient_code] = fn;
    }

    const mainRows = [];
    for (const spec of REQUIRED_ORDER) {
      const fn = byCode[spec.code];
      if (!fn) continue;
      mainRows.push({
        key: spec.code,
        label: fn.nutrients?.name_ko || spec.code,
        display: formatValue(fn, ratio),
        emphasis: activeBasis === 'serving' ? getEmphasis(spec.code, fn.amount) : null,
        indent: spec.indent,
      });
    }

    if (categoryCode === 'protein_drink') {
      const leucine = byCode.leucine;
      if (leucine) {
        mainRows.push({
          key: 'leucine',
          label: leucine.nutrients?.name_ko || '류신',
          display: formatValue(leucine, ratio),
          emphasis: null,
        });
      }
    }

    const extraRows = foodNutrients
      .filter(fn => !REQUIRED_CODES.has(fn.nutrient_code) && !(categoryCode === 'protein_drink' && fn.nutrient_code === 'leucine'))
      .sort((a, b) => (a.nutrients?.display_order ?? 999) - (b.nutrients?.display_order ?? 999))
      .map(fn => ({
        key: fn.nutrient_code,
        label: fn.nutrients?.name_ko || fn.nutrient_code,
        display: formatValue(fn, ratio),
        emphasis: null,
      }));

    return { mainRows, extraRows };
  }, [activeBasis, categoryCode, foodNutrients, ratio]);

  const [showExtras, setShowExtras] = useState(false);
  const hasExtras = extraRows.length > 0;
  const hasExpandedContent = Boolean(children);
  const hasMoreContent = hasExtras || hasExpandedContent;

  return (
    <section className="m-detail-card m-detail-nutri">
      <header className="m-detail-card-head">
        <h2 className="m-detail-card-title">영양성분</h2>
        {basisOptions.length > 1 ? (
          <label className="m-detail-nutri-basis">
            <span className="sr-only">영양성분 환산 기준</span>
            <select
              className="m-detail-nutri-basis-select"
              value={activeBasis}
              onChange={(event) => setBasis(event.target.value)}
              aria-label="영양성분 환산 기준"
            >
              {basisOptions.map((option) => (
                <option key={option.key} value={option.key}>{option.label} 기준</option>
              ))}
            </select>
          </label>
        ) : serving ? (
          <span className="m-detail-card-sub">{serving} 기준</span>
        ) : null}
      </header>
      {activeBasis === 'price' && (
        <p className="m-detail-nutri-basis-note">
          {priceBasisNote}
        </p>
      )}
      <ul className="m-detail-nutri-list">
        {mainRows.map((r) => (
          <NutritionRow
            key={r.key}
            label={r.label}
            display={r.display}
            emphasis={r.emphasis}
            indent={r.indent}
          />
        ))}
        {showExtras && extraRows.map((r) => (
          <NutritionRow
            key={r.key}
            label={r.label}
            display={r.display}
            emphasis={r.emphasis}
          />
        ))}
      </ul>
      {showExtras && hasExpandedContent && (
        <div className="m-detail-nutri-expanded">
          {children}
        </div>
      )}
      {hasMoreContent && (
        <button
          type="button"
          className="m-detail-nutri-more"
          onClick={() => setShowExtras((v) => !v)}
          aria-expanded={showExtras}
        >
          {showExtras
            ? '접기'
            : hasExpandedContent
              ? '전체 정보 더보기'
              : `아미노산 등 ${extraRows.length}개 더보기`}
          <Caret open={showExtras} />
        </button>
      )}
    </section>
  );
}
