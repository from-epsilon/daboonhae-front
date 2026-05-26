import { useMemo, useState } from 'react';
import { HelpCircle } from 'lucide-react';

const NUTRI_INFO = {
  energy_kcal: '식품이 제공하는 총 에너지량. 성인 1일 권장 약 2,000kcal.',
  sodium_mg: '나트륨은 하루 총량 기준으로 보는 항목입니다. 성인 기준 하루 2,000mg 미만을 권장하며, 누적량을 확인하는 게 좋아요.',
  carbohydrate_g: '총 탄수화물입니다. 저당 제품이어도 탄수화물이 높으면 칼로리나 혈당 부담이 있을 수 있어요.',
  sugars_g: '실제 \'당류\' 양입니다. 저당·무설탕 제품을 볼 때 가장 먼저 확인할 항목이에요.',
  dietary_fiber: '식이섬유가 높으면 포만감에 도움이 될 수 있어요. 단, 식이섬유로 탄수화물 수치를 채운 제품도 있어서 원재료를 같이 보는 게 좋아요.',
  src_알룰로오스_g: '알룰로스는 당처럼 달지만 칼로리 부담이 낮은 감미료입니다. 다만 많이 들어간 제품은 단맛 의존도가 높을 수 있어요.',
  fat_g: '총 지방입니다. 지방이 높으면 칼로리가 쉽게 올라갑니다. 특히 디저트류 저당 제품에서 자주 높게 나와요.',
  trans_fat_g: '가능하면 0에 가까운 게 좋습니다. 0g으로 표시돼도 완전히 없다는 뜻은 아닐 수 있어요.',
  saturated_fat_g: '포화지방은 과하면 부담이 큰 지방입니다. 저당 아이스크림, 초콜릿, 크림류 제품은 포화지방이 높을 수 있어요.',
  cholesterol_mg: '동물성 원료가 들어간 제품에서 나올 수 있습니다. 계란, 우유, 크림, 육류 기반 제품이라면 함께 확인하세요.',
  protein_g: '단백질 함량입니다. 단백질 제품이라면 칼로리 대비 단백질이 충분한지 보는 게 중요해요.',
};

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

function formatValue(fn, ratio) {
  if (ratio === 1) {
    if (fn.amount_text) return fn.amount_text;
    const unit = fn.unit || fn.nutrients?.default_unit || '';
    return fn.amount != null ? `${fn.amount}${unit}` : '-';
  }
  if (fn.amount == null) return '-';
  const converted = Math.round(fn.amount * ratio * 10) / 10;
  const unit = fn.unit || fn.nutrients?.default_unit || '';
  return `${converted}${unit}`;
}

function NutritionCell({ label, display, info, indent }) {
  return (
    <li className={`d-detail-nutri-cell${indent ? ' is-indent' : ''}`}>
      <div className="d-detail-nutri-cell-label">
        {info ? (
          <span className="d-detail-tooltip-wrap">
            <span>{label}</span>
            <HelpCircle size={13} className="d-detail-tooltip-icon" />
            <span className="d-detail-tooltip">{info}</span>
          </span>
        ) : (
          <span>{label}</span>
        )}
      </div>
      <div className="d-detail-nutri-cell-value">
        <span className="d-detail-nutri-cell-num">{display}</span>
      </div>
    </li>
  );
}

function BasisToggle({ basis, onChangeBasis, servingUnit }) {
  const unit = servingUnit?.includes('ml') ? 'ml' : 'g';
  const options = [
    { key: 'serving', label: '1회 제공량' },
    { key: 'per100', label: `100${unit} 기준` },
  ];
  return (
    <div className="d-detail-nutri-toggle">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          className={`d-detail-nutri-toggle-btn${basis === o.key ? ' is-active' : ''}`}
          onClick={() => onChangeBasis(o.key)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function NutritionTable({ nutrition, serving, foodNutrients, servingSize, servingUnit }) {
  const [basis, setBasis] = useState('serving');

  const ratio = useMemo(() => {
    if (basis === 'serving' || !servingSize || servingSize <= 0) return 1;
    return 100 / servingSize;
  }, [basis, servingSize]);

  const unit = servingUnit?.includes('ml') ? 'ml' : 'g';
  const basisLabel = basis === 'serving' ? serving : `100${unit}`;

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
        display: formatValue(fn, ratio),
        info: NUTRI_INFO[spec.code],
        indent: spec.indent,
      });
    }

    const extras = foodNutrients
      .filter(fn => !REQUIRED_CODES.has(fn.nutrient_code))
      .sort((a, b) => (a.nutrients?.display_order ?? 999) - (b.nutrients?.display_order ?? 999));

    for (const fn of extras) {
      result.push({
        key: fn.nutrient_code,
        label: fn.nutrients?.name_ko || fn.nutrient_code,
        display: formatValue(fn, ratio),
        info: null,
        indent: false,
      });
    }

    return result;
  }, [foodNutrients, ratio]);

  return (
    <section className="d-detail-card d-detail-nutri">
      <header className="d-detail-card-head">
        <h2 className="d-detail-card-title">영양성분</h2>
        {servingSize > 0 && (
          <BasisToggle basis={basis} onChangeBasis={setBasis} servingUnit={servingUnit} />
        )}
      </header>
      <ul className="d-detail-nutri-list">
        {rows.map((r) => (
          <NutritionCell
            key={r.key}
            label={r.label}
            display={r.display}
            info={r.info}
            indent={r.indent}
          />
        ))}
      </ul>
    </section>
  );
}
