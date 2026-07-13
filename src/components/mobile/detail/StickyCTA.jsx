import { IconCheck, IconHeart, IconPlus } from '../../ds/Icons.jsx';

function getCompareCopy(inCart) {
  return inCart
    ? { label: '담김', Icon: IconCheck }
    : { label: '비교함', Icon: IconPlus };
}

export function StickyCTA({ inCart, onToggleCompare, inWishlist, onToggleWishlist }) {
  const { label, Icon } = getCompareCopy(inCart);

  return (
    <div className="m-detail-cta-bar" role="region" aria-label="비교 액션">
      <div className="m-detail-cta-inner">
        <button
          type="button"
          className={`m-detail-cta-wishlist ${inWishlist ? 'is-active' : ''}`}
          onClick={onToggleWishlist}
          aria-pressed={inWishlist}
          aria-label={inWishlist ? '찜함에서 빼기' : '찜하기'}
        >
          <IconHeart size={18} stroke={1.8} fill={inWishlist ? 'currentColor' : 'none'} />
          <span>찜</span>
        </button>
        <button
          type="button"
          className={`m-detail-cta-compare ${inCart ? 'is-active' : ''}`}
          onClick={onToggleCompare}
          aria-pressed={inCart}
        >
          <Icon size={18} stroke={2} />
          <span>{label}</span>
        </button>
      </div>
    </div>
  );
}
