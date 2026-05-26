// 모바일 디테일 — 영양성분표 (카드형 표)
// - 라벨/값 2컬럼, 1행 1라인, 디바이더 1px
// - 칼로리, 단백질, 탄수화물, 당류, 지방, 식이섬유, BCAA 전부 표시
// - 값이 없으면 '-' fallback
import { Badge } from '../../ds/Badge.jsx';

// 단일 영양소 row — 라벨 + 값(단위) + 선택적 강조 배지(예: 당류 ↑)
function NutritionRow({ label, value, unit, emphasis }) {
  // value가 undefined/null이면 '-' 표기
  const hasValue = value !== undefined && value !== null;
  return (
    <li className="m-detail-nutri-row">
      <span className="m-detail-nutri-label">{label}</span>
      <span className="m-detail-nutri-value">
        {emphasis && <Badge variant={emphasis.variant}>{emphasis.label}</Badge>}
        <span className="m-detail-nutri-num">{hasValue ? value : '-'}</span>
        {hasValue && <span className="m-detail-nutri-unit">{unit}</span>}
      </span>
    </li>
  );
}

// 강조 룰 — 당류 10g↑ orange, 단백질 20g↑ green
function getEmphasis(key, value) {
  if (value === undefined || value === null) return null;
  if (key === 'sugar' && value >= 10) return { variant: 'softOrange', label: '높음' };
  if (key === 'sugar' && value <= 1) return { variant: 'softGreen', label: '낮음' };
  if (key === 'protein' && value >= 20) return { variant: 'softGreen', label: '높음' };
  if (key === 'fiber' && value >= 5) return { variant: 'softGreen', label: '높음' };
  return null;
}

export function NutritionTable({ nutrition, serving }) {
  const n = nutrition ?? {};
  // 표시 순서 — 사용자가 가장 먼저 확인하는 칼로리부터
  const rows = [
    { key: 'calories', label: '칼로리', unit: 'kcal' },
    { key: 'protein',  label: '단백질', unit: 'g' },
    { key: 'carbs',    label: '탄수화물', unit: 'g' },
    { key: 'sugar',    label: '당류',    unit: 'g' },
    { key: 'fat',      label: '지방',    unit: 'g' },
    { key: 'fiber',    label: '식이섬유', unit: 'g' },
    { key: 'bcaa',     label: 'BCAA',    unit: 'g' },
  ];

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
            value={n[r.key]}
            unit={r.unit}
            emphasis={getEmphasis(r.key, n[r.key])}
          />
        ))}
      </ul>
    </section>
  );
}
