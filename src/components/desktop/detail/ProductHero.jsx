// 데스크탑 디테일 — 좌측 큰 제품 이미지 + 액션 라인 (공유/찜)
// - 큰 정사각 흰 배경 + 1px 보더 (도덕적 어휘 금지, 평면 카드 톤)
// - 이미지 없는 경우 placeholder
// - 공유/찜은 아이콘 only 버튼, aria-label로 접근성 보장
import { IconShare, IconHeart } from '../../ds/Icons.jsx';

// 이미지 박스 (정사각 1:1) — 부모 폭이 크니까 max-width로 컷
function HeroImage({ src, alt }) {
  if (!src) {
    return (
      <div className="d-detail-hero-img is-empty" aria-hidden="true">
        이미지 없음
      </div>
    );
  }
  return (
    <div className="d-detail-hero-img">
      <img src={src} alt={alt} loading="lazy" />
    </div>
  );
}

// 액션 라인 (공유/찜) — 시각 액션 보강, 실제 동작은 stub
function HeroActions({ productName }) {
  // 실제 공유 API 없이 콘솔만 (모바일 패턴과 일치)
  const handleShare = () => {
    console.log('[share]', productName);
  };
  // 찜 토글은 추후 구현, 일단 콘솔만
  const handleLike = () => {
    console.log('[like]', productName);
  };
  return (
    <div className="d-detail-hero-actions">
      <button
        type="button"
        className="d-detail-hero-action"
        onClick={handleLike}
        aria-label="찜하기"
      >
        <IconHeart size={16} />
        <span>찜</span>
      </button>
      <button
        type="button"
        className="d-detail-hero-action"
        onClick={handleShare}
        aria-label="공유하기"
      >
        <IconShare size={16} />
        <span>공유</span>
      </button>
    </div>
  );
}

export function ProductHero({ product }) {
  // product null 가드는 상위에서 처리
  return (
    <div className="d-detail-hero">
      <HeroImage src={product?.thumb} alt={product?.name ?? ''} />
      <HeroActions productName={product?.name} />
    </div>
  );
}
