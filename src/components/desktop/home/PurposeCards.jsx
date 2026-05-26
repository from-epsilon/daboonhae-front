// 데스크탑 메인: 목적별 카드 4컬럼 가로 그리드 (Round 4)
// - PURPOSES 메타데이터 기반 자동 렌더
// - 각 카드: Lucide 아이콘 + 라벨 + 짧은 부제 + 하단 화살표
// - 클릭 → onSelect(purposeId) 위임 (부모에서 setPurpose + navigate)
import { PURPOSES } from '../../../data/purposes.jsx';
import { IconChevron } from '../../ds/Icons.jsx';

// 목적 id 별 카드 부제 (이 페이지 전용 카피 — purposes.jsx 변경 없이 보강)
const PURPOSE_DESC = {
  weight_loss: '칼로리·당류를 줄인 식품을 모았어요',
  muscle: '단백질 함량·원료가 우수한 식품',
  glucose: '저당·고섬유 위주의 혈당 친화 식품',
  meal_replacement: '한 끼 영양을 균형 있게 채워줘요',
};

// 단일 카드 — SRP: 카드 1개 렌더만 책임
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
