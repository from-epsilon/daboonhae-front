import { useNavigate } from 'react-router-dom';

// 데스크톱 홈 카테고리 아이콘 그리드
// - label은 리스트 서브칩(categoryTabs.js tab.subs[].label) = DB name_ko 와 정확히 일치해야 함
//   (클릭 시 /list?tab=..&sub=<label> 이동 → 라벨 불일치 시 결과 0개)
// - 데스크톱은 폭이 넓어 라벨을 줄이지 않고 DB name_ko 전체를 표시
// - 이미지 파일명은 DB food_type_categories.code 기준 (public/images/categories/)
const IMG = '/images/categories';
// 목적별 그룹 구분 없이 모든 카테고리 아이콘을 한 그리드로 노출
// - tab은 클릭 시 이동할 리스트 탭(/list?tab=..) 기준값
const ITEMS = [
  { label: '단백질 음료', img: `${IMG}/protein-drink.jpg`, tab: 'protein', imgScale: 1.12 },
  { label: '셰이크', img: `${IMG}/shake.jpg`, tab: 'protein' },
  { label: '닭가슴살', img: `${IMG}/chicken-breast.png`, tab: 'protein' },
  { label: '아이스크림', img: `${IMG}/ice-cream.png`, tab: 'low_sugar' },
  { label: '과자/초콜릿/젤리', img: `${IMG}/snack-sweets.jpg`, tab: 'low_sugar', imgScale: 0.9 },
];

// 목적별 그룹 제목 없이 카테고리 아이콘을 한 그리드로 노출
export default function CategoryTabsDesktop() {
  const navigate = useNavigate();

  const handleItemClick = (item) => {
    navigate(`/list?tab=${item.tab}&sub=${encodeURIComponent(item.label)}`);
  };

  return (
    <section className="d-home-cattabs">
      <div className="d-home-cattabs-grid">
        {ITEMS.map((item) => (
          <button
            key={item.label}
            type="button"
            className={`d-home-cattabs-item${item.disabled ? ' is-disabled' : ''}`}
            onClick={() => !item.disabled && handleItemClick(item)}
            disabled={item.disabled}
            aria-disabled={item.disabled || undefined}
          >
            <span className="d-home-cattabs-icon">
              <img
                src={item.img}
                alt=""
                className="d-home-cattabs-icon-img"
                loading="lazy"
                style={item.imgScale ? { transform: `scale(${item.imgScale})` } : undefined}
              />
              {item.disabled && <span className="d-home-cattabs-soon">분석 준비중</span>}
            </span>
            <span className="d-home-cattabs-label">{item.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
