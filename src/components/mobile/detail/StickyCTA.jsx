import { IconCheck, IconPlus } from '../../ds/Icons.jsx';

function getCompareCopy(inCart) {
  return inCart
    ? { label: '담김', Icon: IconCheck }
    : { label: '비교함', Icon: IconPlus };
}

export function StickyCTA({ inCart, onToggleCompare }) {
  const { label, Icon } = getCompareCopy(inCart);

  return (
    <div className="m-detail-cta-bar" role="region" aria-label="비교 액션">
      <div className="m-detail-cta-inner m-detail-cta-inner--compare-only">
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
