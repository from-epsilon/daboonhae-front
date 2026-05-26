import { Link, useLocation } from 'react-router-dom';
import PurposeToggle from './PurposeToggle.jsx';

// 전역 헤더
// - 로고: 클릭 시 메인으로
// - 목적 토글 숨김 조건:
//   · 메인(/) — 본문에 목적 그리드 있음
//   · /list — 페이지 상단에 TopTabs(목적 탭)가 있어 중복 방지
//   · 그 외 페이지(상세/비교)에서는 어디서든 목적 변경이 가능하도록 노출
// - 메인페이지(/) 에서는 .header--bare 모디파이어로 박스 톤 제거 (배경/보더/sticky 해제)
//   → 로고만 페이지 콘텐츠 위에 자연스럽게 떠 있는 느낌
export default function Header() {
  const { pathname } = useLocation();
  const isMain = pathname === '/';
  const hideToggle = isMain || pathname.startsWith('/list');
  const className = `header${isMain ? ' header--bare' : ''}`;
  return (
    <header className={className}>
      <Link to="/" className="header-logo">다분해</Link>
      {!hideToggle && <PurposeToggle />}
    </header>
  );
}
