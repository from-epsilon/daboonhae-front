export function TopTabs({ tabs = [], active = 0, onSelect }) {
  const handleSelect = (i) => {
    if (typeof onSelect === 'function') onSelect(i);
  };

  return (
    <nav className="ds-top-tabs" aria-label="목적 필터">
      {tabs.map((t, i) => (
        <button
          key={i}
          type="button"
          onClick={() => handleSelect(i)}
          className={`ds-top-tab${i === active ? ' is-active' : ''}`}
          aria-current={i === active ? 'true' : undefined}
        >
          {t}
          {i === active && <span className="ds-top-tab-indicator" />}
        </button>
      ))}
    </nav>
  );
}
