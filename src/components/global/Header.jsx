import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { IconSearch } from '../ds/Icons.jsx';

const HIDE_SEARCH_PATHS = ['/about', '/faq', '/contact', '/terms', '/privacy'];

// 다분해 심볼 마크 (배너에서 헤더로 이동) — currentColor로 브랜드 그린 상속
function BrandMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 64 64" aria-hidden="true" className="header-logo-mark">
      <path d="M 32 8 A 24 24 0 1 0 56 32" fill="none" stroke="currentColor" strokeWidth="7.5" strokeLinecap="round" />
      <circle cx="49.5" cy="14.5" r="3.6" fill="currentColor" />
      <circle cx="41" cy="6.5" r="2.4" fill="currentColor" opacity="0.75" />
      <circle cx="57" cy="22" r="2" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

function HeaderSearchBar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (q) navigate(`/list?q=${encodeURIComponent(q)}`);
    else navigate('/list');
  };

  return (
    <form className="header-search" onSubmit={handleSubmit} role="search">
      <IconSearch size={16} stroke={2} />
      <input
        type="search"
        className="header-search-input"
        placeholder="제품명·브랜드·성분 검색"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="제품 검색"
      />
    </form>
  );
}

export default function Header() {
  const { pathname } = useLocation();
  const hideSearch = HIDE_SEARCH_PATHS.includes(pathname);

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="header-logo">
          <BrandMark />
          <span className="header-logo-text">
            <span className="header-logo-black">다</span>분<span className="header-logo-black">해</span>
            <span className="header-logo-dot">.</span>
          </span>
        </Link>

        {!hideSearch && <HeaderSearchBar />}

        <nav className="header-nav" aria-label="주요 메뉴">
          <Link
            to="/about"
            className={`header-about-link${pathname === '/about' ? ' is-active' : ''}`}
          >
            About us
          </Link>
        </nav>
      </div>
    </header>
  );
}
