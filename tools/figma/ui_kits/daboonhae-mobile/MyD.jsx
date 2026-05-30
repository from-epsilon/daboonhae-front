// MyD — saved foods, diet goals, recent activity
function MyD({ navigate }) {
  return (
    <>
      <div style={{ height: 52, background: "white", display: "flex", alignItems: "center", padding: "0 16px", borderBottom: "1px solid var(--border-tertiary)", flexShrink: 0 }}>
        <div style={{ flex: 1, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20 }}>MY</div>
        <IconBell />
      </div>

      <div style={{ flex: 1, overflowY: "auto", background: "var(--bg-off-white)" }}>
        {/* User card */}
        <div style={{ background: "white", padding: "20px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#00C600,#018600)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700 }}>지</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>지마님</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                <Badge variant="softGreen">목표: 감량 중</Badge>
                <span style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-numeric)" }}>−2.4kg / 4주차</span>
              </div>
            </div>
            <button style={{ background: "transparent", border: 0, color: "var(--text-tertiary)", cursor: "pointer" }}>
              <IconChevron size={16}/>
            </button>
          </div>

          {/* Goals quick row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "12px 0", border: "1px solid var(--border-tertiary)", borderRadius: 8 }}>
            {[
              ["오늘 섭취", "1,420", "kcal"],
              ["단백질", "98", "g"],
              ["목표까지", "−3.6", "kg"]
            ].map(([label, num, unit], i) => (
              <div key={i} style={{ textAlign: "center", borderRight: i < 2 ? "1px solid var(--border-tertiary)" : "none" }}>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>{label}</div>
                <div style={{ fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: 18, color: "var(--text-primary)" }}>{num}<span style={{ fontSize: 11, fontWeight: 500, marginLeft: 2, color: "var(--text-secondary)" }}>{unit}</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* My foods */}
        <div style={{ background: "white", marginTop: 8, padding: "20px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>나의 식단</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", alignItems: "center" }}>전체보기 <IconChevron size={14}/></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {[
              ["찜한 식품", 12], ["최근 본", 28], ["내 리뷰", 5], ["다이어리", 21]
            ].map(([label, n], i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "12px 0", background: "var(--bg-card-ui)", borderRadius: 8, cursor: "pointer" }}>
                <span style={{ fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: 20, color: "var(--green-500)" }}>{n}</span>
                <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent foods you scored */}
        <div style={{ background: "white", marginTop: 8, padding: "20px 16px" }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 12 }}>최근 본 식품</div>
          {FOODS.slice(0, 3).map(f => (
            <div key={f.id} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border-tertiary)" }}>
              <div style={{ width: 48, height: 48, borderRadius: 6, background: f.thumb, flexShrink: 0 }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{f.brand}</div>
                <div style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{f.name}</div>
              </div>
              <Score value={f.score} size="sm"/>
            </div>
          ))}
        </div>

        {/* Menu list */}
        <div style={{ background: "white", marginTop: 8 }}>
          {[
            "다이어트 목표 설정", "알림 설정", "공지사항", "이용 가이드", "고객센터", "환경설정"
          ].map((label, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 16px", fontSize: 14, color: "var(--text-primary)", borderBottom: "1px solid var(--border-tertiary)", cursor: "pointer" }}>
              {label}
              <IconChevron size={16}/>
            </div>
          ))}
        </div>

        <div style={{ padding: 24, textAlign: "center", fontSize: 11, color: "var(--text-caption)", lineHeight: 1.6 }}>
          © Daboonhae Inc. All rights reserved.<br/>
          영양 정보는 제조사 표기를 기반으로 합니다.
        </div>
      </div>
    </>
  );
}
window.MyD = MyD;
