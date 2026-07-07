// 모바일 필터 시트
// - purpose.filters 스펙(range / tristate / single / bool)에 따라 동적 렌더링
// - 내부 임시 상태(draft)에 변경 누적 → 하단 '적용' 클릭 시에만 부모 onApply 호출
// - '초기화'는 draft만 비움 (적용 안 누르면 외부 상태 유지)
import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Sheet } from './Sheet.jsx';
import { Button } from '../../ds/Button.jsx';
import { IconCheck, IconClose } from '../../ds/Icons.jsx';

// 활성 필터 개수 계산 (FilterSheet 외부에서도 사용)
export function countActiveFilters(specs, state) {
  if (!specs || !state) return 0;
  let n = 0;
  for (const spec of specs) {
    const v = state[spec.key];
    if (v === undefined || v === null) continue;
    if (spec.type === 'range') {
      // min 또는 max 가 지정되어 있어야 활성
      if (v.min !== undefined || v.max !== undefined) n += 1;
    } else if (spec.type === 'tristate' || spec.type === 'exclude_only') {
      // include/exclude 가 하나라도 있어야 활성
      const has = Object.values(v).some((s) => s === 'include' || s === 'exclude');
      if (has) n += 1;
    } else if (spec.type === 'single') {
      if (v) n += 1;
    } else if (spec.type === 'bool') {
      if (v === true) n += 1;
    }
  }
  return n;
}

