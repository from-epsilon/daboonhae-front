// 다분해 DS 페이지네이션 — 이전/다음 + 페이지 번호 (현재 ±1, 양끝 고정, 생략은 …)
// props:
//   - page: 현재 페이지 (1-base)
//   - pageCount: 전체 페이지 수
//   - onChange: (nextPage) => void
//   - hrefForPage: (pageNum) => string (선택) — 주면 버튼 대신 <a href>로 렌더해 크롤러가 페이지를 따라갈 수 있음
//   - className: 추가 클래스 (선택)
import './Pagination.css';

// 표시할 페이지 번호 배열 생성 (생략 구간은 '…')
function buildPages(page, pageCount) {
  const WINDOW = 1; // 현재 페이지 좌우로 보여줄 개수
  const EDGE_COUNT = 3; // 시작/끝 근처에서는 최소 3개를 보여줌
  const normalizedPage = Math.min(Math.max(1, page), pageCount);
  const pages = [];
  for (let p = 1; p <= pageCount; p += 1) {
    const inStart = normalizedPage <= EDGE_COUNT && p <= EDGE_COUNT;
    const inEnd = normalizedPage >= pageCount - EDGE_COUNT + 1 && p > pageCount - EDGE_COUNT;
    const inWindow = p >= normalizedPage - WINDOW && p <= normalizedPage + WINDOW;
    if (p === 1 || p === pageCount || inStart || inEnd || inWindow) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }
  return pages;
}

export function Pagination({ page, pageCount, onChange, hrefForPage, className = '' }) {
  if (!pageCount || pageCount <= 1) return null;

  // 범위를 벗어나지 않게 이동
  const go = (next) => {
    const clamped = Math.min(Math.max(1, next), pageCount);
    if (clamped !== page) onChange(clamped);
  };

  const pages = buildPages(page, pageCount);

  // 페이지 컨트롤 — hrefForPage가 있으면 <a href>(크롤 가능), 없으면 <button>
  // 링크여도 일반 클릭은 기본 이동을 막고 SPA onChange로 처리. 새 탭(메타/Ctrl/휠)은 기본 동작 유지.
  const Control = ({ target, disabled, className: cls, ariaLabel, ariaCurrent, children }) => {
    const handleClick = (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      go(target);
    };
    if (hrefForPage && !disabled) {
      return (
        <a
          href={hrefForPage(target)}
          className={cls}
          aria-label={ariaLabel}
          aria-current={ariaCurrent}
          onClick={handleClick}
        >
          {children}
        </a>
      );
    }
    return (
      <button
        type="button"
        className={cls}
        onClick={() => go(target)}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-current={ariaCurrent}
      >
        {children}
      </button>
    );
  };

  return (
    <nav className={`ds-pagination ${className}`.trim()} aria-label="페이지 이동">
      <Control target={page - 1} disabled={page <= 1} className="ds-pagination-arrow" ariaLabel="이전 페이지">
        ‹
      </Control>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className="ds-pagination-ellipsis" aria-hidden="true">…</span>
        ) : (
          <Control
            key={p}
            target={p}
            className={`ds-pagination-num${p === page ? ' is-active' : ''}`}
            ariaCurrent={p === page ? 'page' : undefined}
          >
            {p}
          </Control>
        ),
      )}

      <Control target={page + 1} disabled={page >= pageCount} className="ds-pagination-arrow" ariaLabel="다음 페이지">
        ›
      </Control>
    </nav>
  );
}
