// FoodDetail — the brand's signature screen. Score, macros, ingredients, reviews.
function FoodDetail({ food, navigate, addToCompare }) {
  const [tab, setTab] = React.useState(0);
  const tabs = ["다분해 분석", "영양정보", `리뷰 ${food?.reviews?.toLocaleString() ?? "0"}`, "Q&A"];
  if (!food) food = FOODS[0];

  // Sub-scores derived from food
  const subScores = [
    { label: "단백질", value: Math.min(10, food.macros.protein / 3) },
    { label: "저칼로리", value: Math.max(0, 10 - food.macros.kcal / 30) },
    { label: "저당", value: food.macros.protein > 15 ? 8.5 : 6.5 },
    { label: "성분 안전성", value: 8.2 }
  ];

  return (
    <>
      <div style={{ height: 52, background: "white", display: "flex", alignItems: "center", padding: "0 12px", gap: 8, borderBottom: "1px solid var(--border-tertiary)", flexShrink: 0 }}>
        <div onClick={() => navigate("home")} style={{ cursor: "pointer" }}><IconBack /></div>
        <div style={{ flex: 1 }}/>
        <IconSearch />
        <IconShare />
      </div>

      <div style={{ flex: 1, overflowY: "auto", background: "var(--bg-off-white)" }}>
        {/* Hero */}
        <div style={{ aspectRatio: "1/1", background: food.thumb, position: "relative" }}>
          <div style={{ position: "absolute", right: 16, bottom: 16, background: "rgba(0,0,0,.5)", color: "white", fontSize: 11, fontFamily: "var(--font-numeric)", padding: "3px 10px", borderRadius: 999 }}>1 / 6</div>
        </div>

        {/* Title + score block — this is the brand-signature unit */}
        <div style={{ background: "white", padding: "20px 16px 18px" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            {food.tags && food.tags.map((t, i) => <Badge key={i} variant={t.v}>{t.label}</Badge>)}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>{food.brand}</div>
          <div style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 17, color: "var(--text-primary)", lineHeight: 1.45, marginBottom: 16 }}>{food.name}</div>

          <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "16px 0", borderTop: "1px solid var(--border-tertiary)", borderBottom: "1px solid var(--border-tertiary)" }}>
            <ScoreGauge value={food.score} size={88} label="다분해 점수" />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>핵심 평가</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.5 }}>
                {food.score >= 8.5 ? "고단백·저당 균형 우수, 다이어트 핵심식품" :
                 food.score >= 7 ? "균형 잡힌 영양 구성, 보조식품으로 적합" :
                 food.score >= 5 ? "장점 있으나 일부 영양소 주의 필요" :
                 "단점이 더 큰 식품 — 비교 후 선택 권장"}
              </div>
            </div>
          </div>

          {/* Sub-scores grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
            {subScores.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, height: 6, background: "var(--gray-100)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${s.value * 10}%`, background: scoreColor(s.value), borderRadius: 3 }}/>
                </div>
                <span style={{ fontSize: 11, color: "var(--text-secondary)", width: 72 }}>{s.label}</span>
                <span style={{ fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: 12, color: scoreColor(s.value), width: 26, textAlign: "right" }}>{s.value.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Macro card */}
        <div style={{ background: "white", marginTop: 8, padding: "20px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>한 끼 영양 ({food.serving})</div>
            <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>공식 영양정보</div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 14 }}>
            <span style={{ fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: 30, color: "var(--text-primary)" }}>{food.macros.kcal}</span>
            <span style={{ fontFamily: "var(--font-numeric)", fontSize: 14, color: "var(--text-secondary)" }}>kcal</span>
            <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-tertiary)" }}>1일 권장 2,000kcal 대비 {Math.round(food.macros.kcal / 20)}%</span>
          </div>
          <MacroRow {...food.macros} />
        </div>

        {/* Detail tabs */}
        <div style={{ background: "white", marginTop: 8, display: "flex", borderBottom: "1px solid var(--border-tertiary)", position: "sticky", top: 0, zIndex: 1 }}>
          {tabs.map((t, i) => (
            <div key={i} onClick={() => setTab(i)} style={{ flex: 1, padding: "14px 0", textAlign: "center", fontFamily: "var(--font-display)", fontSize: 13, fontWeight: i === tab ? 700 : 500, color: i === tab ? "var(--text-primary)" : "var(--text-tertiary)", position: "relative", cursor: "pointer" }}>
              {t}
              {i === tab && <span style={{ position: "absolute", bottom: -1, left: 12, right: 12, height: 2, background: "var(--gray-900)" }}/>}
            </div>
          ))}
        </div>

        <div style={{ background: "white", padding: "20px 16px 80px", minHeight: 280 }}>
          {tab === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "var(--bg-card-ui)", padding: 16, borderRadius: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14 }}>
                  <IconLeaf size={18} stroke={1.5} /> 이런 분께 추천해요
                </div>
                <ul style={{ paddingLeft: 18, fontSize: 13, color: "var(--text-primary)", lineHeight: 1.7, margin: 0 }}>
                  <li>단백질 섭취량을 늘리고 싶은 분</li>
                  <li>한 끼를 가볍게 대체하고 싶은 분</li>
                  <li>운동 직후 빠른 회복식이 필요한 분</li>
                </ul>
              </div>

              {/* Ingredient breakdown — score-style */}
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, marginBottom: 12 }}>전성분 분석</div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {INGREDIENTS_DEMO.map((ing, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border-tertiary)" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: ing.level === "safe" ? "var(--green-500)" : ing.level === "watch" ? "var(--orange-500)" : "var(--red-500)", marginRight: 12 }}/>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{ing.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>{ing.role}{ing.note ? ` · ${ing.note}` : ""}</div>
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: ing.level === "safe" ? "var(--green-700)" : ing.level === "watch" ? "var(--orange-700)" : "var(--red-700)" }}>
                        {ing.level === "safe" ? "안전" : ing.level === "watch" ? "관찰" : "주의"}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12, padding: "12px 14px", background: "var(--orange-50)", color: "var(--orange-800)", borderRadius: 8, fontSize: 12, lineHeight: 1.5, display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <IconInfo size={16} />
                  <div>인공 감미료(수크랄로스, 아세설팜칼륨)가 포함되어 있어요. 일반적으로 안전하다고 알려져 있으나, 과민한 분께는 주의가 필요합니다.</div>
                </div>
              </div>
            </div>
          )}
          {tab === 1 && (
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, marginBottom: 12 }}>영양성분표 ({food.serving})</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-body)", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--gray-900)", color: "var(--text-secondary)", fontSize: 11 }}>
                    <th style={{ textAlign: "left", padding: "8px 0", fontWeight: 700 }}>영양소</th>
                    <th style={{ textAlign: "right", padding: "8px 0", fontWeight: 700 }}>함량</th>
                    <th style={{ textAlign: "right", padding: "8px 0", fontWeight: 700 }}>%영양소기준치</th>
                  </tr>
                </thead>
                <tbody style={{ fontFamily: "var(--font-numeric)" }}>
                  {[
                    ["열량", `${food.macros.kcal}kcal`, ""],
                    ["단백질", `${food.macros.protein}g`, `${Math.round(food.macros.protein / 60 * 100)}%`],
                    ["탄수화물", `${food.macros.carbs}g`, `${Math.round(food.macros.carbs / 324 * 100)}%`],
                    ["  └ 당류", `${Math.round(food.macros.carbs * 0.3 * 10) / 10}g`, ""],
                    ["지방", `${food.macros.fat}g`, `${Math.round(food.macros.fat / 54 * 100)}%`],
                    ["나트륨", "180mg", "9%"],
                    ["콜레스테롤", "8mg", "3%"]
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border-tertiary)", color: "var(--text-primary)" }}>
                      <td style={{ padding: "10px 0", fontFamily: "var(--font-body)", color: row[0].startsWith("  ") ? "var(--text-secondary)" : "var(--text-primary)" }}>{row[0]}</td>
                      <td style={{ padding: "10px 0", textAlign: "right", fontWeight: row[0].startsWith("  ") ? 400 : 700 }}>{row[1]}</td>
                      <td style={{ padding: "10px 0", textAlign: "right", color: "var(--text-secondary)" }}>{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {tab === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 0", borderBottom: "1px solid var(--border-tertiary)" }}>
                <div style={{ fontFamily: "var(--font-numeric)", fontSize: 36, fontWeight: 700, color: "var(--text-primary)" }}>{food.rating}<span style={{ fontSize: 16, color: "var(--text-tertiary)" }}>/5</span></div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
                  {[5,4,3,2,1].map(s => (
                    <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontFamily: "var(--font-numeric)", color: "var(--text-secondary)" }}>
                      <span style={{ width: 8 }}>{s}</span>
                      <div style={{ flex: 1, height: 4, background: "var(--gray-200)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${[80,18,2,0,0][5-s]}%`, background: "var(--gray-900)" }}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {[
                ["김**", "단백질 함량 높고 맛도 괜찮아요. 운동 후 한 잔 마시면 회복이 빨라요.", "−3kg / 6주차"],
                ["이**", "당류가 조금 있는 게 아쉽지만 맛이 좋아서 꾸준히 먹게 됩니다.", "−1.5kg / 3주차"]
              ].map(([n, c, p], i) => (
                <div key={i} style={{ borderBottom: "1px solid var(--border-tertiary)", paddingBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{n}</span>
                    <Badge variant="softGreen">{p}</Badge>
                  </div>
                  <div style={{ color: "var(--blue-500)", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>★★★★★</div>
                  <div style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5 }}>{c}</div>
                </div>
              ))}
            </div>
          )}
          {tab === 3 && <div style={{ fontSize: 13, color: "var(--text-tertiary)", textAlign: "center", padding: "60px 0" }}>아직 등록된 Q&A가 없어요.</div>}
        </div>
      </div>

      {/* Bottom action bar */}
      <div style={{ display: "flex", gap: 8, padding: "10px 16px 12px", background: "white", borderTop: "1px solid var(--border-tertiary)", flexShrink: 0 }}>
        <button style={{ width: 48, height: 48, borderRadius: 8, border: "1px solid var(--border-tertiary)", background: "white", color: "var(--text-tertiary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconHeart />
        </button>
        <Button variant="ghost" size="lg" onClick={() => addToCompare(food)}>비교함 담기</Button>
        <Button variant="cta" size="lg" full>구매처 보기</Button>
      </div>
    </>
  );
}
window.FoodDetail = FoodDetail;
