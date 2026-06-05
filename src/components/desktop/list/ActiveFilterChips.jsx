import { X } from 'lucide-react';
import { splitLabelUnit } from '../../../utils/format.js';

// 활성 필터/세부 카테고리를 칩으로 노출 (각 칩 X로 개별 해제)
// - 활성 항목이 하나도 없으면 null 렌더 (DOM 비점유)
// - subCategory가 'all'이 아니면 1개 칩
// - filterState의 각 spec/option을 개별 칩으로 펼침
export default function ActiveFilterChips({
  specs,
  value,
  onChange,
}) {
  const chips = collectChips({ specs, value, onChange });
  if (chips.length === 0) return null;

  return (
    <div className="d-list-active-chips" role="list" aria-label="활성 필터">
      {chips.map((c) => (
        <button
          key={c.id}
          type="button"
          className="d-list-active-chip"
          onClick={c.onRemove}
          aria-label={`${c.label} 필터 제거`}
          role="listitem"
        >
          <span className="d-list-active-chip-text">{c.label}</span>
          <X size={12} aria-hidden />
        </button>
      ))}
    </div>
  );
}

// ───────── chip 생성 (순수 함수)
function collectChips({ specs, value, onChange }) {
  const chips = [];

  if (!specs || !value) return chips;

  const updateField = (key, next) => onChange({ ...value, [key]: next });
  const clearField = (key) => {
    const next = { ...value };
    delete next[key];
    onChange(next);
  };

  for (const spec of specs) {
    const v = value[spec.key];
    if (v === undefined || v === null) continue;
    if (spec.type === 'range') addRangeChip(chips, spec, v, clearField);
    else if (spec.type === 'tristate') addTriStateChips(chips, spec, v, updateField);
    else if (spec.type === 'bool') addBoolChip(chips, spec, v, clearField);
  }

  return chips;
}

// range: 1개 칩으로 묶음 — 단위 포함 ("칼로리 100~400kcal", "단백질 20g 이상")
function addRangeChip(chips, spec, v, clearField) {
  const hasMin = v.min !== undefined && v.min !== '' && v.min !== null;
  const hasMax = v.max !== undefined && v.max !== '' && v.max !== null;
  if (!hasMin && !hasMax) return;
  const { name, unit } = splitLabelUnit(spec.label);
  let rangeTxt;
  if (hasMin && hasMax) rangeTxt = `${v.min}~${v.max}${unit}`;
  else if (hasMin) rangeTxt = `${v.min}${unit} 이상`;
  else rangeTxt = `${v.max}${unit} 이하`;
  chips.push({
    id: `range:${spec.key}`,
    label: `${name} ${rangeTxt}`,
    onRemove: () => clearField(spec.key),
  });
}

// tristate: 옵션별로 분리 — "{label} {option} 포함/제외"
function addTriStateChips(chips, spec, v, updateField) {
  for (const [option, state] of Object.entries(v)) {
    if (!state) continue;
    const tag = state === 'include' ? '포함' : '제외';
    chips.push({
      id: `tri:${spec.key}:${option}`,
      label: `${option} ${tag}`,
      onRemove: () => {
        const next = { ...v };
        delete next[option];
        updateField(spec.key, next);
      },
    });
  }
}

// bool: 토글된 경우만 칩 표시 ("유당 free 적용")
function addBoolChip(chips, spec, v, clearField) {
  if (!v) return;
  chips.push({
    id: `bool:${spec.key}`,
    label: `${spec.label} 적용`,
    onRemove: () => clearField(spec.key),
  });
}
