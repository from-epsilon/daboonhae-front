// 다분해 DS 페이지네이션 — 이전/다음 + 페이지 번호 (현재 ±1, 양끝 고정, 생략은 …)
// props:
//   - page: 현재 페이지 (1-base)
//   - pageCount: 전체 페이지 수
//   - onChange: (nextPage) => void
//   - className: 추가 클래스 (선택)
import './Pagination.css';

// 표시할 페이지 번호 배열 생성 (생략 구간은 '…')
function buildPages(page, pageCount) {
  const WINDOW = 1; // 현재 페이지 좌우로 보여줄 개수
  const pages = [];
  for (let p = 1; p <= pageCount; p += 1) {
    const inWindow = p >= page - WINDOW && p <= page + WINDOW;
    if (p === 1 || p === pageCount || inWindow) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }
  return pages;
}

export function Pagination({ page, pageCount, onChange, className = '' }) {
  if (!pageCount || pageCount <= 1) return null;

  // 범위를 벗어나지 않게 이동
  const go = (next) => {
    const clamped = Math.min(Math.max(1, next), pageCount);
    if (clamped !== page) onChange(clamped);
  };

  const pages = buildPages(page, pageCount);

  return (
    <nav className={`ds-pagination ${className}`.trim()} aria-label="페이지 이동">
      <button
        type="button"
        className="ds-pagination-arrow"
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        aria-label="이전 페이지"
      >
        ‹
      </button>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className="ds-pagination-ellipsis" aria-hidden="true">…</span>
        ) : (
          <button
            key={p}
            type="button"
            className={`ds-pagination-num${p === page ? ' is-active' : ''}`}
            aria-current={p === page ? 'page' : undefined}
            onClick={() => go(p)}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        className="ds-pagination-arrow"
        onClick={() => go(page + 1)}
        disabled={page >= pageCount}
        aria-label="다음 페이지"
      >
        ›
      </button>
    </nav>
  );
}
