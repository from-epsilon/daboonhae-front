import { useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../../../data/mockProducts.js';

export default function HeroBanner() {
  const navigate = useNavigate();
  const productCount = PRODUCTS.length;

  return (
    <section className="d-home-hero-banner">
      <div className="d-home-hero-banner-inner">
        <p className="d-home-hero-banner-eyebrow">
          지금까지 {productCount}개 제품 분해 완료
        </p>
        <h1 className="d-home-hero-banner-headline">
          오늘의 한 끼,<br />
          <span className="d-home-hero-banner-accent">숫자로 확인</span>해 보세요
        </h1>
        <p className="d-home-hero-banner-sub">
          광고 문구 말고, 영양성분표로 비교하세요.<br />
          다이어트 식품의 영양·성분을 분해해 한눈에 보여드립니다.
        </p>
        <button
          type="button"
          className="d-home-hero-banner-cta"
          onClick={() => navigate('/list')}
        >
          식품 둘러보기
        </button>
      </div>
    </section>
  );
}
