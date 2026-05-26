// 데스크탑 메인 — 하단 카테고리 아이콘 그리드 (가로 9개)
// - 이미지 가이드: 3D 일러스트 스타일 아이콘
//   현재는 실제 3D 에셋이 없어 그라데이션 blob + lucide 아이콘(흰색)로 placeholder 처리
//   → CategoryItem 에 iconSrc prop을 우선 사용하므로, 추후 에셋이 들어오면 자동 교체됨
// - 각 카드: Best/New 등 작은 빨간 라벨(prop badge) — 카드 좌상단에 배치
// - 마지막 카드는 '전체보기' 슬롯
import {
  LayoutGrid,
  Milk,
  Cookie,
  GlassWater,
  Soup,
  Drumstick,
  UtensilsCrossed,
  CupSoda,
} from 'lucide-react';

// 임시 카테고리 7개 + 전체보기 1개 — 우리 서비스(저당/다이어트 식품 비교) 맥락
// - iconSrc: 3D 일러스트 PNG 경로 (Vite public 폴더 — /icons/* 로 직접 접근)
//   미지정 항목은 Icon(lucide) + gradient placeholder 로 폴백
// - gradientA/B: placeholder 톤 (iconSrc 없을 때만 사용)
const CATEGORIES = [
  { id: 'protein-drink', label: '단백질 음료', iconSrc: '/icons/cat-protein-drink.png', Icon: Milk, gradientA: '#FFD3B6', gradientB: '#FF8C42' },
  { id: 'protein-bar', label: '단백질 바', iconSrc: '/icons/cat-protein-bar.png', Icon: Cookie, gradientA: '#C8E6C9', gradientB: '#4CAF50' },
  { id: 'zero-drink', label: '제로 음료', iconSrc: '/icons/cat-zero-drink.png', Icon: GlassWater, gradientA: '#BBDEFB', gradientB: '#1E88E5' },
  { id: 'konjac', label: '곤약·면', iconSrc: '/icons/cat-konjac.png', Icon: Soup, gradientA: '#E1BEE7', gradientB: '#8E24AA' },
  { id: 'chicken', label: '닭가슴살', iconSrc: '/icons/cat-chicken.png', Icon: Drumstick, gradientA: '#FFE0B2', gradientB: '#FB8C00' },
  { id: 'lunchbox', label: '저칼로리 도시락', iconSrc: '/icons/cat-lunchbox.png', Icon: UtensilsCrossed, gradientA: '#B2EBF2', gradientB: '#00ACC1' },
  { id: 'shake', label: '단백질 쉐이크', iconSrc: '/icons/cat-shake.png', Icon: CupSoda, gradientA: '#F8BBD0', gradientB: '#EC407A' },
];

// 단일 카테고리 카드
// - iconSrc 가 주어지면 <img> 로 렌더 (3D 에셋 들어왔을 때 자동 전환)
// - 그렇지 않으면 gradient blob + 흰색 lucide 아이콘(시각 인지 강화)
// - badge ('Best' | 'New' | string) 는 카드 좌상단 코너에 빨간 pill 라벨
function CategoryItem({ label, iconSrc, badge, Icon, gradientA, gradientB, onClick }) {
  return (
    <button type="button" className="d-home-cat-item" onClick={onClick}>
      {badge && (
        <span className="d-home-cat-badge" aria-label={`${badge} 카테고리`}>
          {badge}
        </span>
      )}
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

// "전체보기" 카드 (마지막 자리)
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
  const handleSelect = (id) => {
    if (typeof onSelect === 'function') onSelect(id);
  };
  return (
    <nav className="d-home-cat-grid" aria-label="카테고리 빠른 이동">
      {items.map((c) => (
        <CategoryItem key={c.id} {...c} onClick={() => handleSelect(c.id)} />
      ))}
      <CategoryAllItem onClick={onSelectAll} />
    </nav>
  );
}
