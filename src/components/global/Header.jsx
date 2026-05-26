import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { IconSearch } from '../ds/Icons.jsx';
import { Menu, X, MessageCircle, Info, HelpCircle } from 'lucide-react';

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
        aria-label="식품 검색"
      />
    </form>
  );
}

const MENU_ITEMS = [
  { label: '소개', icon: Info, href: '#about' },
  { label: '자주 묻는 질문', icon: HelpCircle, href: '#faq' },
  { label: '문의하기', icon: MessageCircle, href: 'mailto:tpgus0510@gmail.com' },
];

function HeaderMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div className="header-menu" ref={ref}>
      <button
        type="button"
        className="header-menu-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label="메뉴"
        aria-expanded={open}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      {open && (
        <div className="header-menu-dropdown">
          {MENU_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="header-menu-item"
              onClick={() => setOpen(false)}
            >
              <item.icon size={16} />
              <span>{item.label}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="header-logo"><span className="header-logo-black">다</span>분<span className="header-logo-black">해</span><span className="header-logo-dot">.</span></Link>
        <HeaderSearchBar />
        <HeaderMenu />
      </div>
    </header>
  );
}
