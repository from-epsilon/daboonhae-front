// 데스크탑 디테일 — 같은 카테고리 관련 제품 (좌측 컬럼, 이미지 아래)
// - 현재 제품 제외, 같은 category 3~4개 (rankingScore 내림차순)
// - FoodCard 작은 grid 레이아웃 사용
// - 결과 없으면 노출 안 함
import { FoodCard } from '../../ds/FoodCard.jsx';
import { getAdapted } from '../../../data/adapters.js';
import { PRODUCTS } from '../../../data/mockProducts.js';

// 같은 카테고리의 다른 제품 — 최대 limit개 (점수 내림차순)
function pickRelated(currentId, category, limit = 3) {
  if (!category) return [];
  return PRODUCTS
    .filter((p) => p.id !== currentId && p.category === category)
    .sort((a, b) => (b.rankingScore ?? 0) - (a.rankingScore ?? 0))
    .slice(0, limit);
}

export function RelatedProducts({ currentProduct, onNavigate, limit = 3 }) {
  const related = pickRelated(currentProduct?.id, currentProduct?.category, limit);
  if (related.length === 0) return null;

  return (
    <section className="d-detail-related" aria-label="관련 제품">
      <h2 className="d-detail-related-title">같은 카테고리 제품</h2>
      <div className="d-detail-related-grid">
        {related.map((raw) => {
          const food = getAdapted(raw);
          return (
            <FoodCard
              key={food.id}
              food={food}
              layout="grid"
              onClick={() => onNavigate(food.id)}
            />
          );
        })}
      </div>
    </section>
  );
}
