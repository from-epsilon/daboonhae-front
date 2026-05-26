import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSuggestions } from '../../data/searchIndex.js';
import { useProducts } from '../../store/ProductsContext.jsx';

// 메인 검색바
// - 자동완성 드롭다운 + 키보드 탐색(↑↓ Enter Esc)
// - 후보 선택 → 상세 페이지로, 빈 선택 + Enter → 리스트 페이지(검색 결과)로
// - aria-activedescendant로 스크린리더에 현재 강조 항목 알림
export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listboxId = 'search-suggestions-listbox';
  const navigate = useNavigate();
  const blurTimerRef = useRef(null);
  const { products } = useProducts();

  const suggestions = useMemo(() => (query ? getSuggestions(query, products, 8) : []), [query, products]);
  const showDropdown = focused && query.trim().length > 0;

  // 입력이 바뀌거나 후보가 줄면 activeIndex가 범위를 벗어날 수 있으므로 리셋
  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  // 컴포넌트 언마운트 시 blur 타이머 누수 방지
  useEffect(() => () => clearTimeout(blurTimerRef.current), []);

  const goToList = () => {
    const q = query.trim();
    if (!q) return;
    navigate(`/list?q=${encodeURIComponent(q)}`);
  };

  const goToProduct = (id) => navigate(`/product/${id}`);

  // Enter: activeIndex가 후보를 가리키면 그 제품으로, 아니면 리스트로
  const handleSubmit = () => {
    if (activeIndex >= 0 && activeIndex < suggestions.length) {
      goToProduct(suggestions[activeIndex].id);
    } else {
      goToList();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!showDropdown || suggestions.length === 0) return;
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!showDropdown || suggestions.length === 0) return;
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      setFocused(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div className="search-bar">
      <input
        className="search-input"
        type="text"
        value={query}
        placeholder="제품명, 브랜드, 성분으로 검색 (예: whey, 닭가슴살, 제로)"
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          showDropdown && activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined
        }
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          clearTimeout(blurTimerRef.current);
          setFocused(true);
        }}
        onBlur={() => {
          // 후보 클릭이 먼저 잡히도록 짧게 지연
          blurTimerRef.current = setTimeout(() => setFocused(false), 120);
        }}
        onKeyDown={handleKeyDown}
      />
      <button className="search-submit" onClick={goToList}>검색</button>

      {showDropdown && (
        <ul className="search-suggestions" id={listboxId} role="listbox">
          {suggestions.length === 0 && (
            <li className="search-suggestion-empty">일치하는 결과가 없습니다.</li>
          )}
          {suggestions.map((s, i) => (
            <li
              key={s.id}
              id={`${listboxId}-opt-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              className={`search-suggestion ${i === activeIndex ? 'is-active' : ''}`}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseDown={() => goToProduct(s.id)}
            >
              <span className="search-suggestion-name">{s.name}</span>
              <span className="search-suggestion-brand">{s.brand}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
