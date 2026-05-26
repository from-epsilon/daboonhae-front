// 모바일 디테일 — 하단 sticky CTA bar
// - 좌측: 비교함 토글 버튼 (secondary)
// - 우측: 구매하러 가기 (cta, 새 탭)
// - z-index: var(--z-floating: 50) — 토큰 미정의 환경 대비 50 폴백
import { Button } from '../../ds/Button.jsx';
import { IconCheck, IconPlus } from '../../ds/Icons.jsx';

// 비교함 라벨/아이콘 결정 (담겨있으면 빼기, 아니면 담기)
function getCompareCopy(inCart) {
  return inCart
    ? { label: '담김', Icon: IconCheck }
    : { label: '비교함', Icon: IconPlus };
}

export function StickyCTA({ inCart, onToggleCompare, purchaseUrl }) {
  const { label, Icon } = getCompareCopy(inCart);

  // 구매 클릭 — '#' 등 유효하지 않은 URL은 새 탭 열지 않고 콘솔 로그만
  const handleBuy = () => {
    if (!purchaseUrl || purchaseUrl === '#') {
      console.log('[buy] purchaseUrl not set');
      return;
    }
    window.open(purchaseUrl, '_blank', 'noopener,noreferrer');
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
          <Button variant="cta" size="lg" full onClick={handleBuy}>
            구매하러 가기
          </Button>
        </div>
      </div>
    </div>
  );
}
