// 단백질 음료 전용 정렬 선택 — 추천순 + 기준/성분 분리 토글
// - 추천순: 카드에서 단백질 지표 표를 모두 표시
// - 조합 정렬: 기준(mode)과 성분(base)을 각각 선택해 `${base}_${mode}` 키로 확정
// - 데스크톱 드롭다운/모바일 시트 공용
import {
  PROTEIN_SORT_MODES,
  PROTEIN_SORT_BASES,
  PROTEIN_SORT_RECOMMEND,
  makeProteinSortKey,
  splitProteinSortKey,
} from '../../data/listSort.js';

function SortSegment({ head, options, activeKey, onPick, disabled }) {
  return (
    <div className={`psort-axis${disabled ? ' is-disabled' : ''}`}>
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
  const current = recommendActive
    ? { base: PROTEIN_SORT_BASES[0].key, mode: PROTEIN_SORT_MODES[0].key }
    : splitProteinSortKey(value);

  const pickMode = (mode) => onChange(makeProteinSortKey(current.base, mode));
  const pickBase = (base) => onChange(makeProteinSortKey(base, current.mode));

  return (
    <div className="psort">
      <button
        type="button"
        className={`psort-recommend${recommendActive ? ' is-active' : ''}`}
        aria-pressed={recommendActive}
        onClick={() => onChange(PROTEIN_SORT_RECOMMEND)}
      >
        추천순
      </button>

      <div className="psort-axes">
        <SortSegment
          head="기준"
          options={PROTEIN_SORT_MODES}
          activeKey={current.mode}
          onPick={pickMode}
          disabled={recommendActive}
        />
        <SortSegment
          head="성분"
          options={PROTEIN_SORT_BASES}
          activeKey={current.base}
          onPick={pickBase}
          disabled={recommendActive}
        />
      </div>
    </div>
  );
}
