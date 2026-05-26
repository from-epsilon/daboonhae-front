import { PURPOSES } from '../../../data/purposes.jsx';
import { IconChevron } from '../../ds/Icons.jsx';

const PURPOSE_DESC = {
  low_sugar: '당류·대체당을 꼼꼼히 따져보고 싶을 때',
  protein: '단백질 함량·원료가 우수한 식품',
  weight_loss: '칼로리·당류를 줄인 식품을 모았어요',
  meal_replacement: '한 끼 영양을 균형 있게 채워줘요',
};

function PurposeCard({ id, label, Icon, desc, onClick }) {
  return (
    <button type="button" className="d-home-purpose-card" onClick={onClick}>
      <span className="d-home-purpose-icon-wrap" aria-hidden="true">
        <Icon size={26} strokeWidth={1.8} />
      </span>
      <h3 className="d-home-purpose-label">{label}</h3>
      <p className="d-home-purpose-desc">{desc}</p>
      <span className="d-home-purpose-arrow" aria-hidden="true">
        둘러보기
        <IconChevron size={14} stroke={2} />
      </span>
    </button>
  );
}

export default function PurposeCards({ onSelect }) {
  return (
    <div className="d-home-purpose-grid">
      {PURPOSES.map((p) => (
        <PurposeCard
          key={p.id}
          id={p.id}
          label={p.label}
          Icon={p.Icon}
          desc={PURPOSE_DESC[p.id] ?? ''}
          onClick={() => onSelect(p.id)}
        />
      ))}
    </div>
  );
}
