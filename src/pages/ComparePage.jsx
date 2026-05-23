import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useCompare } from '../store/CompareContext.jsx';
import { usePurpose } from '../store/PurposeContext.jsx';
import { getProductById } from '../data/mockProducts.js';
import CompareRow from '../components/compare/CompareRow.jsx';

// 비교 페이지
// - 비교함의 제품들을 가로로 나열 (최대 5개 제한 → 한 화면에 들어옴)
// - 좁은 폭에서는 가로 스크롤로 컬럼을 훑어볼 수 있음
// - 비교 컬럼에 강조되는 성분은 현재 목적에 따라 다르게 표시
export default function ComparePage() {
  const { ids, remove, clear, max } = useCompare();
  const { purpose } = usePurpose();

  const products = ids.map((id) => getProductById(id)).filter(Boolean);

  if (products.length === 0) {
    return (
      <div className="page compare-page">
        <h1 className="compare-title">제품 비교</h1>
        <div className="compare-empty">
          비교함이 비어있습니다.{' '}
          <Link to="/list" className="compare-empty-link">
            <span>제품 둘러보기</span>
            <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page compare-page">
      <div className="compare-header">
        <h1 className="compare-title">
          제품 비교
          <span className="compare-count">{products.length} / {max}개</span>
        </h1>
        <div className="compare-header-actions">
          <span className="compare-purpose">
            <purpose.Icon className="compare-purpose-icon" size={14} aria-hidden />
            <strong>{purpose.label}</strong> 관점에서 비교 중
          </span>
          <button className="compare-clear" onClick={clear}>모두 비우기</button>
        </div>
      </div>

      <div className="compare-columns" role="list">
        {products.map((p) => (
          <CompareRow
            key={p.id}
            product={p}
            purpose={purpose}
            onRemove={() => remove(p.id)}
          />
        ))}
      </div>
    </div>
  );
}
