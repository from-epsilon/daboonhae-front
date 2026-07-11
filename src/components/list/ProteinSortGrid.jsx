// 단백질 음료 전용 정렬 선택 — 추천순 + 성분 토글
// - 추천순: 카드에서 추천점수를 최우선으로 표시
// - 조합 정렬: 현재는 기준(mode) 선택을 비활성화하고 총량 기준만 노출한다.
//   kcal/price 기준은 listSort의 mode 구조에 남겨두었으므로 나중에 축을 다시 추가할 수 있다.
// - 데스크톱 드롭다운/모바일 시트 공용
import {
  PROTEIN_SORT_BASES,
  PROTEIN_SORT_RECOMMEND,
  makeProteinSortKey,
  splitProteinSortKey,
} from '../../data/listSort.js';

const PROTEIN_SORT_CALORIES_ASC = 'calories_asc';

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
  const caloriesActive = value === PROTEIN_SORT_CALORIES_ASC;
  const current = recommendActive
    ? { base: PROTEIN_SORT_BASES[0].key, mode: 'total' }
    : splitProteinSortKey(value);

  const pickBase = (base) => onChange(makeProteinSortKey(base, 'total'));

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
      <button
        type="button"
        className={`psort-recommend${caloriesActive ? ' is-active' : ''}`}
        aria-pressed={caloriesActive}
        onClick={() => onChange(PROTEIN_SORT_CALORIES_ASC)}
      >
        칼로리 낮은 순
      </button>

      <div className="psort-axes">
        <SortSegment
          head="성분"
          options={PROTEIN_SORT_BASES}
          activeKey={current.base}
          onPick={pickBase}
          disabled={recommendActive || caloriesActive}
        />
      </div>
    </div>
  );
}
