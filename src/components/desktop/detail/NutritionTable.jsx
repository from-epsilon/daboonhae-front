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

const NUTRIENT_ORDER = [
  { code: 'energy_kcal',     indent: false },
  { code: 'carbohydrate_g',  indent: false },
  { code: 'sugars_g',        indent: true },
  { code: 'protein_g',       indent: false },
  { code: 'fat_g',           indent: false },
  { code: 'saturated_fat_g', indent: true },
  { code: 'trans_fat_g',     indent: true },
  { code: 'cholesterol_mg',  indent: false },
  { code: 'sodium_mg',       indent: false },
  { code: 'dietary_fiber',   indent: false },
  { code: 'src_알룰로오스_g', indent: false },
];

const KNOWN_CODES = new Set(NUTRIENT_ORDER.map(r => r.code));
const MANDATORY_CODES = new Set([
  'energy_kcal',
  'carbohydrate_g',
  'sugars_g',
  'protein_g',
  'fat_g',
  'saturated_fat_g',
  'trans_fat_g',
  'cholesterol_mg',
  'sodium_mg',
]);

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

function BasisToggle({ basis, onChangeBasis, servingSize, servingUnit }) {
  const unit = servingUnit?.includes('ml') ? 'ml' : 'g';
  const servingLabel = servingSize ? `${servingSize}${unit} 기준` : '1회 제공량';
  const options = [
    { key: 'serving', label: servingLabel },
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

  const { mandatoryRows, optionalRows } = useMemo(() => {
    if (!foodNutrients || foodNutrients.length === 0) return { mandatoryRows: [], optionalRows: [] };

    const byCode = {};
    for (const fn of foodNutrients) {
      byCode[fn.nutrient_code] = fn;
    }

    const mandatory = [];
    const optional = [];

    for (const spec of NUTRIENT_ORDER) {
      const fn = byCode[spec.code];
      if (!fn) continue;
      const row = {
        key: spec.code,
        label: fn.nutrients?.name_ko || spec.code,
        display: formatValue(fn, ratio),
        info: NUTRI_INFO[spec.code],
        indent: spec.indent,
      };
      if (MANDATORY_CODES.has(spec.code)) mandatory.push(row);
      else optional.push(row);
    }

    const extras = foodNutrients
      .filter(fn => !KNOWN_CODES.has(fn.nutrient_code))
      .sort((a, b) => (a.nutrients?.display_order ?? 999) - (b.nutrients?.display_order ?? 999));

    for (const fn of extras) {
      optional.push({
        key: fn.nutrient_code,
        label: fn.nutrients?.name_ko || fn.nutrient_code,
        display: formatValue(fn, ratio),
        info: null,
        indent: false,
      });
    }

    return { mandatoryRows: mandatory, optionalRows: optional };
  }, [foodNutrients, ratio]);

  return (
    <section className="d-detail-card d-detail-nutri">
      <header className="d-detail-card-head">
        <h2 className="d-detail-card-title">영양성분</h2>
        {servingSize > 0 && servingSize !== 100 && (
          <BasisToggle basis={basis} onChangeBasis={setBasis} servingSize={servingSize} servingUnit={servingUnit} />
        )}
        {servingSize === 100 && (
          <span className="d-detail-card-sub">100{unit} 기준</span>
        )}
      </header>
      <div className={`d-detail-nutri-columns${optionalRows.length === 0 ? ' has-single-column' : ''}`}>
        <div className="d-detail-nutri-group">
          <div className="d-detail-nutri-group-title">필수 표기 영양성분</div>
          <ul className="d-detail-nutri-list">
            {mandatoryRows.map((r) => (
              <NutritionCell
                key={r.key}
                label={r.label}
                display={r.display}
                info={r.info}
                indent={r.indent}
              />
            ))}
          </ul>
        </div>
        {optionalRows.length > 0 && (
          <div className="d-detail-nutri-group d-detail-nutri-group--optional">
            <div className="d-detail-nutri-group-title">선택 표기 영양성분</div>
            <ul className="d-detail-nutri-list">
            {optionalRows.map((r) => (
              <NutritionCell
                key={r.key}
                label={r.label}
                display={r.display}
                info={r.info}
                indent={r.indent}
              />
            ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
