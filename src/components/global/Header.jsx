import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconSearch } from '../ds/Icons.jsx';

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

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="header-logo"><span className="header-logo-black">다</span>분<span className="header-logo-black">해</span><span className="header-logo-dot">.</span></Link>
        <HeaderSearchBar />
      </div>
    </header>
  );
}
