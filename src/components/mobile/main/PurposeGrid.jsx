import { PURPOSES } from '../../../data/purposes.jsx';
import { ChevronRight } from 'lucide-react';

const PURPOSE_DESC = {
  low_sugar: '당류·감미료 중심 분석',
  protein: '단백질 함량·원료 비교',
  weight_loss: '칼로리·포만감 분석',
  meal_replacement: '한 끼 영양 균형 체크',
};

function PurposeTile({ p, onClick }) {
  const Icon = p.Icon;
  return (
    <button
      type="button"
      className={`m-home-purpose-tile m-home-purpose-tile--${p.id}`}
      onClick={() => onClick && onClick(p.id)}
      aria-label={`${p.label} 목적으로 둘러보기`}
    >
      <span className="m-home-purpose-icon" aria-hidden="true">
        <Icon size={22} strokeWidth={1.8} />
      </span>
      <span className="m-home-purpose-label">{p.label}</span>
      <span className="m-home-purpose-desc">{PURPOSE_DESC[p.id]}</span>
      <span className="m-home-purpose-arrow" aria-hidden="true">
        <ChevronRight size={16} strokeWidth={2} />
      </span>
    </button>
  );
}

export function PurposeGrid({ onSelect }) {
  return (
    <div className="m-home-purpose-grid">
      {PURPOSES.map((p) => (
        <PurposeTile key={p.id} p={p} onClick={onSelect} />
      ))}
    </div>
  );
}
