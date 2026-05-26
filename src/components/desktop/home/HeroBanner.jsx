import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const BANNER_IMAGE = '/banner-hero.png';

export default function HeroBanner() {
  const navigate = useNavigate();

  return (
    <section
      className="d-home-hero-banner"
      onClick={() => navigate('/list')}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') navigate('/list'); }}
      aria-label="제품 둘러보기"
    >
      <img
        className="d-home-hero-banner-img"
        src={BANNER_IMAGE}
        alt="다분해 — 다이어트 식품 영양성분 비교 서비스"
        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
      />
      <div className="d-home-hero-banner-fallback">
        <div className="d-home-hero-banner-fallback-inner">
          <h1 className="d-home-hero-banner-fallback-title">
            성분표 뒤집어 볼 필요 없이,<br />
            <span className="d-home-hero-banner-fallback-accent">한눈에 비교</span>하세요
          </h1>
          <p className="d-home-hero-banner-fallback-sub">
            다이어트 식품의 영양성분을 분석하고 비교해드립니다.
          </p>
          <span className="d-home-hero-banner-fallback-cta">
            제품 둘러보기 <ArrowRight size={16} />
          </span>
          <p className="d-home-hero-banner-fallback-hint">
            /public/banner-hero.png에 배너 이미지를 넣으면 자동 적용됩니다
          </p>
        </div>
      </div>
    </section>
  );
}
