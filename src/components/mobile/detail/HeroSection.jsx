// 모바일 디테일 — 히어로 섹션
// - 좌측: 정사각 이미지 (1:1)
// - 우측: 브랜드/이름/용량 + 큰 ScoreGauge (다분해 점수) + Trust 배지
// - 점수가 페이지 시그니처라 ScoreGauge를 132px로 크게 노출
import { Badge } from '../../ds/Badge.jsx';
import { IconCheck } from '../../ds/Icons.jsx';

// 이미지 영역 — 정사각 흰 배경 + 1px 보더
function HeroImage({ src, alt }) {
  return (
    <div className="m-detail-hero-img">
      {src ? (
        <img src={src} alt={alt} loading="lazy" />
      ) : (
        <div className="m-detail-hero-img-placeholder" aria-hidden="true">
          이미지 없음
        </div>
      )}
    </div>
  );
}

// 신뢰 배지 행 — IconCheck + 라벨 (작게)
function TrustRow({ trustBadges }) {
  if (!trustBadges || trustBadges.length === 0) return null;
  return (
    <div className="m-detail-hero-trust">
      {trustBadges.map((t, i) => (
        <span key={i} className="m-detail-hero-trust-item">
          <IconCheck size={12} stroke={2} />
          {t.label}
        </span>
      ))}
    </div>
  );
}

export function HeroSection({ product }) {
  // safety: product null 가드는 상위에서 처리하므로 여기선 필드만 안전 접근
  const brand = product?.brand ?? '';
  const name = product?.name ?? '';
  const serving = product?.serving ?? '';

  return (
    <section className="m-detail-hero">
      <HeroImage src={product?.thumb} alt={name} />
      <div className="m-detail-hero-body">
        <div className="m-detail-hero-meta">
          <div className="m-detail-hero-brand">{brand}</div>
          <h1 className="m-detail-hero-name">{name}</h1>
          {serving && <div className="m-detail-hero-serving">{serving} 기준</div>}
        </div>
        <TrustRow trustBadges={product?.trustBadges} />
      </div>
    </section>
  );
}
