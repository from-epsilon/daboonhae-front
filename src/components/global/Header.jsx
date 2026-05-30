import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { IconInfo, IconSearch } from '../ds/Icons.jsx';

const HIDE_SEARCH_PATHS = ['/about', '/faq', '/contact'];

const MENU_ITEMS = [
  { to: '/about', label: '다분해 소개', Icon: IconInfo },
];

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
  const [menuOpen, setMenuOpen] = useState(false);
  const hideSearch = HIDE_SEARCH_PATHS.includes(pathname);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="header-logo">
          <span className="header-logo-black">다</span>분<span className="header-logo-black">해</span>
          <span className="header-logo-dot">.</span>
        </Link>

        {!hideSearch && <HeaderSearchBar />}

        <div className="header-menu">
          <button
            type="button"
            className={`header-menu-btn${menuOpen ? ' is-open' : ''}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="메뉴"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            {menuOpen ? <X size={20} strokeWidth={2.2} /> : <Menu size={20} strokeWidth={2.2} />}
          </button>

          {menuOpen && (
            <nav className="header-menu-dropdown" aria-label="주요 메뉴">
              {MENU_ITEMS.map(({ to, label, Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`header-menu-item${pathname === to ? ' is-active' : ''}`}
                >
                  <Icon size={17} stroke={2} />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
