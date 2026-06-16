import { AlertTriangle, X, RotateCcw, Check } from 'lucide-react';
import { splitLabelUnit } from '../../../utils/format.js';

// 데스크탑 좌측 사이드바 필터
// - 280px 고정 폭, sticky 상단 고정
// - 필터 타이틀 + 활성 개수 + 초기화 버튼
// - 세부 카테고리(라디오 리스트) + 목적별 필터(range/tristate/bool)
// - 부모(ListPage)가 모든 상태를 관리, 여기서는 입력만 전달
export default function SidebarFilter({
  specs,
  value,
  onChange,
  onReset,
  activeCount,
}) {
  const updateField = (key, next) => {
    onChange({ ...value, [key]: next });
  };

  return (
    <aside className="d-list-sidebar">
      <SidebarHeader activeCount={activeCount} onReset={onReset} />

      {specs && specs.length > 0 ? (
        specs.map((spec) => (
          <FilterSection key={spec.key} spec={spec} value={value[spec.key]} onChange={(next) => updateField(spec.key, next)} />
        ))
      ) : (
        <div className="d-list-sidebar-empty">목적을 선택하면 세부 필터가 표시됩니다.</div>
      )}
    </aside>
  );
}

// 사이드바 상단 헤더 — "필터" + 활성 개수 뱃지 + 초기화
function SidebarHeader({ activeCount, onReset }) {
  return (
    <div className="d-list-sidebar-header">
      <div className="d-list-sidebar-title">
        필터
        {activeCount > 0 && <span className="d-list-sidebar-count">{activeCount}</span>}
      </div>
      {activeCount > 0 && (
        <button type="button" className="d-list-sidebar-reset" onClick={onReset}>
          <RotateCcw size={12} aria-hidden />
          <span>초기화</span>
        </button>
      )}
    </div>
  );
}

// 세부 카테고리 — 라디오 리스트 (전체 + 각 카테고리)
function SubCategorySection({ subCategories, value, onChange }) {
  return (
    <div className="d-list-filter-section">
      <div className="d-list-filter-section-label">세부 카테고리</div>
      <div className="d-list-radio-list">
        <RadioRow label="전체" checked={value === 'all'} onChange={() => onChange('all')} />
        {subCategories.map((c) => (
          <RadioRow key={c} label={c} checked={value === c} onChange={() => onChange(c)} />
        ))}
      </div>
    </div>
  );
}

// 단일 필터 섹션 (label + 타입별 컨트롤)
// - range는 단위를 인풋 내부 suffix로 표시하므로 섹션 라벨에서는 괄호 단위 제거
function FilterSection({ spec, value, onChange }) {
  const typeClass = spec.type !== 'range' ? ` d-list-filter-section--${spec.type}` : '';
  const label = spec.type === 'range' ? splitLabelUnit(spec.label).name : spec.label;
  return (
    <div className={`d-list-filter-section${typeClass}`}>
      <FilterLabel label={label} note={spec.note} />
      {renderControl(spec, value, onChange)}
    </div>
  );
}

function FilterLabel({ label, note }) {
  return (
    <div className="d-list-filter-section-label">
      <span>{label}</span>
      {note && (
        <button type="button" className="d-list-filter-note-wrap" aria-label={note}>
          <AlertTriangle size={13} aria-hidden />
          <span className="d-list-filter-note-bubble" role="tooltip">{note}</span>
        </button>
      )}
    </div>
  );
}

// 타입별 컨트롤 분기
function renderControl(spec, v, onChange) {
  if (spec.type === 'range') return <RangeControl spec={spec} value={v} onChange={onChange} />;
  if (spec.type === 'tristate') return <TriStateControl spec={spec} value={v ?? {}} onChange={onChange} />;
  if (spec.type === 'exclude_only') return <ExcludeOnlyControl spec={spec} value={v ?? {}} onChange={onChange} />;
  if (spec.type === 'bool') return <BoolToggle value={!!v} onChange={onChange} />;
  return null;
}

// 라디오 한 줄
function RadioRow({ label, checked, onChange }) {
  return (
    <label className={`d-list-radio-row ${checked ? 'is-active' : ''}`}>
      <span className={`d-list-radio-dot ${checked ? 'is-active' : ''}`} aria-hidden />
      <input type="radio" checked={checked} onChange={onChange} className="sr-only" />
      <span className="d-list-radio-label">{label}</span>
    </label>
  );
}

