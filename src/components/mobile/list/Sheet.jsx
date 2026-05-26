// 모바일 공용 Bottom Sheet
// - props:
//   - open: boolean
//   - onClose: () => void
//   - title?: string
//   - height?: number | string  (기본 75vh)
//   - children, footer?: ReactNode
// - 어두운 오버레이 + 하단에서 슬라이드업 + 우상단 X 닫기 + 오버레이 클릭으로 닫기
// - 디자인: 라운드 16px 상단, 4px hairline 디바이더, 다분해 톤
import { IconClose } from '../../ds/Icons.jsx';

// 오버레이(어두운 백드롭)
function SheetBackdrop({ onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,.45)',
      }}
    />
  );
}

// 상단 핸들 + 타이틀 + 닫기 버튼
function SheetHeader({ title, onClose }) {
  return (
    <div style={{ flexShrink: 0 }}>
      {/* swipe 힌트용 핸들 (단순 시각요소) */}
      <div
        style={{
          width: 36,
          height: 4,
          background: 'var(--gray-300)',
          borderRadius: 999,
          margin: '8px auto 4px',
        }}
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px 12px',
          borderBottom: '1px solid var(--border-tertiary)',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 16,
            color: 'var(--text-primary)',
          }}
        >
          {title}
        </div>
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            padding: 4,
            cursor: 'pointer',
            color: 'var(--text-primary)',
            display: 'flex',
          }}
        >
          <IconClose size={20} />
        </button>
      </div>
    </div>
  );
}

export function Sheet({ open, onClose, title, height = '75vh', children, footer }) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <SheetBackdrop onClose={onClose} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'white',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: height,
          height,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <SheetHeader title={title} onClose={onClose} />
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 16px 16px',
          }}
        >
          {children}
        </div>
        {footer && (
          <div
            style={{
              flexShrink: 0,
              borderTop: '1px solid var(--border-tertiary)',
              padding: '10px 16px calc(env(safe-area-inset-bottom, 0px) + 12px)',
              background: 'white',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
