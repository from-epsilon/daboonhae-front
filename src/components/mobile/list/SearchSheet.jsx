// 모바일 검색 입력 시트
// - AppBar의 검색 박스 탭 시 열림
// - 입력 → 엔터/제출 시 onSubmit(query) 호출 (부모가 라우팅 처리)
// - 검색어가 있으면 우측에 X 로 입력 초기화
import { useEffect, useRef, useState } from 'react';
import { Sheet } from './Sheet.jsx';
import { IconSearch, IconClose } from '../../ds/Icons.jsx';

// 입력창 내부 액션(X 버튼)
function ClearButton({ onClear, visible }) {
  if (!visible) return null;
  return (
    <button
      type="button"
      onClick={onClear}
      aria-label="입력 지우기"
      style={{
        background: 'transparent',
        border: 'none',
        padding: 4,
        cursor: 'pointer',
        color: 'var(--text-tertiary)',
        display: 'flex',
      }}
    >
      <IconClose size={16} />
    </button>
  );
}

// 입력 필드 컴포넌트 — SRP 분리
function SearchInputField({ value, onChange, onClear, inputRef }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'var(--gray-100)',
        borderRadius: 999,
        padding: '10px 14px',
      }}
    >
      <IconSearch size={16} />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="성분, 브랜드, 영양소로 검색"
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontSize: 14,
          fontFamily: 'var(--font-body)',
          color: 'var(--text-primary)',
        }}
      />
      <ClearButton visible={value.length > 0} onClear={onClear} />
    </div>
  );
}

// 인기/추천 키워드 빠른 검색 칩
const QUICK_TERMS = ['프로틴', '닭가슴살', '제로 음료', '곤약', '쉐이크'];

function QuickTerms({ onPick }) {
  return (
    <div style={{ marginTop: 20 }}>
      <div
        style={{
          fontSize: 12,
          color: 'var(--text-tertiary)',
          fontWeight: 500,
          marginBottom: 10,
          letterSpacing: '.02em',
        }}
      >
        추천 검색어
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {QUICK_TERMS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onPick(t)}
            style={{
              fontSize: 13,
              fontWeight: 500,
              padding: '7px 14px',
              borderRadius: 999,
              border: '1px solid var(--border-tertiary)',
              background: 'white',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SearchSheet({ open, initialQuery = '', onClose, onSubmit }) {
  const [value, setValue] = useState(initialQuery);
  const inputRef = useRef(null);

  // 시트 열릴 때마다 현재 q로 동기화 + 포커스
  useEffect(() => {
    if (open) {
      setValue(initialQuery);
      // 다음 프레임에 포커스 (시트 마운트 완료 후)
      const id = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
  }, [open, initialQuery]);

  // 제출 처리 (엔터 또는 빠른검색 클릭)
  const submit = (q) => {
    const trimmed = (q ?? value).trim();
    onSubmit(trimmed);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="검색" height="60vh">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <SearchInputField
          value={value}
          onChange={setValue}
          onClear={() => setValue('')}
          inputRef={inputRef}
        />
      </form>
      <QuickTerms onPick={(t) => submit(t)} />
    </Sheet>
  );
}
