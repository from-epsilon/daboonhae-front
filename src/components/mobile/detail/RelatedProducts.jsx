// 모바일 디테일 — 같은 카테고리 다른 제품 (가로 스크롤)
// - 식품유형 코드(categoryCode) 일치하는 다른 제품 최대 8개
// - 카드 클릭 → 해당 상세로 이동
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { FoodCard } from '../../ds/FoodCard.jsx';
import { getAdapted } from '../../../data/adapters.js';
import { productPath } from '../../../data/productUrl.js';
import { categoryPath } from '../../../data/categoryTabs.js';

export function RelatedProducts({ currentRaw, allProducts, limit = 4 }) {
  const navigate = useNavigate();

  const code = currentRaw?.categoryCode;
  const related = code
    ? allProducts
        .filter((p) => p.id !== currentRaw.id && p.categoryCode === code)
        .sort((a, b) => String(a.id).localeCompare(String(b.id)))
        .slice(0, limit)
        .map(getAdapted)
    : [];

  if (related.length === 0) return null;

  return (
    <section className="m-detail-related">
      <header className="m-detail-section-head">
        <h2 className="m-detail-section-title">같은 카테고리 다른 제품</h2>
        <button
          type="button"
          className="m-detail-section-more"
          onClick={() => navigate(categoryPath(currentRaw.categoryCode))}
        >
          <span>전체보기</span>
          <ArrowRight size={14} strokeWidth={2.2} />
        </button>
      </header>
      <div className="m-detail-related-slider">
        {related.map((food) => (
          <div key={food.id} className="m-detail-related-card">
            <FoodCard
              food={food}
              layout="grid"
              onClick={() => navigate(productPath(food))}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
