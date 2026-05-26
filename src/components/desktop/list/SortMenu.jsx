import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const ALL_OPTIONS = [
  { key: 'calories_asc', label: '칼로리 낮은 순' },
  { key: 'protein_desc', label: '단백질 높은 순' },
  { key: 'carbs_asc', label: '탄수화물 낮은 순' },
  { key: 'sugar_asc', label: '당류 낮은 순' },
];

const HIDE_BY_CATEGORY = {
  '제로 음료': ['protein_desc', 'carbs_asc'],
  '아이스크림': ['protein_desc'],
  '셰이크': ['carbs_asc'],
};

function getOptions(category) {
  if (!category || category === 'all') return ALL_OPTIONS;
  const hidden = HIDE_BY_CATEGORY[category];
  if (!hidden) return ALL_OPTIONS;
  return ALL_OPTIONS.filter((o) => !hidden.includes(o.key));
}

export default function SortMenu({ value, onChange, category }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const options = getOptions(category);
  const current = options.find((o) => o.key === value) ?? options[0];

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
