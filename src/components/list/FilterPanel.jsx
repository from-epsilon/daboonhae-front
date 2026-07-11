import { AlertTriangle, X } from 'lucide-react';

// 목적별 필터 패널
// - 목적 메타의 filters 스펙을 받아 타입별로 적절한 UI 렌더 (range/multi/bool)
// - 필터 상태는 부모(ListPage)에서 관리. 여기서는 입력만 위로 흘림
export default function FilterPanel({ specs, value, onChange }) {
  if (!specs || specs.length === 0) {
    return (
      <div className="filter-panel">
        <div className="filter-empty">사용 가능한 세부 필터가 없습니다.</div>
      </div>
    );
  }

  const updateField = (key, next) => {
    onChange({ ...value, [key]: next });
  };

  return (
    <div className="filter-panel">
      <div className="filter-panel-title">필터</div>
      {specs.map((spec) => (
        <div key={spec.key} className="filter-item">
          <FilterLabel label={spec.label} note={spec.note} />
          {renderFilterControl(spec, value[spec.key], (next) => updateField(spec.key, next))}
        </div>
      ))}
    </div>
  );
}

function FilterLabel({ label, note }) {
  return (
    <div className="filter-label">
      <span>{label}</span>
      {note && (
        <button type="button" className="filter-note-wrap" aria-label={note}>
          <AlertTriangle size={13} aria-hidden />
          <span className="filter-note-bubble" role="tooltip">{note}</span>
        </button>
      )}
    </div>
  );
}

// 타입별 컨트롤 렌더 (스위치)
function renderFilterControl(spec, v, onChange) {
  if (spec.type === 'range') return <RangeControl spec={spec} value={v} onChange={onChange} />;
  if (spec.type === 'multi') return <MultiControl spec={spec} value={v ?? []} onChange={onChange} />;
  if (spec.type === 'tristate') return <TriStateControl spec={spec} value={v ?? {}} onChange={onChange} />;
  if (spec.type === 'exclude_only') return <ExcludeOnlyControl spec={spec} value={v ?? {}} onChange={onChange} />;
  if (spec.type === 'single') return <SingleControl spec={spec} value={v} onChange={onChange} />;
  if (spec.type === 'bool') return <BoolControl value={!!v} onChange={onChange} />;
  return null;
}

// range: 최소/최대 입력 (실제 슬라이더는 추후 교체)
function RangeControl({ spec, value, onChange }) {
  const min = value?.min ?? '';
  const max = value?.max ?? '';
  return (
    <div className="filter-range">
      <input
        type="number"
        placeholder={String(spec.min)}
        value={min}
        onChange={(e) => onChange({ ...value, min: e.target.value === '' ? undefined : Number(e.target.value) })}
      />
      <span>~</span>
      <input
        type="number"
        placeholder={String(spec.max)}
        value={max}
        onChange={(e) => onChange({ ...value, max: e.target.value === '' ? undefined : Number(e.target.value) })}
      />
    </div>
  );
}

// multi: 체크박스 그룹
function MultiControl({ spec, value, onChange }) {
  const toggle = (opt) => {
    const next = value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt];
    onChange(next);
  };
  return (
    <div className="filter-multi">
      {spec.options.map((opt) => (
        <label key={opt} className="filter-multi-item">
          <input
            type="checkbox"
            checked={value.includes(opt)}
            onChange={() => toggle(opt)}
          />
          <span>{opt}</span>
        </label>
      ))}
    </div>
  );
}

// bool: 토글
function BoolControl({ value, onChange }) {
  return (
    <label className="filter-bool">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
      <span>적용</span>
    </label>
  );
}

// single: 드롭다운에서 옵션 중 하나만 선택
function SingleControl({ spec, value, onChange }) {
  return (
    <select
      className="filter-single-select"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || undefined)}
      aria-label={spec.label}
    >
      <option value="">전체</option>
      {spec.options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}

// tristate: 각 옵션마다 O(포함) / X(제외) 버튼
// - value 형태: { '말티톨': 'exclude', '알룰로스': 'include' } (선택 안 한 옵션은 키 없음 → 상관없음)
// - 같은 버튼을 다시 누르면 해제 (=상관없음)
function TriStateControl({ spec, value, onChange }) {
  const setState = (option, nextState) => {
    const next = { ...value };
    if (next[option] === nextState) {
      delete next[option];
    } else {
      next[option] = nextState;
    }
    onChange(next);
  };

  return (
    <div className="filter-tristate">
      {spec.options.map((opt) => (
        <div key={opt} className="filter-tristate-row">
          <span className="filter-tristate-label">{opt}</span>
          <div className="filter-tristate-buttons">
            <button
              className={`tristate-btn tristate-include ${value[opt] === 'include' ? 'is-active' : ''}`}
              onClick={() => setState(opt, 'include')}
              aria-label={`${opt} 포함`}
              aria-pressed={value[opt] === 'include'}
              title="포함"
            >
              <span aria-hidden>O</span>
            </button>
            <button
              className={`tristate-btn tristate-exclude ${value[opt] === 'exclude' ? 'is-active' : ''}`}
              onClick={() => setState(opt, 'exclude')}
              aria-label={`${opt} 제외`}
              aria-pressed={value[opt] === 'exclude'}
              title="제외"
            >
              <X size={16} aria-hidden />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ExcludeOnlyControl({ spec, value, onChange }) {
  const toggle = (option) => {
    const next = { ...value };
    if (next[option] === 'exclude') delete next[option];
    else next[option] = 'exclude';
    onChange(next);
  };

  return (
    <div className="filter-tristate">
      {spec.options.map((opt) => (
        <div key={opt} className="filter-tristate-row">
          <span className="filter-tristate-label">{opt}</span>
          <div className="filter-tristate-buttons">
            <button
              className={`tristate-btn tristate-exclude ${value[opt] === 'exclude' ? 'is-active' : ''}`}
              onClick={() => toggle(opt)}
              aria-label={`${opt} 제외`}
              aria-pressed={value[opt] === 'exclude'}
              title="제외"
            >
              <X size={16} aria-hidden />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
