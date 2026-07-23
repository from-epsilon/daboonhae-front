import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { formatMetric } from '../../utils/format.js';
import ProductThumb from '../global/ProductThumb.jsx';
import ProductNameText from '../global/ProductNameText.jsx';
import { productPath } from '../../data/productUrl.js';

// 비교 페이지의 단일 제품 컬럼 (가로 나열의 단위)
// - 상단: 썸네일 + 브랜드/제품명 + 빼기 버튼
// - 하단: 현재 목적의 highlightMetrics에 맞춘 강조 수치 (purpose가 바뀌면 자동 변경)
export default function CompareRow({ product, purpose, onRemove }) {
  return (
    <article className="compare-col">
      <button
        className="compare-col-remove"
        onClick={onRemove}
        aria-label="비교함에서 빼기"
        title="비교함에서 빼기"
      >
        <X size={14} aria-hidden />
      </button>

      <div className="compare-col-head">
        <ProductThumb product={product} size="compact" />
        <div className="compare-col-meta">
          <div className="compare-brand">{product.brand}</div>
          <Link to={productPath(product)} className="compare-name"><ProductNameText product={product} /></Link>
          <div className="compare-volume">{product.volume}</div>
        </div>
      </div>

      <div className="compare-col-metrics">
        {purpose.highlightMetrics.map((m) => (
          <div key={m.key} className="compare-metric">
            <span className="compare-metric-label">{m.label}</span>
            <span className="compare-metric-value">{formatMetric(product, m)}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
