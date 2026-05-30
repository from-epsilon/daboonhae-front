// Home — discover diet foods feed
function Home({ navigate, compareCount, addToCompare }) {
  const [topTab, setTopTab] = React.useState(0);
  const topTabs = ["전체", "고단백", "저칼로리", "저당", "비건", "글루텐프리"];
  const [filterChip, setFilterChip] = React.useState(0);
  const chips = ["인기순", "점수순", "리뷰많은순", "신상품"];

  const ranked = [...FOODS].sort((a, b) => b.score - a.score).slice(0, 4);

  return (
    <>
      <AppBar onSearch={() => navigate("search")} compareCount={compareCount} />
      <TopTabs tabs={topTabs} active={topTab} onSelect={setTopTab} />
      <div style={{ flex: 1, overflowY: "auto", background: "var(--bg-off-white)" }}>
        {/* Hero — daily pick */}
        <div style={{ height: 180, background: "linear-gradient(135deg,#00C600 0%,#018600 100%)", margin: "12px 16px 0", borderRadius: 12, padding: 20, color: "white", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: .9, fontFamily: "var(--font-body)" }}>오늘의 다분해 PICK</div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, lineHeight: 1.3 }}>"닭신 스팀 닭가슴살"<br/>다분해 점수 9.1점</div>
            <div style={{ fontSize: 12, marginTop: 8, opacity: .9 }}>단백질 24g · 105kcal · 저당 · 무첨가</div>
          </div>
          <div style={{ position: "absolute", right: -10, bottom: -10, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,.12)" }}/>
          <div style={{ position: "absolute", right: 18, top: 18, background: "rgba(255,255,255,.2)", color: "white", fontSize: 10, fontFamily: "var(--font-numeric)", padding: "3px 8px", borderRadius: 999 }}>1 / 5</div>
        </div>

        {/* Quick filters — goal-based */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", padding: "16px 8px 8px", gap: 4 }}>
          {[
            ["고단백", "var(--green-500)"], ["저칼로리", "var(--blue-500)"], ["저당", "var(--orange-500)"], ["비건", "var(--green-700)"], ["성분분석", "var(--brand-cta)"]
          ].map(([label, color], i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: color, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12 }}>{label.slice(0, 2)}</div>
              <div style={{ fontSize: 11, color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Top scorers */}
        <div style={{ background: "white", marginTop: 8, padding: "20px 16px 8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700 }}>고단백 TOP</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>다분해 점수 8.5 이상</div>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", alignItems: "center" }}>전체보기 <IconChevron size={14}/></div>
          </div>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8, marginLeft: -16, marginRight: -16, padding: "0 16px 12px" }}>
            {ranked.map(f => (
              <div key={f.id} onClick={() => navigate("detail", f)} style={{ flexShrink: 0, width: 140, cursor: "pointer" }}>
                <div style={{ position: "relative", width: 140, height: 140, borderRadius: 8, background: f.thumb, marginBottom: 8 }}>
                  <div style={{ position: "absolute", left: 8, top: 8, background: "white", borderRadius: 999, padding: "3px 9px", fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: 13, color: scoreColor(f.score), border: `1.5px solid ${scoreColor(f.score)}` }}>{f.score.toFixed(1)}</div>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{f.brand}</div>
                <div style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{f.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* All foods grid */}
        <div style={{ background: "white", marginTop: 8, padding: "20px 16px 24px" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>이 주의 다이어트 식품</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto" }}>
            {chips.map((c, i) => <Chip key={i} active={filterChip === i} onClick={() => setFilterChip(i)}>{c}</Chip>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {FOODS.map((p) => <FoodCard key={p.id} food={p} onClick={() => navigate("detail", p)} onCompare={addToCompare}/>)}
          </div>
        </div>
      </div>
    </>
  );
}
window.Home = Home;
