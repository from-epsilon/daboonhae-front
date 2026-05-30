// Search — recent + popular ingredients/foods, results list
function Search({ navigate, addToCompare }) {
  const [query, setQuery] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const recent = ["닭가슴살", "단백질 파우더", "곤약젤리", "그릭요거트"];
  const popular = [
    { rank: 1, term: "닭가슴살" }, { rank: 2, term: "단백질 셰이크" },
    { rank: 3, term: "곤약면" }, { rank: 4, term: "그릭요거트" },
    { rank: 5, term: "두부면" }, { rank: 6, term: "프로틴바" },
    { rank: 7, term: "곤약젤리" }, { rank: 8, term: "비건 단백질" }
  ];

  const onSubmit = (e) => { e.preventDefault(); if (query.trim()) setSubmitted(true); };

  if (submitted) {
    const f = FOODS.filter(p => p.name.includes(query) || p.brand.includes(query));
    const filtered = f.length > 0 ? f : FOODS;
    return (
      <>
        <div style={{ height: 52, background: "white", display: "flex", alignItems: "center", padding: "0 12px", gap: 8, borderBottom: "1px solid var(--border-tertiary)", flexShrink: 0 }}>
          <div onClick={() => setSubmitted(false)} style={{ cursor: "pointer" }}><IconBack /></div>
          <div style={{ flex: 1, background: "var(--gray-100)", borderRadius: 999, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
            <IconSearch size={16} />
            <input value={query} onChange={e => setQuery(e.target.value)} style={{ flex: 1, background: "transparent", border: 0, outline: 0, fontFamily: "var(--font-body)", fontSize: 14 }}/>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", background: "white" }}>
          <div style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-secondary)" }}>
            "<b style={{ color: "var(--text-primary)" }}>{query}</b>" 검색결과 <b style={{ color: "var(--green-500)", fontFamily: "var(--font-numeric)" }}>{filtered.length}</b>건
          </div>
          <div style={{ display: "flex", gap: 6, padding: "0 16px 12px", overflowX: "auto" }}>
            <Chip active>전체</Chip><Chip>고단백</Chip><Chip>저칼로리</Chip><Chip>저당</Chip><Chip>비건</Chip>
          </div>
          <div style={{ padding: "0 16px 16px" }}>
            {filtered.map(p => <FoodCard key={p.id} food={p} onClick={() => navigate("detail", p)} onCompare={addToCompare} layout="list" />)}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div style={{ height: 52, background: "white", display: "flex", alignItems: "center", padding: "0 12px", gap: 8, borderBottom: "1px solid var(--border-tertiary)", flexShrink: 0 }}>
        <div onClick={() => navigate("home")} style={{ cursor: "pointer" }}><IconBack /></div>
        <form onSubmit={onSubmit} style={{ flex: 1, background: "var(--gray-100)", borderRadius: 999, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
          <IconSearch size={16} />
          <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="성분, 브랜드, 영양소로 검색" style={{ flex: 1, background: "transparent", border: 0, outline: 0, fontFamily: "var(--font-body)", fontSize: 14 }}/>
        </form>
      </div>
      <div style={{ flex: 1, overflowY: "auto", background: "white" }}>
        <div style={{ padding: "20px 16px 12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>최근 검색어</div>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>전체 삭제</div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {recent.map((r, i) => (
              <div key={i} onClick={() => { setQuery(r); setSubmitted(true); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", border: "1px solid var(--border-tertiary)", borderRadius: 999, fontSize: 13, color: "var(--text-primary)", cursor: "pointer" }}>
                {r}<IconClose size={12}/>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 8, background: "var(--bg-off-white)" }}/>

        <div style={{ padding: "20px 16px 24px" }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 12 }}>인기 검색어</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
            {popular.map(p => (
              <div key={p.rank} onClick={() => { setQuery(p.term); setSubmitted(true); }} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, cursor: "pointer" }}>
                <span style={{ fontFamily: "var(--font-numeric)", fontWeight: 700, color: p.rank <= 3 ? "var(--green-500)" : "var(--text-primary)", width: 14 }}>{p.rank}</span>
                <span style={{ flex: 1, color: "var(--text-primary)" }}>{p.term}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
window.Search = Search;