// range: min/max number input — 단위는 인풋 내부 우측 suffix로 표시
function RangeControl({ spec, value, onChange }) {
  const min = value?.min ?? '';
  const max = value?.max ?? '';
  const { unit } = splitLabelUnit(spec.label);
  const handleMin = (e) => onChange({ ...value, min: e.target.value === '' ? undefined : Number(e.target.value) });
  const handleMax = (e) => onChange({ ...value, max: e.target.value === '' ? undefined : Number(e.target.value) });
  return (
    <div className="d-list-range">
      <div className="d-list-range-field">
        <input
          type="number"
          className="d-list-range-input"
          placeholder="0"
          value={min}
          onChange={handleMin}
          aria-label={`${spec.label} 최솟값`}
        />
        {unit && <span className="d-list-range-unit" aria-hidden="true">{unit}</span>}
      </div>
      <span className="d-list-range-sep">~</span>
      <div className="d-list-range-field">
        <input
          type="number"
          className="d-list-range-input"
          placeholder="0"
          value={max}
          onChange={handleMax}
          aria-label={`${spec.label} 최댓값`}
        />
        {unit && <span className="d-list-range-unit" aria-hidden="true">{unit}</span>}
      </div>
    </div>
  );
}

// tristate: 옵션별 포함(체크)/제외(X)/중립 3상태
function TriStateControl({ spec, value, onChange }) {
  const setState = (option, nextState) => {
    const next = { ...value };
    // 같은 버튼 재클릭 시 해제 (중립으로)
    if (next[option] === nextState) {
      delete next[option];
    } else {
      next[option] = nextState;
    }
    onChange(next);
  };

  return (
    <div className="d-list-tristate">
      {spec.options.map((opt) => (
        <TriStateRow key={opt} option={opt} state={value[opt]} onSet={(s) => setState(opt, s)} />
      ))}
    </div>
  );
}

// tristate 단일 행 (옵션명 + 포함/제외 버튼)
function TriStateRow({ option, state, onSet }) {
  return (
    <div className="d-list-tristate-row">
      <span className="d-list-tristate-label">{option}</span>
      <div className="d-list-tristate-btns">
        <button
          type="button"
          className={`d-list-tristate-btn d-list-tristate-include ${state === 'include' ? 'is-active' : ''}`}
          onClick={() => onSet('include')}
          aria-label={`${option} 포함`}
          aria-pressed={state === 'include'}
          title="포함"
        >
          <Check size={14} aria-hidden />
        </button>
        <button
          type="button"
          className={`d-list-tristate-btn d-list-tristate-exclude ${state === 'exclude' ? 'is-active' : ''}`}
          onClick={() => onSet('exclude')}
          aria-label={`${option} 제외`}
          aria-pressed={state === 'exclude'}
          title="제외"
        >
          <X size={14} aria-hidden />
        </button>
      </div>
    </div>
  );
}

// exclude_only: X 버튼만 (제외 전용)
function ExcludeOnlyControl({ spec, value, onChange }) {
  const toggle = (option) => {
    const next = { ...value };
    if (next[option] === 'exclude') {
      delete next[option];
    } else {
      next[option] = 'exclude';
    }
    onChange(next);
  };

  return (
    <div className="d-list-tristate">
      {spec.options.map((opt) => (
        <div key={opt} className="d-list-tristate-row">
          <span className="d-list-tristate-label">{opt}</span>
          <div className="d-list-tristate-btns">
            <button
              type="button"
              className={`d-list-tristate-btn d-list-tristate-exclude ${value[opt] === 'exclude' ? 'is-active' : ''}`}
              onClick={() => toggle(opt)}
              aria-label={`${opt} 제외`}
              aria-pressed={value[opt] === 'exclude'}
              title="제외"
            >
              <X size={14} aria-hidden />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// bool: 토글 스위치
function BoolToggle({ value, onChange }) {
  return (
    <label className="d-list-bool">
      <span className={`d-list-bool-switch ${value ? 'is-on' : ''}`} aria-hidden>
        <span className="d-list-bool-thumb" />
      </span>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span className="d-list-bool-text">{value ? '적용 중' : '미적용'}</span>
    </label>
  );
}
