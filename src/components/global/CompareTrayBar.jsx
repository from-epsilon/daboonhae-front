import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useCompare } from '../../store/CompareContext.jsx';

// 하단 고정 비교함 플로팅 바
// - 비교함에 1개 이상 담겨 있을 때만 노출
// - 비교 페이지에서는 중복 노출 방지를 위해 숨김
export default function CompareTrayBar() {
  const { count, clear } = useCompare();
  const location = useLocation();

  if (count === 0) return null;
  if (location.pathname === '/compare') return null;

  return (
    <div className="compare-tray" role="region" aria-label="비교함">
      <span className="compare-tray-count">
        비교함 <strong>{count}</strong>개
      </span>
      <div className="compare-tray-actions">
        <button className="compare-tray-clear" onClick={clear}>비우기</button>
        <Link to="/compare" className="compare-tray-cta">
          <span>비교하기</span>
          <ArrowRight size={14} aria-hidden />
        </Link>
      </div>
    </div>
  );
}
