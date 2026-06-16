// 데스크탑 디테일 — 우측 정보 카드 (브랜드/이름/점수/태그/매크로/CTA)
// - 페이지 시그니처 ScoreGauge 160px
// - Trust 배지 + 자동 태그 + MacroRow + CTA 2개
// - sticky 컨테이너 안에 들어가므로 자체 wrapper는 단순 div
import { Badge } from '../../ds/Badge.jsx';
import { MacroRow } from '../../ds/MacroRow.jsx';
import { Button } from '../../ds/Button.jsx';
import { IconCheck, IconPlus } from '../../ds/Icons.jsx';

// 우측 컬럼 헤더 — 브랜드/이름/용량
function ProductTitle({ brand, name, serving }) {
  return (
    <header className="d-detail-info-head">
      <div className="d-detail-info-brand">{brand}</div>
      <h1 className="d-detail-info-name">{name}</h1>
      {serving && <div className="d-detail-info-serving">{serving} 기준</div>}
    </header>
  );
}

// 신뢰 배지 (체크 아이콘 + 라벨) — 데스크탑은 옆으로 나열
function TrustBadges({ trustBadges }) {
  if (!trustBadges || trustBadges.length === 0) return null;
  return (
    <div className="d-detail-info-trust">
      {trustBadges.map((t, i) => (
        <span key={i} className="d-detail-info-trust-item">
          <IconCheck size={12} stroke={2} />
          {t.label}
        </span>
      ))}
    </div>
  );
}

// 자동 태그 라인 — Badge 가로 나열, 없으면 노출 안 함
function TagsLine({ tags }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div className="d-detail-info-tags" aria-label="제품 태그">
      {tags.map((t, i) => (
        <Badge key={i} variant={t.v}>
          {t.label}
        </Badge>
      ))}
    </div>
  );
}

// 매크로 분포 미니 카드 — kcal 별도 표시 + 풀 MacroRow
function MacroBlock({ macros }) {
  return (
    <div className="d-detail-info-macro">
      <div className="d-detail-info-macro-head">
        <span className="d-detail-info-macro-title">매크로 분포</span>
        <span className="d-detail-info-macro-kcal">
          <b>{macros.kcal}</b>kcal
        </span>
      </div>
      <MacroRow
        protein={macros.protein}
        carbs={macros.carbs}
        fat={macros.fat}
        kcal={macros.kcal}
      />
    </div>
  );
}

// CTA 라인 — 비교함 토글 + 구매하러 가기
function CTAGroup({ inCart, isFull, max, onToggleCompare, purchaseUrl }) {
  // 비교함 가득 + 아직 안 담긴 상태면 시각적으로만 disabled (alert는 핸들러)
  const compareLabel = inCart ? '비교함에 담김' : '비교함에 담기';
  return (
    <div className="d-detail-info-cta">
      <Button
        variant="secondary"
        size="lg"
        full
        onClick={onToggleCompare}
      >
        {inCart ? <IconCheck size={16} /> : <IconPlus size={16} />}
        <span>{compareLabel}</span>
      </Button>
      <a
        className="d-detail-info-buy"
        href={purchaseUrl || '#'}
        target="_blank"
        rel="noreferrer nofollow sponsored"
        title={!purchaseUrl || purchaseUrl === '#' ? '구매 링크 준비 중' : undefined}
      >
        구매하러 가기
      </a>
      {/* 가득 안내 — 비교함 풀이면 sub 라벨 노출 */}
      {!inCart && isFull && (
        <p className="d-detail-info-cta-hint">
          비교함은 최대 {max}개까지 담을 수 있어요.
        </p>
      )}
    </div>
  );
}

export function ScoreCard({
  product,
  inCart,
  isFull,
  max,
  onToggleCompare,
  purchaseUrl,
}) {
  return (
    <div className="d-detail-info">
      <ProductTitle
        brand={product.brand}
        name={product.name}
        serving={product.serving}
      />
      <TrustBadges trustBadges={product.trustBadges} />
      <TagsLine tags={product.tags} />
      <MacroBlock macros={product.macros} />
      <CTAGroup
        inCart={inCart}
        isFull={isFull}
        max={max}
        onToggleCompare={onToggleCompare}
        purchaseUrl={purchaseUrl}
      />
    </div>
  );
}
