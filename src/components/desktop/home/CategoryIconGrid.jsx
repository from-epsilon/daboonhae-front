import {
  LayoutGrid,
  Wheat,
  Drumstick,
  Zap,
  IceCreamCone,
  Soup,
  Milk,
  Ham,
  CupSoda,
  Cookie,
  GlassWater,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'cereal', label: '시리얼/그래놀라', iconSrc: '/icons/cat-cereal.png', Icon: Wheat, gradientA: '#FFF9C4', gradientB: '#F9A825' },
  { id: 'chicken', label: '닭가슴살', iconSrc: '/icons/cat-chicken.png', Icon: Drumstick, gradientA: '#FFE0B2', gradientB: '#FB8C00' },
  { id: 'energy-bar', label: '에너지바', iconSrc: '/icons/cat-protein-bar.png', Icon: Zap, gradientA: '#C8E6C9', gradientB: '#4CAF50' },
  { id: 'icecream', label: '아이스크림', iconSrc: '/icons/cat-icecream.png', Icon: IceCreamCone, gradientA: '#F8BBD0', gradientB: '#EC407A' },
  { id: 'rice-noodle', label: '밥/면류', iconSrc: '/icons/cat-rice-noodle.png', Icon: Soup, gradientA: '#D7CCC8', gradientB: '#795548' },
  { id: 'protein-drink', label: '단백질 음료', iconSrc: '/icons/cat-protein-drink.png', Icon: Milk, gradientA: '#FFD3B6', gradientB: '#FF8C42' },
  { id: 'sausage', label: '소시지/햄', iconSrc: '/icons/cat-sausage.png', Icon: Ham, gradientA: '#FFCDD2', gradientB: '#E53935' },
  { id: 'shake', label: '셰이크', iconSrc: '/icons/cat-shake.png', Icon: CupSoda, gradientA: '#E1BEE7', gradientB: '#8E24AA' },
  { id: 'snack', label: '과자', iconSrc: '/icons/cat-snack.png', Icon: Cookie, gradientA: '#FFF9C4', gradientB: '#FBC02D' },
  { id: 'zero-drink', label: '제로 음료', iconSrc: '/icons/cat-zero-drink.png', Icon: GlassWater, gradientA: '#BBDEFB', gradientB: '#1E88E5' },
];

function CategoryItem({ label, iconSrc, Icon, gradientA, gradientB, onClick }) {
  return (
    <button type="button" className="d-home-cat-item" onClick={onClick}>
      <span className="d-home-cat-illus">
        {iconSrc ? (
          <img src={iconSrc} alt="" className="d-home-cat-illus-img" />
        ) : (
          <span
            className="d-home-cat-illus-ph"
            style={{
              background: `radial-gradient(circle at 30% 25%, ${gradientA}, ${gradientB})`,
            }}
            aria-hidden="true"
          >
            {Icon && <Icon size={28} strokeWidth={1.8} color="#ffffff" />}
          </span>
        )}
      </span>
      <span className="d-home-cat-label">{label}</span>
    </button>
  );
}

function CategoryAllItem({ onClick }) {
  return (
    <button type="button" className="d-home-cat-item d-home-cat-item--all" onClick={onClick}>
      <span className="d-home-cat-illus">
        <span className="d-home-cat-illus-ph d-home-cat-illus-ph--all" aria-hidden="true">
          <LayoutGrid size={26} strokeWidth={1.8} />
        </span>
      </span>
      <span className="d-home-cat-label">전체보기</span>
    </button>
  );
}

export default function CategoryIconGrid({ items = CATEGORIES, onSelect, onSelectAll }) {
  return (
    <nav className="d-home-cat-grid" aria-label="식품유형 카테고리">
      {items.map((c) => (
        <CategoryItem key={c.id} {...c} onClick={() => onSelect(c.id)} />
      ))}
      <CategoryAllItem onClick={onSelectAll} />
    </nav>
  );
}
