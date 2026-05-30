// 모바일 디테일 — 하단 sticky CTA bar
// - 좌측: 비교함 토글 버튼 (secondary)
// - 우측: 구매하러 가기 (cta)
//   · 오퍼 0개 + source_url 있으면 source_url 새 탭 / 둘 다 없으면 비활성
//   · 오퍼 1개면 바로 그 링크 새 탭
//   · 오퍼 2개 이상이면 구매처 선택 시트 열기 (onOpenPurchase)
// - z-index: var(--z-floating: 50) — 토큰 미정의 환경 대비 50 폴백
import { Button } from '../../ds/Button.jsx';
import { IconCheck, IconPlus } from '../../ds/Icons.jsx';

// 비교함 라벨/아이콘 결정 (담겨있으면 빼기, 아니면 담기)
function getCompareCopy(inCart) {
  return inCart
    ? { label: '담김', Icon: IconCheck }
    : { label: '비교함', Icon: IconPlus };
}

export function StickyCTA({ inCart, onToggleCompare, purchaseUrl, purchaseLinks = [], onOpenPurchase }) {
  const { label, Icon } = getCompareCopy(inCart);

  const offerCount = purchaseLinks.length;
  const hasSourceUrl = !!purchaseUrl && purchaseUrl !== '#';
  // 구매 가능 = 오퍼가 있거나, 폴백 source_url이 있을 때
  const canBuy = offerCount > 0 || hasSourceUrl;

  // 최저가(첫 오퍼는 가격 오름차순 정렬됨) 가격 — 버튼 보조 표기
  const cheapest = purchaseLinks.find((l) => typeof l.price === 'number');
  const buyLabel = offerCount > 1
    ? `구매처 ${offerCount}곳 비교`
    : '구매하러 가기';

  // 구매 클릭
  const handleBuy = () => {
    if (offerCount > 1) {
      onOpenPurchase?.();
      return;
    }
    if (offerCount === 1) {
      window.open(purchaseLinks[0].url, '_blank', 'noopener,noreferrer');
      return;
    }
    if (hasSourceUrl) {
      window.open(purchaseUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="m-detail-cta-bar" role="region" aria-label="구매 액션">
      <div className="m-detail-cta-inner">
        <button
          type="button"
          className={`m-detail-cta-compare ${inCart ? 'is-active' : ''}`}
          onClick={onToggleCompare}
          aria-pressed={inCart}
        >
          <Icon size={18} stroke={2} />
          <span>{label}</span>
        </button>
        <div className="m-detail-cta-buy">
          <Button
            variant="cta"
            size="lg"
            full
            onClick={handleBuy}
            disabled={!canBuy}
          >
            {canBuy ? (
              <span className="m-detail-cta-buy-inner">
                <span>{buyLabel}</span>
                {cheapest && offerCount > 1 && (
                  <span className="m-detail-cta-price">
                    {cheapest.price.toLocaleString()}원~
                  </span>
                )}
              </span>
            ) : '구매 링크 준비중'}
          </Button>
        </div>
      </div>
    </div>
  );
}
