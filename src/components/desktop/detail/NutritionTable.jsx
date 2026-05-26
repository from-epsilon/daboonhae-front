import { HelpCircle } from 'lucide-react';

const NUTRI_INFO = {
  calories: '식품이 제공하는 총 에너지량. 성인 1일 권장 약 2,000kcal.',
  sodium: '나트륨은 하루 총량 기준으로 보는 항목입니다. 성인 기준 하루 2,000mg 미만을 권장하며, 누적량을 확인하는 게 좋아요.',
  carbs: '총 탄수화물입니다. 저당 제품이어도 탄수화물이 높으면 칼로리나 혈당 부담이 있을 수 있어요.',
  sugar: '실제 \'당류\' 양입니다. 저당·무설탕 제품을 볼 때 가장 먼저 확인할 항목이에요.',
  fiber: '식이섬유가 높으면 포만감에 도움이 될 수 있어요. 단, 식이섬유로 탄수화물 수치를 채운 제품도 있어서 원재료를 같이 보는 게 좋아요.',
  allulose: '알룰로스는 당처럼 달지만 칼로리 부담이 낮은 감미료입니다. 다만 많이 들어간 제품은 단맛 의존도가 높을 수 있어요.',
  fat: '총 지방입니다. 지방이 높으면 칼로리가 쉽게 올라갑니다. 특히 디저트류 저당 제품에서 자주 높게 나와요.',
  transFat: '가능하면 0에 가까운 게 좋습니다. 0g으로 표시돼도 완전히 없다는 뜻은 아닐 수 있어요.',
  saturatedFat: '포화지방은 과하면 부담이 큰 지방입니다. 저당 아이스크림, 초콜릿, 크림류 제품은 포화지방이 높을 수 있어요.',
  cholesterol: '동물성 원료가 들어간 제품에서 나올 수 있습니다. 계란, 우유, 크림, 육류 기반 제품이라면 함께 확인하세요.',
  protein: '단백질 함량입니다. 단백질 제품이라면 칼로리 대비 단백질이 충분한지 보는 게 중요해요.',
};

function NutritionCell({ label, value, unit, info, indent }) {
  const hasValue = value !== undefined && value !== null;
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
        <span className="d-detail-nutri-cell-num">{hasValue ? value : '-'}</span>
        {hasValue && <span className="d-detail-nutri-cell-unit">{unit}</span>}
      </div>
    </li>
  );
}

export function NutritionTable({ nutrition, serving }) {
  const n = nutrition ?? {};
  const rows = [
    { key: 'calories', label: '열량', unit: 'kcal' },
    { key: 'sodium',   label: '나트륨', unit: 'mg' },
    { key: 'carbs',    label: '탄수화물', unit: 'g' },
    { key: 'sugar',    label: '당류', unit: 'g', indent: true },
    { key: 'fiber',    label: '식이섬유', unit: 'g', indent: true },
    { key: 'allulose', label: '알룰로스', unit: 'g', indent: true },
    { key: 'fat',      label: '지방', unit: 'g' },
    { key: 'transFat', label: '트랜스지방', unit: 'g', indent: true },
    { key: 'saturatedFat', label: '포화지방', unit: 'g', indent: true },
    { key: 'cholesterol', label: '콜레스테롤', unit: 'mg' },
    { key: 'protein',  label: '단백질', unit: 'g' },
  ];

  return (
    <section className="d-detail-card d-detail-nutri">
      <header className="d-detail-card-head">
        <h2 className="d-detail-card-title">영양성분</h2>
        {serving && <span className="d-detail-card-sub">{serving} 기준</span>}
      </header>
      <ul className="d-detail-nutri-list">
        {rows.map((r) => (
          <NutritionCell
            key={r.key}
            label={r.label}
            value={n[r.key]}
            unit={r.unit}
            info={NUTRI_INFO[r.key]}
            indent={r.indent}
          />
        ))}
      </ul>
    </section>
  );
}
