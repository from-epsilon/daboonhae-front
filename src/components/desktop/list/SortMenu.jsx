import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

// 데스크탑 정렬 메뉴 (커스텀 드롭다운)
// - 네이티브 select 대신 디자인 토큰 일관성 위해 커스텀
// - 외부 클릭 시 닫힘, ESC 닫힘, 키보드 접근성 기본 보장
const OPTIONS = [
  { key: 'calories_asc', label: '칼로리 낮은 순' },
  { key: 'protein_desc', label: '단백질 높은 순' },
  { key: 'sugar_asc', label: '당류 낮은 순' },
];

export default function SortMenu({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const current = OPTIONS.find((o) => o.key === value) ?? OPTIONS[0];

  // 외부 클릭/ESC 닫기 핸들러
  useOutsideClose(rootRef, () => setOpen(false), open);

  const handleSelect = (key) => {
    onChange(key);
    setOpen(false);
  };

  return (
    <div className="d-list-sort" ref={rootRef}>
      <button
        type="button"
        className="d-list-sort-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="d-list-sort-trigger-label">{current.label}</span>
        <ChevronDown size={14} aria-hidden className={`d-list-sort-chevron ${open ? 'is-open' : ''}`} />
      </button>
      {open && (
        <ul className="d-list-sort-menu" role="listbox">
          {OPTIONS.map((o) => (
            <li key={o.key} role="option" aria-selected={o.key === value}>
              <button
                type="button"
                className={`d-list-sort-option ${o.key === value ? 'is-active' : ''}`}
                onClick={() => handleSelect(o.key)}
              >
                <span>{o.label}</span>
                {o.key === value && <Check size={14} aria-hidden />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// 외부 클릭 / ESC 키 닫기 훅 (작은 유틸 — 다른 곳 영향 없음)
function useOutsideClose(ref, onClose, enabled) {
  useEffect(() => {
    if (!enabled) return undefined;
    const handleClick = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) onClose();
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [ref, onClose, enabled]);
}
