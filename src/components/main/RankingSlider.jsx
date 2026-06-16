import { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useProducts } from '../../store/ProductsContext.jsx';
import { usePurpose } from '../../store/PurposeContext.jsx';
import ProductThumb from '../global/ProductThumb.jsx';
import { productPath } from '../../data/productUrl.js';

// 인기 랭킹 / 추천 카드 슬라이드
// - 스크롤바 숨기고 좌/우 화살표 버튼으로만 넘기는 방식
// - 한 클릭에 컨테이너 폭의 80% 만큼 이동 (보이는 카드 묶음 단위)
// - 목적이 'all'이면 전체 랭킹, 특정 목적이면 그 목적에 맞는 제품으로 필터링
export default function RankingSlider() {
  const { purposeId } = usePurpose();
  const { products: PRODUCTS } = useProducts();
  const trackRef = useRef(null);

  const ranked = useMemo(() => {
    const pool = purposeId === 'all'
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.purposesFit?.includes(purposeId));
    return [...pool].sort((a, b) => b.rankingScore - a.rankingScore).slice(0, 10);
  }, [purposeId, PRODUCTS]);

  const scrollByPage = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    const delta = Math.round(track.clientWidth * 0.8) * direction;
    track.scrollBy({ left: delta, behavior: 'smooth' });
  };

  if (ranked.length === 0) {
    return <div className="ranking-empty">해당 목적의 추천 제품이 아직 없습니다.</div>;
  }

  return (
    <div className="ranking-wrapper">
      <button
        type="button"
        className="ranking-nav ranking-nav-prev"
        onClick={() => scrollByPage(-1)}
        aria-label="이전 추천 보기"
      >
        <ChevronLeft size={22} aria-hidden />
      </button>
      <div className="ranking-slider" role="list" ref={trackRef}>
        {ranked.map((p, idx) => (
          <Link key={p.id} to={productPath(p)} className="ranking-card" role="listitem">
            <div className="ranking-rank">#{idx + 1}</div>
            <ProductThumb product={p} size="card" />
            <div className="ranking-brand">{p.brand}</div>
            <div className="ranking-name">{p.name}</div>
          </Link>
        ))}
      </div>
      <button
        type="button"
        className="ranking-nav ranking-nav-next"
        onClick={() => scrollByPage(1)}
        aria-label="다음 추천 보기"
      >
        <ChevronRight size={22} aria-hidden />
      </button>
    </div>
  );
}
