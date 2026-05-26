// 모바일 메인 — 목적별 둘러보기 2x2 그리드
// - PURPOSES 메타에서 id/label/Icon(Lucide)을 가져와 4개 타일 렌더
// - 카드 클릭 시 PurposeContext에 목적 set + 부모에서 /list 이동
import { PURPOSES } from '../../../data/purposes.jsx';

// 단일 타일 — 아이콘 + 라벨
function PurposeTile({ p, onClick }) {
  const Icon = p.Icon;
  return (
    <button
      type="button"
      className="m-home-purpose-tile"
      onClick={() => onClick && onClick(p.id)}
      aria-label={`${p.label} 목적으로 둘러보기`}
    >
      <span className="m-home-purpose-icon" aria-hidden="true">
        <Icon size={26} strokeWidth={1.75} />
      </span>
      <span className="m-home-purpose-label">{p.label}</span>
    </button>
  );
}

// 2x2 그리드 본체
// - onSelect(purposeId)
export function PurposeGrid({ onSelect }) {
  return (
    <div className="m-home-purpose-grid">
      {PURPOSES.map((p) => (
        <PurposeTile key={p.id} p={p} onClick={onSelect} />
      ))}
    </div>
  );
}
