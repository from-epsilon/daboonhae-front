// 모바일 정렬 액션 시트
// - 단순 라디오 리스트 (옵션 1탭으로 선택 + 자동 닫힘)
import { Sheet } from './Sheet.jsx';
import { IconCheck } from '../../ds/Icons.jsx';

// 우리 데이터는 가격 없으므로 추천순/이름순 두 가지 + 핵심 영양소
export const SORT_OPTIONS = [
  { key: 'ranking', label: '추천순 (점수 높은 순)' },
  { key: 'name', label: '이름순 (가나다)' },
  { key: 'calories_asc', label: '칼로리 낮은 순' },
  { key: 'protein_desc', label: '단백질 많은 순' },
];

// 단일 옵션 행 (Radio + Check)
function SortOptionRow({ option, active, onPick }) {
  return (
    <button
      type="button"
      onClick={() => onPick(option.key)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 4px',
        background: 'transparent',
        border: 'none',
        borderBottom: '1px solid var(--border-tertiary)',
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        fontSize: 15,
        fontWeight: active ? 700 : 500,
        color: active ? 'var(--green-700)' : 'var(--text-primary)',
        textAlign: 'left',
      }}
    >
      <span>{option.label}</span>
      {active && (
        <span style={{ color: 'var(--green-500)', display: 'flex' }}>
          <IconCheck size={18} stroke={2.5} />
        </span>
      )}
    </button>
  );
}

export function SortSheet({ open, value, onChange, onClose }) {
  // 정렬 키 선택 → 변경 + 닫기
  const handlePick = (key) => {
    onChange(key);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="정렬" height="45vh">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {SORT_OPTIONS.map((opt) => (
          <SortOptionRow
            key={opt.key}
            option={opt}
            active={opt.key === value}
            onPick={handlePick}
          />
        ))}
      </div>
    </Sheet>
  );
}

// 정렬 키 → 라벨 매핑 (액션바 표시용)
export function getSortLabel(key) {
  return SORT_OPTIONS.find((o) => o.key === key)?.label ?? '추천순';
}

// 정렬 키 → 짧은 표기 (액션바 한정)
export function getSortShortLabel(key) {
  switch (key) {
    case 'ranking': return '추천순';
    case 'name': return '이름순';
    case 'calories_asc': return '저칼로리순';
    case 'protein_desc': return '고단백순';
    default: return '추천순';
  }
}
