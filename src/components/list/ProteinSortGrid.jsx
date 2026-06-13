// 단백질 음료 전용 정렬 선택 — 추천순 + 기준(열1) × 성분(열2) 2열 단일선택 그리드
// - 상단: 추천순(기본 순서)
// - 하단: 각 열에서 하나씩 선택, 두 열이 모두 정해져야 정렬 완성(한 열만 골라도 다른 열은 자동 결정 안 됨)
// - 데스크톱 드롭다운/모바일 시트 공용
import { useEffect, useState } from 'react';
import {
  PROTEIN_SORT_MODES,
  PROTEIN_SORT_BASES,
  PROTEIN_SORT_RECOMMEND,
  makeProteinSortKey,
  splitProteinSortKey,
} from '../../data/listSort.js';

// 단일 열 — 헤더 + 단일선택 버튼 목록 (activeKey가 null이면 아무것도 강조 안 함)
function SortColumn({ head, options, activeKey, onPick }) {
  return (
    <div className="psort-col">
      <span className="psort-col-head">{head}</span>
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          className={`psort-opt${o.key === activeKey ? ' is-active' : ''}`}
          aria-pressed={o.key === activeKey}
          onClick={() => onPick(o.key)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// value → 열별 초기 선택 (추천순이면 둘 다 미선택)
function selectionFromValue(value) {
  if (value === PROTEIN_SORT_RECOMMEND) return { base: null, mode: null };
  return splitProteinSortKey(value);
}

export function ProteinSortGrid({ value, onChange }) {
  // base/mode를 각각 독립적으로 보유 — 한 열만 선택된 부분 상태를 허용
  const [sel, setSel] = useState(() => selectionFromValue(value));

  // 외부 value 변경(카테고리 전환·추천순 리셋·확정된 조합)과 동기화
  useEffect(() => {
    setSel(selectionFromValue(value));
  }, [value]);

  // 한 축 선택 — 두 축이 모두 정해졌을 때만 정렬 확정(onChange)
  const commit = (base, mode) => {
    setSel({ base, mode });
    if (base && mode) onChange(makeProteinSortKey(base, mode));
  };

  const pickRecommend = () => {
    setSel({ base: null, mode: null });
    onChange(PROTEIN_SORT_RECOMMEND);
  };

  // 추천순 강조 — 두 열 모두 미선택일 때만
  const recommendActive = !sel.base && !sel.mode;

  return (
    <div className="psort">
      <button
        type="button"
        className={`psort-recommend${recommendActive ? ' is-active' : ''}`}
        aria-pressed={recommendActive}
        onClick={pickRecommend}
      >
        추천순
      </button>

      <div className="psort-grid">
        <SortColumn
          head="기준"
          options={PROTEIN_SORT_MODES}
          activeKey={sel.mode}
          onPick={(m) => commit(sel.base, m)}
        />
        <SortColumn
          head="성분"
          options={PROTEIN_SORT_BASES}
          activeKey={sel.base}
          onPick={(b) => commit(b, sel.mode)}
        />
      </div>
    </div>
  );
}
