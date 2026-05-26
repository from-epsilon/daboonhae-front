// 다분해 DS BottomNav (하단 4탭 — home/category/compare/myd)
// props:
//   - active: 'home' | 'category' | 'compare' | 'myd'
//   - onSelect: (id) => void
//   - compareCount: 비교 탭 우상단 배지 카운트
// 비고: MY 탭은 페이지 미구현이지만 시각 일관성 위해 노출. 라우팅은 페이지 에이전트가 처리
import { IconHome, IconCategory, IconCompare, IconUser } from './Icons.jsx';

// 탭 정의 — id/label/Icon 매핑 (DS 원본 그대로)
const TABS = [
  { id: 'home', label: '홈', Icon: IconHome },
  { id: 'category', label: '카테고리', Icon: IconCategory },
  { id: 'compare', label: '비교함', Icon: IconCompare },
  { id: 'myd', label: 'MY', Icon: IconUser },
];

// 우상단 카운트 배지 (compare 탭 한정)
function CountBadge({ count }) {
  if (!count || count <= 0) return null;
  return (
    <span
      style={{
        position: 'absolute',
        top: 4,
        right: 'calc(50% - 22px)',
        background: 'var(--red-500)',
        color: 'white',
        fontFamily: 'var(--font-numeric)',
        fontSize: 9,
        fontWeight: 700,
        padding: '0 5px',
        borderRadius: 999,
        minWidth: 14,
        textAlign: 'center',
        lineHeight: '14px',
      }}
    >
      {count}
    </span>
  );
}

export function BottomNav({ active, onSelect, compareCount = 0 }) {
  const handleSelect = (id) => {
    if (typeof onSelect === 'function') onSelect(id);
  };

  return (
    <div
      style={{
        display: 'flex',
        background: 'white',
        height: 56,
        borderTop: '1px solid var(--border-tertiary)',
        flexShrink: 0,
      }}
    >
      {TABS.map((t) => {
        const isActive = t.id === active;
        const Icon = t.Icon;
        return (
          <div
            key={t.id}
            onClick={() => handleSelect(t.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              color: isActive ? 'var(--green-500)' : 'var(--text-tertiary)',
              fontSize: 10,
              fontWeight: 500,
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <Icon size={22} />
            {t.id === 'compare' && <CountBadge count={compareCount} />}
            {t.label}
          </div>
        );
      })}
    </div>
  );
}
