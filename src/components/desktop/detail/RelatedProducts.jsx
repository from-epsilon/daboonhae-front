// 데스크탑 디테일 — 같은 카테고리 관련 제품 (좌측 컬럼, 이미지 아래)
// - 현재 제품 제외, 같은 category 3~4개 (rankingScore 내림차순)
// - FoodCard 작은 grid 레이아웃 사용
// - 결과 없으면 노출 안 함
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { FoodCard } from '../../ds/FoodCard.jsx';
import { getAdapted } from '../../../data/adapters.js';
import { useProducts } from '../../../store/ProductsContext.jsx';
import { categoryPath } from '../../../data/categoryTabs.js';

export function RelatedProducts({ currentProduct, onNavigate, limit = 3 }) {
  const { products: PRODUCTS } = useProducts();
  const related = currentProduct?.categoryCode
    ? PRODUCTS
        .filter((p) => p.id !== currentProduct.id && p.categoryCode === currentProduct.categoryCode)
        .sort((a, b) => String(a.id).localeCompare(String(b.id)))
        .slice(0, limit)
    : [];
  if (related.length === 0) return null;

  return (
    <section className="d-detail-section-block d-detail-related" aria-label="관련 제품">
      <div className="d-detail-related-header">
        <h2 className="d-detail-related-title">같은 카테고리 제품</h2>
        <Link
          to={categoryPath(currentProduct.categoryCode)}
          className="d-detail-related-more"
        >
          {currentProduct.category} 전체보기 <ArrowRight size={14} />
        </Link>
      </div>
      <div className="d-detail-related-grid">
        {related.map((raw) => {
          const food = getAdapted(raw);
          return (
            <FoodCard
              key={food.id}
              food={food}
              layout="grid"
              onClick={() => onNavigate(food)}
            />
          );
        })}
      </div>
    </section>
  );
}
