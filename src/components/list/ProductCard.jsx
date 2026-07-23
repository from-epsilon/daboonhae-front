import { Link } from 'react-router-dom';
import { Check, Plus } from 'lucide-react';
import { useCompare } from '../../store/CompareContext.jsx';
import { formatMetric } from '../../utils/format.js';
import ProductThumb from '../global/ProductThumb.jsx';
import ProductNameText from '../global/ProductNameText.jsx';
import { productPath } from '../../data/productUrl.js';

// 제품 카드
// - 카드의 핵심 수치는 purpose.highlightMetrics에 따라 자동으로 다르게 표시
// - "비교함 담기" 버튼은 상태에 따라 토글 (이미 담겼으면 '비교함에서 빼기')
export default function ProductCard({ product, purpose }) {
  const { has, toggle, isFull, max } = useCompare();
  const inCart = has(product.id);

  // 비교함이 가득 찼고, 아직 안 담긴 제품을 추가 시도하면 안내
  const handleToggle = () => {
    if (!inCart && isFull) {
      window.alert(`비교함은 최대 ${max}개까지 담을 수 있습니다.`);
      return;
    }
    toggle(product.id);
  };

  return (
    <article className="product-card">
      <Link to={productPath(product)} className="product-card-link">
        <ProductThumb product={product} size="card" />
        <div className="product-brand">{product.brand}</div>
        <div className="product-name"><ProductNameText product={product} /></div>
        <div className="product-volume">{product.volume}</div>

        <div className="product-metrics">
          {purpose.highlightMetrics.map((m) => (
            <div key={m.key} className="product-metric">
              <span className="metric-label">{m.label}</span>
              <span className="metric-value">{formatMetric(product, m)}</span>
            </div>
          ))}
        </div>
      </Link>

      <button
        className={`product-cart-btn ${inCart ? 'is-active' : ''}`}
        onClick={handleToggle}
        aria-pressed={inCart}
        title={!inCart && isFull ? `최대 ${max}개까지 담을 수 있습니다` : undefined}
      >
        {inCart ? <Check size={12} aria-hidden /> : <Plus size={12} aria-hidden />}
        <span>비교함</span>
      </button>
    </article>
  );
}
