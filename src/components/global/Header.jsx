import { Link, useLocation } from 'react-router-dom';
import PurposeToggle from './PurposeToggle.jsx';

// 전역 헤더
// - 로고: 클릭 시 메인으로
// - 목적 토글: 메인(/)에는 본문에 목적 그리드가 있으므로 숨김
//   그 외 페이지에서는 어디서든 목적 변경이 가능하도록 노출
export default function Header() {
  const { pathname } = useLocation();
  const showPurposeToggle = pathname !== '/';
  return (
    <header className="header">
      <Link to="/" className="header-logo">다분해</Link>
      {showPurposeToggle && <PurposeToggle />}
    </header>
  );
}
