import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { getSortOptions, resolveSortKey, isProteinDrinkCategory } from '../../../data/listSort.js';
import { ProteinSortGrid } from '../../list/ProteinSortGrid.jsx';
import { ProteinSortLabel } from '../../list/ProteinSortLabel.jsx';

export default function SortMenu({ value, onChange, category }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const options = getSortOptions(category);
  const current = options.find((o) => o.key === value) ?? options[0];
  const isProtein = isProteinDrinkCategory(category);

  useOutsideClose(rootRef, () => setOpen(false), open);

  if (isProtein) {
    return (
      <div className="d-list-sort d-list-sort--protein">
        <ProteinSortGrid value={resolveSortKey(category, value)} onChange={onChange} />
      </div>
    );
  }

  // 일반 카테고리: 한 번 선택하면 닫힘 / 단백질 음료: 2축 선택이라 열어둠
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
        <span className="d-list-sort-trigger-label">
          <ProteinSortLabel sortKey={value} fallback={current.label} withSuffix />
        </span>
        <ChevronDown size={14} aria-hidden className={`d-list-sort-chevron ${open ? 'is-open' : ''}`} />
      </button>
      {open && (
        <ul className="d-list-sort-menu" role="listbox">
          {options.map((o) => (
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