// ============================================================ Range 필터
// 단순 두 개 number input (min ~ max) + 슬라이더 대신 칩 프리셋 ('전체' / '~half' / '~max')
function FilterRange({ spec, value, onChange }) {
  const min = value?.min;
  const max = value?.max;

  // 미리 정의된 빠른 선택 칩
  const presets = useMemo(() => {
    const half = Math.round(spec.max / 2);
    return [
      { label: '전체', min: undefined, max: undefined },
      { label: `~${half}`, min: undefined, max: half },
      { label: `~${spec.max}`, min: undefined, max: spec.max },
    ];
  }, [spec.max]);

  // input 변경 처리 (빈 문자열 → undefined)
  const handleInput = (field, raw) => {
    const next = { ...(value ?? {}) };
    if (raw === '' || raw === null) {
      delete next[field];
    } else {
      const n = Number(raw);
      if (!Number.isNaN(n)) next[field] = n;
    }
    onChange(Object.keys(next).length === 0 ? undefined : next);
  };

  // 프리셋 칩 클릭
  const applyPreset = (p) => {
    if (p.min === undefined && p.max === undefined) {
      onChange(undefined);
      return;
    }
    onChange({ min: p.min, max: p.max });
  };

  // 프리셋 active 판단
  const isPresetActive = (p) =>
    (p.min === min || (p.min === undefined && min === undefined)) &&
    (p.max === max || (p.max === undefined && max === undefined));

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        {presets.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => applyPreset(p)}
            style={{
              fontSize: 12,
              fontWeight: 500,
              padding: '6px 12px',
              borderRadius: 999,
              border: '1px solid',
              borderColor: isPresetActive(p) ? 'var(--gray-900)' : 'var(--border-tertiary)',
              background: isPresetActive(p) ? 'var(--gray-900)' : 'white',
              color: isPresetActive(p) ? 'white' : 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="m-filter-range">
        <input
          type="number"
          value={min ?? ''}
          min={spec.min}
          max={spec.max}
          placeholder={String(spec.min)}
          onChange={(e) => handleInput('min', e.target.value)}
          className="m-filter-range-input m-filter-range-input--min"
          aria-label={`${spec.label} 최솟값`}
        />
        <span className="m-filter-range-sep">~</span>
        <input
          type="number"
          value={max ?? ''}
          min={spec.min}
          max={spec.max}
          placeholder={String(spec.max)}
          onChange={(e) => handleInput('max', e.target.value)}
          className="m-filter-range-input"
          aria-label={`${spec.label} 최댓값`}
        />
      </div>
    </div>
  );
}

// ============================================================ Tristate 필터
// 옵션별로 3상태 토글: neutral(없음) → include(체크) → exclude(X)
// 모바일 단순화: 세 개 토글 버튼(전체/포함/제외)이 아니라
//   - 1탭: 칩 선택 = 포함 (녹색)
//   - 2탭: 제외 (빨강)
//   - 3탭: 해제
function FilterTristate({ spec, value, onChange }) {
  // 다음 상태 계산: neutral → include → exclude → neutral
  const nextState = (cur) => {
    if (!cur) return 'include';
    if (cur === 'include') return 'exclude';
    return undefined; // 해제
  };

  // 옵션 클릭 → 상태 변경
  const handleClick = (option) => {
    const next = { ...(value ?? {}) };
    const ns = nextState(next[option]);
    if (ns === undefined) delete next[option];
    else next[option] = ns;
    onChange(Object.keys(next).length === 0 ? undefined : next);
  };

  return (
    <div>
      {/* 작은 안내 (1탭 포함, 한 번 더 제외, 한 번 더 해제) */}
      <div
        style={{
          fontSize: 11,
          color: 'var(--text-tertiary)',
          marginBottom: 8,
        }}
      >
        탭하면 포함, 한 번 더 탭하면 제외
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {spec.options.map((opt) => {
          const state = value?.[opt];
          return (
            <TristateChip
              key={opt}
              label={opt}
              state={state}
              onClick={() => handleClick(opt)}
            />
          );
        })}
      </div>
    </div>
  );
}

// 3상태 칩 (시각적으로 구분)
function TristateChip({ label, state, onClick }) {
  // state: undefined | 'include' | 'exclude'
  let style = {
    fontSize: 13,
    fontWeight: 500,
    padding: '7px 12px',
    borderRadius: 999,
    border: '1px solid var(--border-tertiary)',
    background: 'white',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontFamily: 'var(--font-body)',
    whiteSpace: 'nowrap',
  };
  let prefix = null;
  if (state === 'include') {
    style = {
      ...style,
      background: 'var(--green-50)',
      color: 'var(--green-700)',
      borderColor: 'var(--green-500)',
    };
    prefix = <IconCheck size={12} stroke={2.5} />;
  } else if (state === 'exclude') {
    style = {
      ...style,
      background: 'var(--red-50)',
      color: 'var(--red-700)',
      borderColor: 'var(--red-500)',
      textDecoration: 'line-through',
    };
    prefix = <IconClose size={12} stroke={2.5} />;
  }
  return (
    <button type="button" onClick={onClick} style={style}>
      {prefix}
      {label}
    </button>
  );
}

// ============================================================ Single 필터
// 옵션 중 하나만 드롭다운으로 선택
function FilterSingle({ spec, value, onChange }) {
  return (
    <select
      className="m-filter-single-select"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || undefined)}
      aria-label={spec.label}
      style={{
        width: '100%',
        minHeight: 44,
        padding: '0 36px 0 12px',
        borderRadius: 8,
        border: '1px solid var(--border-tertiary)',
        background: 'white',
        color: value ? 'var(--text-primary)' : 'var(--text-tertiary)',
        fontFamily: 'var(--font-body)',
        fontSize: 16,
        fontWeight: 500,
      }}
    >
      <option value="">전체</option>
      {spec.options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}

// ============================================================ Exclude-only 필터
function FilterExcludeOnly({ spec, value, onChange }) {
  const handleClick = (option) => {
    const next = { ...(value ?? {}) };
    if (next[option] === 'exclude') delete next[option];
    else next[option] = 'exclude';
    onChange(Object.keys(next).length === 0 ? undefined : next);
  };

  return (
    <div>
      <div
        style={{
          fontSize: 11,
          color: 'var(--text-tertiary)',
          marginBottom: 8,
        }}
      >
        탭하면 제외
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {spec.options.map((opt) => (
          <TristateChip
            key={opt}
            label={opt}
            state={value?.[opt]}
            onClick={() => handleClick(opt)}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================ Bool 필터
function FilterBool({ spec, value, onChange }) {
  const active = value === true;
  return (
    <button
      type="button"
      onClick={() => onChange(active ? undefined : true)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 14px',
        borderRadius: 999,
        border: '1px solid',
        borderColor: active ? 'var(--green-500)' : 'var(--border-tertiary)',
        background: active ? 'var(--green-50)' : 'white',
        color: active ? 'var(--green-700)' : 'var(--text-primary)',
        fontWeight: 500,
        fontSize: 13,
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
      }}
    >
      {active && <IconCheck size={12} stroke={2.5} />}
      {spec.label}
    </button>
  );
}

// ============================================================ 단일 그룹 (제목 + 본문)
function FilterGroup({ spec, value, onChange }) {
  // bool 은 라벨이 칩 자체에 있어서 제목 생략
  const sectionStyle = {
    padding: spec.type === 'single' ? '16px 0 18px' : '16px 0',
    borderBottom: spec.type === 'single'
      ? '1px solid var(--border-secondary)'
      : '1px solid var(--border-tertiary)',
    marginBottom: spec.type === 'single' ? 4 : 0,
  };
  return (
    <div style={sectionStyle}>
      {spec.type !== 'bool' && (
        <FilterGroupLabel label={spec.label} note={spec.note} />
      )}
      {spec.type === 'range' && <FilterRange spec={spec} value={value} onChange={onChange} />}
      {spec.type === 'tristate' && <FilterTristate spec={spec} value={value} onChange={onChange} />}
      {spec.type === 'exclude_only' && <FilterExcludeOnly spec={spec} value={value} onChange={onChange} />}
      {spec.type === 'single' && <FilterSingle spec={spec} value={value} onChange={onChange} />}
      {spec.type === 'bool' && <FilterBool spec={spec} value={value} onChange={onChange} />}
    </div>
  );
}

function FilterGroupLabel({ label, note }) {
  return (
    <div
      className="m-filter-group-label"
      style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 500,
        fontSize: 14,
        color: 'var(--text-primary)',
        marginBottom: 10,
      }}
    >
      <span>{label}</span>
      {note && (
        <button type="button" className="m-filter-note-wrap" aria-label={note}>
          <AlertTriangle size={13} aria-hidden />
          <span className="m-filter-note-bubble" role="tooltip">{note}</span>
        </button>
      )}
    </div>
  );
}

// ============================================================ Sheet 본체
export function FilterSheet({ open, specs, value, onApply, onClose }) {
  // 시트 내부 임시 상태: 시트 열릴 때마다 외부 값으로 리셋
  const [draft, setDraft] = useState(value ?? {});
  useEffect(() => {
    if (open) setDraft(value ?? {});
  }, [open, value]);

  // 단일 키 변경
  const updateKey = (key, next) => {
    setDraft((prev) => {
      const merged = { ...prev };
      if (next === undefined) delete merged[key];
      else merged[key] = next;
      return merged;
    });
  };

  // 적용/초기화
  const handleApply = () => {
    onApply(draft);
    onClose();
  };
  const handleReset = () => setDraft({});

  const activeCount = countActiveFilters(specs, draft);

  // 하단 고정 액션바: 초기화 + 적용
  const footer = (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button variant="secondary" size="md" onClick={handleReset}>
        초기화
      </Button>
      <div style={{ flex: 1 }}>
        <Button variant="brand" size="md" full onClick={handleApply}>
          {activeCount > 0 ? `${activeCount}개 필터 적용` : '적용'}
        </Button>
      </div>
    </div>
  );

  return (
    <Sheet open={open} onClose={onClose} title="필터" height="80vh" footer={footer}>
      {(!specs || specs.length === 0) ? (
        <div
          style={{
            padding: '32px 0',
            textAlign: 'center',
            color: 'var(--text-tertiary)',
            fontSize: 13,
          }}
        >
          선택한 목적에 사용할 수 있는 필터가 없습니다.
        </div>
      ) : (
        specs.map((spec) => (
          <FilterGroup
            key={spec.key}
            spec={spec}
            value={draft[spec.key]}
            onChange={(next) => updateKey(spec.key, next)}
          />
        ))
      )}
    </Sheet>
  );
}
