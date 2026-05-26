import { Badge } from '../../ds/Badge.jsx';
import { HelpCircle } from 'lucide-react';

const NUTRI_INFO = {
  calories: '식품이 제공하는 총 에너지량. 성인 1일 권장 약 2,000kcal.',
  protein: '근육·세포 생성에 필요한 영양소. 1회 20g 이상이면 고단백.',
  carbs: '주요 에너지원. 과다 섭취 시 혈당 상승 및 체지방 전환 가능.',
  sugar: '탄수화물 중 단순당. WHO 권장 1일 25g 이하 (첨가당 기준).',
  fat: '에너지 저장 및 호르몬 합성에 필요. 포화지방 비율 확인 권장.',
  fiber: '소화를 돕고 포만감 유지. 1일 권장 25g, 5g 이상이면 고섬유.',
  bcaa: '분지쇄아미노산(류신·이소류신·발린). 근합성·회복에 핵심.',
};

function getEmphasis(key, value) {
  if (value === undefined || value === null) return null;
  if (key === 'sugar' && value >= 10) return { variant: 'softOrange', label: '높음' };
  if (key === 'sugar' && value <= 1) return { variant: 'softGreen', label: '낮음' };
  if (key === 'protein' && value >= 20) return { variant: 'softGreen', label: '높음' };
  if (key === 'fiber' && value >= 5) return { variant: 'softGreen', label: '높음' };
  return null;
}

const HERO_KEYS = new Set(['calories']);

function InfoTooltip({ text }) {
  return (
    <span className="d-detail-tooltip-wrap">
      <HelpCircle size={13} className="d-detail-tooltip-icon" />
      <span className="d-detail-tooltip">{text}</span>
    </span>
  );
}

function NutritionCell({ label, value, unit, emphasis, isHero, info }) {
  const hasValue = value !== undefined && value !== null;
  return (
    <li className={`d-detail-nutri-cell${isHero ? ' is-hero' : ''}`}>
      <div className="d-detail-nutri-cell-label">
        <span>{label}</span>
        {info && <InfoTooltip text={info} />}
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
            isHero={HERO_KEYS.has(r.key)}
            info={NUTRI_INFO[r.key]}
          />
        ))}
      </ul>
    </section>
  );
}
