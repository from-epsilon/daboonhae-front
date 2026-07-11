import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check, CircleQuestionMark } from 'lucide-react';
import {
  getSortOptions,
  isProteinDrinkCategory,
  makeProteinSortKey,
  PROTEIN_SORT_BASES,
  PROTEIN_SORT_VISIBLE_MODES,
  PROTEIN_SORT_RECOMMEND,
} from '../../../data/listSort.js';
import { ProteinSortLabel } from '../../list/ProteinSortLabel.jsx';

// 라벨은 간결하게 성분명만 노출한다.
// 나중에 기준 구분을 다시 드롭다운에 노출하려면 kcal/price suffix를 되살리면 된다.
// 예: kcal: '(칼로리대비)', price: '(가격대비)'
const PROTEIN_MODE_SUFFIX = {
  total: '',
  kcal: '',
  price: '',
};

const DESKTOP_PROTEIN_SORT_OPTIONS = [
  { key: PROTEIN_SORT_RECOMMEND, label: '추천 순', short: '추천 순' },
  { key: 'calories_asc', label: '칼로리 낮은 순', short: '칼로리 낮은 순' },
  ...PROTEIN_SORT_BASES.flatMap((base) =>
    PROTEIN_SORT_VISIBLE_MODES.map((mode) => ({
      key: makeProteinSortKey(base.key, mode.key),
      label: `${base.label} 순${PROTEIN_MODE_SUFFIX[mode.key] ?? ''}`,
      short: `${base.label} 순${PROTEIN_MODE_SUFFIX[mode.key] ?? ''}`,
    }))),
];

const RECOMMEND_SORT_HELP = '단백질 함량과 아미노산 품질, 칼로리·가격 효율, 당류·포화지방·나트륨, 보조 영양성분을 함께 반영한 추천 점수순입니다. 아미노산 정보가 부족한 제품은 원재료의 단백질 품질을 참고해 보정합니다.';

export default function SortMenu({ value, onChange, category }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const isProtein = isProteinDrinkCategory(category);
  const options = isProtein ? DESKTOP_PROTEIN_SORT_OPTIONS : getSortOptions(category);
  const currentKey = options.some((o) => o.key === value) ? value : options[0].key;
  const current = options.find((o) => o.key === currentKey) ?? options[0];

  useOutsideClose(rootRef, () => setOpen(false), open);

  useEffect(() => {
    if (isProtein && value !== currentKey) {
      onChange(currentKey);
    }
  }, [currentKey, isProtein, onChange, value]);

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
          {isProtein
            ? current.label
            : <ProteinSortLabel sortKey={currentKey} fallback={current.label} withSuffix />}
        </span>
        {isProtein && currentKey === PROTEIN_SORT_RECOMMEND && (
          <span className="d-list-sort-help" title={RECOMMEND_SORT_HELP} aria-hidden="true">
            <CircleQuestionMark size={14} aria-hidden />
            <span className="d-list-sort-help-bubble" role="tooltip">{RECOMMEND_SORT_HELP}</span>
          </span>
        )}
        <ChevronDown size={18} aria-hidden className={`d-list-sort-chevron ${open ? 'is-open' : ''}`} />
      </button>
      {open && (
        <ul className="d-list-sort-menu" role="listbox">
          {options.map((o) => (
            <li key={o.key} role="option" aria-selected={o.key === value}>
              <button
                type="button"
                className={`d-list-sort-option ${o.key === currentKey ? 'is-active' : ''}`}
                onClick={() => handleSelect(o.key)}
              >
                <span>{o.label}</span>
                {o.key === currentKey && <Check size={14} aria-hidden />}
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
