// 다분해 DS AppBar (모바일 상단바, 52px)
// props:
//   - onSearch: 검색 박스 클릭 핸들러
//   - onCompare: 비교함 아이콘 클릭 핸들러
//   - compareCount: 비교함 담긴 개수 (배지 표시용)
//   - onLogo?: 로고(브랜드) 클릭 핸들러 (홈 이동용)
//   - title?: 표시할 페이지 제목 (전달 시 로고+검색박스 자리에 텍스트만 표시)
//   - onBack?: 좌측 IconBack 클릭 핸들러 (디테일 페이지용)
// 원본 DS 변경점:
//   - IconBell 제거 (알림 기능 없음)
//   - 우측 IconCompare + 카운트 배지로 교체
//   - onBack/title 모드 추가 (디테일/서브 페이지 대응)
import { useNavigate } from 'react-router-dom';
import { IconSearch, IconCompare, IconBack } from './Icons.jsx';

// 비교함 카운트 배지 (compareCount > 0 일 때만)
function CompareBadge({ count }) {
  if (!count || count <= 0) return null;
  return (
    <span
      style={{
        position: 'absolute',
        top: -4,
        right: -6,
        background: 'var(--red-500)',
        color: 'white',
        fontFamily: 'var(--font-numeric)',
        fontSize: 9,
        fontWeight: 700,
        padding: '0 5px',
        borderRadius: 999,
        minWidth: 14,
        textAlign: 'center',
        lineHeight: '14px',
      }}
    >
      {count}
    </span>
  );
}

// 다분해 로고 SVG (원본 DS 그대로) — CSS 변수 미정의 대비해 brand 그린 hex 폴백
function BrandLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 64 64" aria-hidden="true">
      <path
        d="M 32 8 A 24 24 0 1 0 56 32"
        fill="none"
        stroke="var(--green-500)"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <circle cx="49.5" cy="14.5" r="4" fill="var(--green-500)" />
      <circle cx="41" cy="6.5" r="2.6" fill="var(--green-500)" opacity=".75" />
      <circle cx="57" cy="22" r="2.2" fill="var(--green-500)" opacity=".5" />
    </svg>
  );
}

export function AppBar({ onSearch, onCompare, compareCount = 0, onLogo, title, onBack }) {
  const isSubPage = typeof onBack === 'function' || !!title;
  const navigate = useNavigate();
  // 로고 클릭 → onLogo 우선, 없으면 기본적으로 홈 이동 (데스크톱 포함 전역 동작)
  const handleLogo = () => (typeof onLogo === 'function' ? onLogo() : navigate('/'));

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        height: 52,
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 12,
        borderBottom: '1px solid var(--border-tertiary)',
        flexShrink: 0,
      }}
    >
      {isSubPage ? (
        // 서브 페이지 모드: Back + Title (중앙/좌측)
        <>
          <button
            type="button"
            onClick={() => typeof onBack === 'function' && onBack()}
            aria-label="뒤로 가기"
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <IconBack />
          </button>
          <div
            style={{
              flex: 1,
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 16,
              color: 'var(--text-primary)',
              textAlign: 'center',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </div>
          {/* 우측 비교함 아이콘 (좌측 Back과 대칭 균형) */}
          <button
            type="button"
            onClick={() => typeof onCompare === 'function' && onCompare()}
            aria-label="비교함"
            style={{
              position: 'relative',
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <IconCompare />
            <CompareBadge count={compareCount} />
          </button>
        </>
      ) : (
        // 메인 모드: 로고 + 검색박스 + 비교함
        <>
          {/* 로고 클릭 시 홈 이동 */}
          <button
            type="button"
            onClick={handleLogo}
            aria-label="홈으로 이동"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
            }}
          >
            <BrandLogo />
            <div
              style={{
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 20,
                letterSpacing: '-.03em',
              }}
            >
              다분해
            </div>
          </button>
          <div
            onClick={() => typeof onSearch === 'function' && onSearch()}
            style={{
              flex: 1,
              minWidth: 0,
              background: 'var(--gray-100)',
              borderRadius: 999,
              padding: '8px 14px',
              fontSize: 13,
              color: 'var(--text-tertiary)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
            }}
          >
            <IconSearch size={16} style={{ flexShrink: 0 }} />
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              성분·브랜드·영양소 검색
            </span>
          </div>
          <button
            type="button"
            onClick={() => typeof onCompare === 'function' && onCompare()}
            aria-label="비교함"
            style={{
              position: 'relative',
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <IconCompare />
            <CompareBadge count={compareCount} />
          </button>
        </>
      )}
    </div>
  );
}
