// Compare — side-by-side comparison of 2-3 foods
function Compare({ compareList, setCompareList, navigate }) {
  const remove = (id) => setCompareList(compareList.filter(c => c.id !== id));
  const items = compareList;

  if (items.length === 0) {
    return (
      <>
        <div style={{ height: 52, background: "white", display: "flex", alignItems: "center", padding: "0 16px", borderBottom: "1px solid var(--border-tertiary)", flexShrink: 0 }}>
          <div style={{ flex: 1, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17 }}>비교함 <span style={{ color: "var(--green-500)", fontFamily: "var(--font-numeric)" }}>0</span></div>
        </div>
        <div style={{ flex: 1, padding: "80px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, background: "var(--bg-off-white)" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-tertiary)" }}>
            <IconCompare size={36}/>
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "var(--text-primary)" }}>비교할 식품이 없어요</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>식품 상세에서 "비교함 담기"를<br/>눌러 최대 3개까지 비교해 보세요.</div>
          <div style={{ marginTop: 12 }}>
            <Button variant="cta" onClick={() => navigate("home")}>식품 둘러보기</Button>
          </div>
        </div>
      </>
    );
  }

  // Determine winners per row
  const winners = {
    score: Math.max(...items.map(i => i.score)),
    protein: Math.max(...items.map(i => i.macros.protein)),
    kcal: Math.min(...items.map(i => i.macros.kcal)), // lower is better
    carbs: Math.min(...items.map(i => i.macros.carbs)),
    fat: Math.min(...items.map(i => i.macros.fat)),
    price: Math.min(...items.map(i => i.price))
  };

  const Row = ({ label, get, fmt, winner, sub }) => (
    <div style={{ display: "grid", gridTemplateColumns: "70px " + items.map(() => "1fr").join(" "), padding: "12px 0", borderBottom: "1px solid var(--border-tertiary)", alignItems: "center", gap: 8 }}>
      <div>
        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: "var(--text-tertiary)" }}>{sub}</div>}
      </div>
      {items.map((it, i) => {
        const v = get(it);
        const isWinner = v === winner;
        return (
          <div key={i} style={{ textAlign: "center" }}>
            <span style={{ fontFamily: "var(--font-numeric)", fontWeight: isWinner ? 700 : 500, fontSize: 14, color: isWinner ? "var(--green-700)" : "var(--text-primary)" }}>
              {fmt ? fmt(v) : v}
            </span>
            {isWinner && items.length > 1 && <span style={{ display: "block", fontSize: 9, color: "var(--green-500)", marginTop: 2, fontWeight: 700 }}>▲ 우수</span>}
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <div style={{ height: 52, background: "white", display: "flex", alignItems: "center", padding: "0 16px", borderBottom: "1px solid var(--border-tertiary)", flexShrink: 0 }}>
        <div style={{ flex: 1, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17 }}>비교함 <span style={{ color: "var(--green-500)", fontFamily: "var(--font-numeric)" }}>{items.length}</span><span style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-numeric)", fontSize: 13 }}>/3</span></div>
        <button onClick={() => setCompareList([])} style={{ background: "transparent", border: 0, fontSize: 12, color: "var(--text-tertiary)", cursor: "pointer" }}>전체 비우기</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", background: "white" }}>
        {/* Cards row */}
        <div style={{ padding: "16px 16px 8px", display: "grid", gridTemplateColumns: "70px " + items.map(() => "1fr").join(" "), gap: 8 }}>
          <div/>
          {items.map(it => (
            <div key={it.id} style={{ position: "relative", display: "flex", flexDirection: "column", gap: 6, alignItems: "center", cursor: "pointer" }} onClick={() => navigate("detail", it)}>
              <button onClick={(e) => { e.stopPropagation(); remove(it.id); }} style={{ position: "absolute", top: -4, right: -4, width: 22, height: 22, borderRadius: "50%", background: "var(--gray-900)", color: "white", border: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
                <IconClose size={12}/>
              </button>
              <div style={{ width: "100%", aspectRatio: "1/1", borderRadius: 6, background: it.thumb, position: "relative" }}>
                <div style={{ position: "absolute", left: 4, top: 4, background: "white", borderRadius: 999, padding: "2px 6px", fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: 10, color: scoreColor(it.score), border: `1px solid ${scoreColor(it.score)}` }}>{it.score.toFixed(1)}</div>
              </div>
              <div style={{ fontSize: 10, color: "var(--text-secondary)", textAlign: "center", lineHeight: 1.3 }}>{it.brand}</div>
              <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text-primary)", textAlign: "center", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{it.name.slice(0, 24)}{it.name.length > 24 ? "…" : ""}</div>
            </div>
          ))}
          {items.length < 3 && (
            <div onClick={() => navigate("home")} style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center", cursor: "pointer", justifyContent: "center" }}>
              <div style={{ width: "100%", aspectRatio: "1/1", borderRadius: 6, background: "var(--bg-off-white)", border: "1px dashed var(--border-secondary)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-tertiary)" }}>
                <IconPlus size={28}/>
              </div>
              <div style={{ fontSize: 10, color: "var(--text-tertiary)" }}>추가</div>
            </div>
          )}
        </div>

        <div style={{ height: 8, background: "var(--bg-off-white)", margin: "16px 0" }}/>

        {/* Comparison rows */}
        <div style={{ padding: "0 16px 100px" }}>
          <Row label="다분해 점수" get={it => it.score} fmt={v => v.toFixed(1)} winner={winners.score} />
          <Row label="열량" sub="1회 제공량" get={it => it.macros.kcal} fmt={v => v + "kcal"} winner={winners.kcal} />
          <Row label="단백질" get={it => it.macros.protein} fmt={v => v + "g"} winner={winners.protein} />
          <Row label="탄수화물" get={it => it.macros.carbs} fmt={v => v + "g"} winner={winners.carbs} />
          <Row label="지방" get={it => it.macros.fat} fmt={v => v + "g"} winner={winners.fat} />
          <Row label="가격" get={it => it.price} fmt={v => v.toLocaleString() + "원"} winner={winners.price} />

          <div style={{ marginTop: 20, padding: 16, background: "var(--green-50)", borderRadius: 10, fontSize: 13, lineHeight: 1.6, color: "var(--green-800)" }}>
            <div style={{ fontWeight: 700, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <IconInfo size={16}/> 다분해 추천
            </div>
            {items.length === 1 ? (
              <div>2개 이상 담아야 비교 분석을 드릴 수 있어요.</div>
            ) : (
              <div>
                <b>{items.find(i => i.macros.protein === winners.protein).brand}</b>가 단백질이 가장 많고,{" "}
                <b>{items.find(i => i.macros.kcal === winners.kcal).brand}</b>가 칼로리가 가장 낮아요.
                {" "}본인의 목표(증량/감량)에 맞춰 선택하세요.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
window.Compare = Compare;
