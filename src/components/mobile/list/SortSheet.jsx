// 모바일 정렬 액션 시트
// - 단순 라디오 리스트 (옵션 1탭으로 선택 + 자동 닫힘)
// - 정렬 옵션은 카테고리별로 다름(단백질 음료=단백질/EAA/BCAA 전용) → listSort에서 일괄 관리
import { Sheet } from './Sheet.jsx';
import { IconCheck } from '../../ds/Icons.jsx';
import { getSortOptions, getSortLabel, getSortShortLabel } from '../../../data/listSort.js';

// 액션바 등에서 재사용하도록 라벨 헬퍼를 그대로 재노출
export { getSortLabel, getSortShortLabel };

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
        fontWeight: 500,
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

export function SortSheet({ open, value, onChange, onClose, category }) {
  const options = getSortOptions(category);
  // 현재 선택값이 옵션에 없으면(카테고리 전환 직후) 첫 옵션을 활성으로 표시
  const activeKey = options.some((o) => o.key === value) ? value : options[0].key;

  // 정렬 키 선택 → 변경 + 닫기
  const handlePick = (key) => {
    onChange(key);
    onClose();
  };

  // 옵션이 많은 카테고리(단백질 음료 9종)는 시트를 더 높게
  const sheetHeight = options.length > 6 ? '72vh' : '45vh';

  return (
    <Sheet open={open} onClose={onClose} title="정렬" height={sheetHeight}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {options.map((opt) => (
          <SortOptionRow
            key={opt.key}
            option={opt}
            active={opt.key === activeKey}
            onPick={handlePick}
          />
        ))}
      </div>
    </Sheet>
  );
}
