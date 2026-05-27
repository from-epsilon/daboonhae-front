import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drumstick, Milk, Zap,
  IceCreamCone, Cookie, Cherry, GlassWater,
  Soup, Salad, Wheat, CupSoda, UtensilsCrossed,
} from 'lucide-react';

const TABS = [
  {
    id: 'protein',
    label: '단백질 보충',
    items: [
      { label: '닭가슴살', category: '닭가슴살', Icon: Drumstick, bg: '#FFF3E0', color: '#E65100' },
      { label: '단백질 음료', category: '단백질 음료', Icon: Milk, bg: '#E8F5E9', color: '#2E7D32' },
      { label: '단백질바', category: '에너지바', Icon: Zap, bg: '#FFF8E1', color: '#F57F17' },
    ],
  },
  {
    id: 'low_sugar',
    label: '저당 간식',
    items: [
      { label: '아이스크림', category: '아이스크림', Icon: IceCreamCone, bg: '#FCE4EC', color: '#C62828' },
      { label: '과자', category: '과자', Icon: Cookie, bg: '#FFF8E1', color: '#E65100' },
      { label: '젤리', category: '젤리', Icon: Cherry, bg: '#F3E5F5', color: '#7B1FA2' },
      { label: '제로 음료', category: '제로 음료', Icon: GlassWater, bg: '#E3F2FD', color: '#1565C0' },
    ],
  },
  {
    id: 'meal',
    label: '식사 대용',
    items: [
      { label: '밥', category: '밥/면류', Icon: Soup, bg: '#EFEBE9', color: '#4E342E' },
      { label: '면', category: '밥/면류', Icon: Salad, bg: '#FFF3E0', color: '#BF360C' },
      { label: '시리얼', category: '시리얼/그래놀라', Icon: Wheat, bg: '#FFF8E1', color: '#F9A825' },
      { label: '그래놀라', category: '시리얼/그래놀라', Icon: UtensilsCrossed, bg: '#F1F8E9', color: '#558B2F' },
      { label: '쉐이크', category: '셰이크', Icon: CupSoda, bg: '#F3E5F5', color: '#7B1FA2' },
      { label: '단백질바', category: '에너지바', Icon: Zap, bg: '#E8F5E9', color: '#2E7D32' },
    ],
  },
];

export default function CategoryTabsDesktop() {
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();
  const tab = TABS[activeTab];

  const handleItemClick = (item) => {
    navigate(`/list?tab=${tab.id}&sub=${encodeURIComponent(item.label)}`);
  };

  return (
    <section className="d-home-cattabs">
      <nav className="d-home-cattabs-head">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            type="button"
            className={`d-home-cattab${i === activeTab ? ' is-active' : ''}`}
            onClick={() => setActiveTab(i)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="d-home-cattabs-grid" key={tab.id}>
        {tab.items.map((item) => {
          const Icon = item.Icon;
          return (
            <button
              key={item.label}
              type="button"
              className="d-home-cattabs-item"
              onClick={() => handleItemClick(item)}
            >
              <span
                className="d-home-cattabs-icon"
                style={{ background: item.bg, color: item.color }}
              >
                <Icon size={36} strokeWidth={1.5} />
              </span>
              <span className="d-home-cattabs-label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
