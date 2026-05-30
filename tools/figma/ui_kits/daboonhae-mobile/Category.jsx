// Category — 2-pane diet food category browser
function Category({ navigate }) {
  const [activeCat, setActiveCat] = React.useState(0);
  const cats = ["전체", "닭가슴살", "단백질 보충제", "곤약 / 두부면", "샐러드 / 도시락", "그릭요거트", "프로틴바 / 쿠키", "곤약젤리", "견과류", "저당 음료"];
  const sub = {
    "닭가슴살": ["스팀형", "그릴형", "큐브", "스테이크", "소시지", "어묵바"],
    "단백질 보충제": ["WPI", "WPC", "분리대두단백", "카제인", "비건 단백질", "BCAA"],
    "곤약 / 두부면": ["곤약면", "곤약쌀", "두부면", "두부쌀", "콘약 떡볶이"],
    "전체": ["전체 카테고리", "신상품", "인기 BEST"]
  };
  const showSub = sub[cats[activeCat]] || ["하위 카테고리 준비중"];

  return (
    <>
      <div style={{ height: 52, background: "white", display: "flex", alignItems: "center", padding: "0 16px", borderBottom: "1px solid var(--border-tertiary)", flexShrink: 0, gap: 12 }}>
        <div style={{ flex: 1, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>카테고리</div>
        <div onClick={() => navigate("search")} style={{ cursor: "pointer" }}><IconSearch /></div>
      </div>
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div style={{ width: 120, background: "var(--bg-off-white)", overflowY: "auto" }}>
          {cats.map((c, i) => (
            <div key={i} onClick={() => setActiveCat(i)} style={{ padding: "14px 12px", fontSize: 13, color: i === activeCat ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: i === activeCat ? 700 : 400, background: i === activeCat ? "white" : "transparent", cursor: "pointer", borderLeft: i === activeCat ? "3px solid var(--green-500)" : "3px solid transparent", lineHeight: 1.3 }}>
              {c}
            </div>
          ))}
        </div>
        <div style={{ flex: 1, padding: 20, overflowY: "auto", background: "white" }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>{cats[activeCat]}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {showSub.map((s, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <div style={{ width: 56, height: 56, borderRadius: 8, background: "var(--gray-100)" }}/>
                <div style={{ fontSize: 12, color: "var(--text-primary)", textAlign: "center" }}>{s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
window.Category = Category;
