import { useNavigate } from 'react-router-dom';
import {
  Drumstick, Milk, Zap, Ham,
  IceCreamCone, Cookie, GlassWater,
  Soup, Salad, Wheat, CupSoda,
} from 'lucide-react';

// 홈 카테고리 아이콘 그리드
// - label은 리스트 서브칩(categoryTabs.js tab.subs[].label) = DB name_ko 와 정확히 일치해야 함
//   (클릭 시 /list?tab=..&sub=<label> 로 이동하므로 라벨 불일치 시 결과 0개가 됨)
const TABS = [
  {
    id: 'protein',
    label: '단백질 보충',
    items: [
      { label: '닭가슴살', Icon: Drumstick, bg: '#FFF3E0', color: '#E65100' },
      { label: '단백질 음료', Icon: Milk, bg: '#E8F5E9', color: '#2E7D32' },
      { label: '에너지바', Icon: Zap, bg: '#FFF8E1', color: '#F57F17' },
      { label: '기타 가공육', Icon: Ham, bg: '#FCE4EC', color: '#C2185B' },
    ],
  },
  {
    id: 'low_sugar',
    label: '저당 간식',
    items: [
      { label: '아이스크림', Icon: IceCreamCone, bg: '#FCE4EC', color: '#C62828' },
      { label: '과자/초콜릿/젤리', Icon: Cookie, bg: '#FFF8E1', color: '#E65100' },
      { label: '제로 음료', Icon: GlassWater, bg: '#E3F2FD', color: '#1565C0' },
    ],
  },
  {
    id: 'meal',
    label: '식사 대용',
    items: [
      { label: '밥', Icon: Soup, bg: '#EFEBE9', color: '#4E342E' },
      { label: '면', Icon: Salad, bg: '#FFF3E0', color: '#BF360C' },
      { label: '시리얼/그래놀라/오트밀', Icon: Wheat, bg: '#FFF8E1', color: '#F9A825' },
      { label: '셰이크', Icon: CupSoda, bg: '#F3E5F5', color: '#7B1FA2' },
      { label: '에너지바', Icon: Zap, bg: '#E8F5E9', color: '#2E7D32' },
    ],
  },
];

// 탭 전환 없이 목적별 그룹 섹션으로 모든 카테고리 아이콘을 한 번에 노출
export function CategoryTabs() {
  const navigate = useNavigate();

  const handleItemClick = (tab, item) => {
    navigate(`/list?tab=${tab.id}&sub=${encodeURIComponent(item.label)}`);
  };

  return (
    <div className="m-cat-tabs">
      {TABS.map((tab) => (
        <div key={tab.id} className="m-cat-group">
          <h3 className="m-cat-group-title">{tab.label}</h3>
          <div className="m-cat-grid">
            {tab.items.map((item) => {
              const Icon = item.Icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  className="m-cat-item"
                  onClick={() => handleItemClick(tab, item)}
                >
                  <span
                    className="m-cat-icon"
                    style={{ background: item.bg, color: item.color }}
                  >
                    <Icon size={28} strokeWidth={1.5} />
                  </span>
                  <span className="m-cat-label">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
