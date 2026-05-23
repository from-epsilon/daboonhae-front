import { useNavigate } from 'react-router-dom';
import { PURPOSES } from '../../data/purposes.jsx';
import { usePurpose } from '../../store/PurposeContext.jsx';

// 메인 페이지의 목적 아이콘 그리드
// - 배달의민족식 카테고리 그리드
// - 아이콘 클릭 시: 전역 목적 변경 + 리스트 페이지로 이동
export default function PurposeGrid() {
  const navigate = useNavigate();
  const { setPurpose } = usePurpose();

  const onClick = (id) => {
    setPurpose(id);
    navigate('/list');
  };

  return (
    <div className="purpose-grid">
      {PURPOSES.map((p) => (
        <button key={p.id} className="purpose-tile" onClick={() => onClick(p.id)}>
          <p.Icon className="purpose-tile-icon" size={32} strokeWidth={1.75} aria-hidden />
          <span className="purpose-tile-label">{p.label}</span>
        </button>
      ))}
    </div>
  );
}
