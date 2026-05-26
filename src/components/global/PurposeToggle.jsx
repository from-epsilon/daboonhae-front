import { usePurpose } from '../../store/PurposeContext.jsx';
import { PURPOSES, ALL_PURPOSE } from '../../data/purposes.jsx';

// 헤더에 들어가는 목적 토글
// - '전체' + 정의된 목적들을 칩 형태로 노출
// - 클릭 시 전역 purposeId 변경 → 리스트/카드/리포트/비교가 그에 맞게 다시 그려짐
export default function PurposeToggle() {
  const { purposeId, setPurpose } = usePurpose();

  const options = [ALL_PURPOSE, ...PURPOSES];

  return (
    <div className="purpose-toggle" role="tablist" aria-label="탐색 성격 선택">
      {options.map((p) => (
        <button
          key={p.id}
          role="tab"
          aria-selected={purposeId === p.id}
          className={`purpose-chip ${purposeId === p.id ? 'is-active' : ''}`}
          onClick={() => setPurpose(p.id)}
        >
          <p.Icon className="purpose-chip-icon" size={14} aria-hidden />
          <span className="purpose-chip-label">{p.label}</span>
        </button>
      ))}
    </div>
  );
}
