import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { categoryPath } from '../../../data/categoryTabs.js';

// 홈 카테고리 아이콘 그리드
// - label은 리스트 서브칩(categoryTabs.js tab.subs[].label) = DB name_ko 와 정확히 일치해야 함
//   (클릭 시 /list?tab=..&sub=<label> 로 이동하므로 라벨 불일치 시 결과 0개가 됨)
// - 이미지 파일명은 DB food_type_categories.code 기준 (public/images/categories/)
const IMG = '/images/categories';
// 목적별 그룹 구분 없이 모든 카테고리 아이콘을 한 그리드로 노출
// - tab은 클릭 시 이동할 리스트 탭(/list?tab=..) 기준값
const ITEMS = [
  { label: '단백질 음료', code: 'protein_drink', img: `${IMG}/protein-drink.jpg`, tab: 'protein', imgScale: 1.12 },
  { label: '셰이크', code: 'shake', img: `${IMG}/shake.jpg`, tab: 'protein' },
  { label: '닭가슴살', code: 'chicken_breast', img: `${IMG}/chicken-breast.png`, tab: 'protein' },
  { label: '아이스크림', code: 'ice_cream', img: `${IMG}/ice-cream.png`, tab: 'low_sugar' },
  { label: '과자/초콜릿/젤리', code: 'snack_sweets', img: `${IMG}/snack-sweets.jpg`, tab: 'low_sugar', imgScale: 0.9 },
];

// 목적별 그룹 제목 없이 카테고리 아이콘을 한 그리드로 노출
export function CategoryTabs({ products = [] }) {
  const navigate = useNavigate();
  const items = useMemo(() => {
    const visibleCodes = new Set(products.map((p) => p?.categoryCode).filter(Boolean));
    return ITEMS.filter((item) => visibleCodes.has(item.code));
  }, [products]);

  const handleItemClick = (item) => {
    navigate(categoryPath(item.code));
  };

  return (
    <div className="m-cat-tabs">
      <div className="m-cat-grid">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            className={`m-cat-item${item.disabled ? ' is-disabled' : ''}`}
            onClick={() => !item.disabled && handleItemClick(item)}
            disabled={item.disabled}
            aria-disabled={item.disabled || undefined}
          >
            <span className="m-cat-icon">
              <img
                src={item.img}
                alt=""
                className="m-cat-icon-img"
                loading="lazy"
                style={item.imgScale ? { transform: `scale(${item.imgScale})` } : undefined}
              />
              {item.disabled && <span className="m-cat-soon">분석 준비중</span>}
            </span>
            <span className="m-cat-label">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
