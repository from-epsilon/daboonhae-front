// 단백질 음료 전용 정렬 선택 — 추천순 + 효율/성분 토글
// - 추천순: 카드에서 추천점수를 최우선으로 표시
// - 효율순: 점수 모델의 칼로리 효율/가성비 값으로 정렬
// - 조합 정렬: 현재는 기준(mode) 선택을 비활성화하고 총량 기준만 노출한다.
//   kcal/price 기준은 listSort의 mode 구조에 남겨두었으므로 나중에 축을 다시 추가할 수 있다.
// - 데스크톱 드롭다운/모바일 시트 공용
import {
  PROTEIN_SORT_BASES,
  PROTEIN_SORT_CALORIE_EFFICIENCY,
  PROTEIN_SORT_PRICE_EFFICIENCY,
  PROTEIN_SORT_QUALITY,
  PROTEIN_SORT_RECOMMEND,
  makeProteinSortKey,
} from '../../data/listSort.js';

const PROTEIN_CORE_OPTIONS = [
  {
    key: makeProteinSortKey(PROTEIN_SORT_BASES[0].key, 'total'),
    label: '단백질',
  },
  { key: PROTEIN_SORT_QUALITY, label: '단백질 퀄리티' },
  { key: PROTEIN_SORT_CALORIE_EFFICIENCY, label: '칼로리 효율' },
  { key: PROTEIN_SORT_PRICE_EFFICIENCY, label: '가성비' },
];

const PROTEIN_AMINO_OPTIONS = PROTEIN_SORT_BASES.slice(1).map((base) => ({
  key: makeProteinSortKey(base.key, 'total'),
  label: base.label,
}));

function SortSegment({ head, options, activeKey, onPick, disabled, variant }) {
  return (
    <div className={`psort-axis${variant ? ` is-${variant}` : ''}${disabled ? ' is-disabled' : ''}`}>
      <span className="psort-axis-head">{head}</span>
      <div className="psort-segment" role="group" aria-label={head}>
        {options.map((o) => (
          <button
            key={o.key}
            type="button"
            className={`psort-opt${o.key === activeKey && !disabled ? ' is-active' : ''}`}
            aria-pressed={o.key === activeKey && !disabled}
            onClick={() => onPick(o.key)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ProteinSortGrid({ value, onChange }) {
  const recommendActive = value === PROTEIN_SORT_RECOMMEND;

  return (
    <div className="psort">
      <button
        type="button"
        className={`psort-recommend${recommendActive ? ' is-active' : ''}`}
        aria-pressed={recommendActive}
        onClick={() => onChange(PROTEIN_SORT_RECOMMEND)}
      >
        추천 순
      </button>
      <div className="psort-axes">
        <SortSegment
          head="핵심"
          options={PROTEIN_CORE_OPTIONS}
          activeKey={value}
          onPick={onChange}
          disabled={recommendActive}
          variant="core"
        />
        <SortSegment
          head="아미노산"
          options={PROTEIN_AMINO_OPTIONS}
          activeKey={value}
          onPick={onChange}
          disabled={recommendActive}
        />
      </div>
    </div>
  );
}
