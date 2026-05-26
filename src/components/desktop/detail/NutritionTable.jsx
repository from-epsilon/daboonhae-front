// 데스크탑 디테일 — 영양성분 카드 (풀폭)
// - 카드 형태 (bg-card-ui 12px radius, border-tertiary 1px)
// - 라벨/값 2컬럼 행, 7개 영양소 그리드 (3컬럼)
// - 강조 룰 (당류 ↑↓, 단백질·식이섬유 ↑) — 모바일과 동일
import { Badge } from '../../ds/Badge.jsx';

// 강조 룰 — 모바일 NutritionTable과 동일 로직
function getEmphasis(key, value) {
  if (value === undefined || value === null) return null;
  if (key === 'sugar' && value >= 10) return { variant: 'softOrange', label: '높음' };
  if (key === 'sugar' && value <= 1) return { variant: 'softGreen', label: '낮음' };
  if (key === 'protein' && value >= 20) return { variant: 'softGreen', label: '높음' };
  if (key === 'fiber' && value >= 5) return { variant: 'softGreen', label: '높음' };
  return null;
}

// 단일 영양소 셀
function NutritionCell({ label, value, unit, emphasis }) {
  const hasValue = value !== undefined && value !== null;
  return (
    <li className="d-detail-nutri-cell">
      <div className="d-detail-nutri-cell-label">
        <span>{label}</span>
        {emphasis && <Badge variant={emphasis.variant}>{emphasis.label}</Badge>}
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
  // 표시 순서 — 칼로리부터 (사용자 우선순위)
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
    <section className="d-detail-card d-detail-nutri">
      <header className="d-detail-card-head">
        <h2 className="d-detail-card-title">영양성분</h2>
        {serving && <span className="d-detail-card-sub">{serving} 기준</span>}
      </header>
      <ul className="d-detail-nutri-grid">
        {rows.map((r) => (
          <NutritionCell
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
