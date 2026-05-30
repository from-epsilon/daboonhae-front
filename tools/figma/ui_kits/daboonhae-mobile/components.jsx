// Shared atoms for 다분해 Mobile UI Kit.
// All exports attached to window for cross-script availability.

// ============================================================ICONS (Lucide-style)
const Icon = ({ d, size = 22, stroke = 1.5, fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
       strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
const IconHome = (p) => <Icon {...p} d={<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>} />;
const IconCategory = (p) => <Icon {...p} d={<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>} />;
const IconCompare = (p) => <Icon {...p} d={<><path d="M16 3h5v5"/><path d="M4 20L21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/></>} />;
const IconUser = (p) => <Icon {...p} d={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>} />;
const IconSearch = (p) => <Icon {...p} d={<><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.65" y2="16.65"/></>} />;
const IconHeart = (p) => <Icon {...p} d={<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>} />;
const IconBell = (p) => <Icon {...p} d={<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>} />;
const IconBack = (p) => <Icon {...p} d={<polyline points="15 18 9 12 15 6"/>} />;
const IconShare = (p) => <Icon {...p} d={<><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></>} />;
const IconClose = (p) => <Icon {...p} d={<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>} />;
const IconPlus = (p) => <Icon {...p} d={<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>} />;
const IconCheck = (p) => <Icon {...p} d={<polyline points="20 6 9 17 4 12"/>} />;
const IconStar = (p) => <Icon {...p} fill="currentColor" stroke="none" d={<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>} />;
const IconChevron = (p) => <Icon {...p} d={<polyline points="9 18 15 12 9 6"/>} />;
const IconInfo = (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>} />;
const IconAlert = (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>} />;
const IconFilter = (p) => <Icon {...p} d={<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>} />;
const IconSort = (p) => <Icon {...p} d={<><path d="M3 6h18"/><path d="M7 12h10"/><path d="M11 18h2"/></>} />;
const IconLeaf = (p) => <Icon {...p} d={<><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.2 2.96c1.4 9.3 -2 17.04 -8.2 17.04Z"/><path d="M2 21c0 -3 1.85 -5.36 5.08 -6"/></>} />;

// ============================================================SCORE COLOR HELPER
const scoreColor = (s) => s >= 7 ? "var(--green-500)" : s >= 4 ? "var(--orange-500)" : "var(--red-500)";
const scoreColorBg = (s) => s >= 7 ? "var(--green-50)" : s >= 4 ? "var(--orange-50)" : "var(--red-50)";
const scoreColorBorder = (s) => s >= 7 ? "var(--green-200)" : s >= 4 ? "var(--orange-200)" : "var(--red-200)";

// ============================================================BUTTONS
const Button = ({ variant = "cta", size = "md", children, onClick, full = false, disabled = false }) => {
  const styles = {
    base: { fontFamily: "var(--font-display)", fontWeight: 700, border: "1px solid transparent", borderRadius: 8, cursor: "pointer", lineHeight: 1 },
    cta: { background: disabled ? "var(--gray-200)" : "var(--brand-cta)", color: disabled ? "var(--text-tertiary)" : "white" },
    brand: { background: "var(--green-500)", color: "white" },
    secondary: { background: "white", color: "var(--text-primary)", borderColor: "var(--border-secondary)" },
    ghost: { background: "var(--gray-100)", color: "var(--text-primary)" },
    sm: { fontSize: 13, padding: "8px 14px" },
    md: { fontSize: 15, padding: "12px 20px" },
    lg: { fontSize: 16, padding: "16px 28px" }
  };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...styles.base, ...styles[variant], ...styles[size], width: full ? "100%" : undefined, display: full ? "flex" : "inline-flex", justifyContent: "center", alignItems: "center", gap: 6 }}>
      {children}
    </button>
  );
};

const Chip = ({ active = false, variant = "default", children, onClick }) => {
  const styles = {
    fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500, padding: "7px 14px", borderRadius: 999,
    border: "1px solid var(--border-tertiary)", background: "white", color: "var(--text-primary)", cursor: "pointer", whiteSpace: "nowrap"
  };
  if (active) Object.assign(styles, { background: "var(--gray-900)", color: "white", borderColor: "var(--gray-900)" });
  if (variant === "brand") Object.assign(styles, { background: "var(--green-50)", color: "var(--green-700)", borderColor: "var(--green-200)" });
  return <button style={styles} onClick={onClick}>{children}</button>;
};

const Badge = ({ variant = "brand", children }) => {
  const styles = {
    fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 3, lineHeight: 1.3, display: "inline-flex", alignItems: "center"
  };
  const variants = {
    brand: { background: "var(--green-500)", color: "white" },
    softGreen: { background: "var(--green-50)", color: "var(--green-700)" },
    red: { background: "var(--red-500)", color: "white" },
    softRed: { background: "var(--red-50)", color: "var(--red-700)" },
    orange: { background: "var(--orange-500)", color: "white" },
    softOrange: { background: "var(--orange-50)", color: "var(--orange-700)" },
    info: { background: "var(--blue-50)", color: "var(--blue-700)" },
    cta: { background: "var(--brand-cta)", color: "white" },
    outline: { background: "white", color: "var(--text-primary)", border: "1px solid var(--gray-900)" }
  };
  return <span style={{ ...styles, ...variants[variant] }}>{children}</span>;
};

// ============================================================SCORE
const Score = ({ value, size = "md" }) => {
  const sizes = {
    sm: { num: 14, suf: 9, gap: 1, pad: "3px 8px" },
    md: { num: 22, suf: 12, gap: 2, pad: "6px 12px" },
    lg: { num: 32, suf: 16, gap: 3, pad: "10px 16px" },
    xl: { num: 56, suf: 22, gap: 4, pad: 0 }
  };
  const s = sizes[size];
  return (
    <div style={{ display: "inline-flex", alignItems: "baseline", gap: s.gap, color: scoreColor(value), fontFamily: "var(--font-numeric)", fontWeight: 700, fontFeatureSettings: '"tnum"' }}>
      <span style={{ fontSize: s.num, lineHeight: 1 }}>{value.toFixed(1)}</span>
      <span style={{ fontSize: s.suf, color: "var(--text-secondary)", fontWeight: 500 }}>점</span>
    </div>
  );
};

const ScoreGauge = ({ value, size = 96, label }) => {
  const r = size / 2 - 8;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 10) * c;
  const color = scoreColor(value);
  return (
    <div style={{ position: "relative", width: size, height: size, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--gray-200)" strokeWidth={6}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 400ms ease-out" }}/>
      </svg>
      <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1 }}>
        <div style={{ fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: size * 0.32, color: "var(--text-primary)" }}>{value.toFixed(1)}</div>
        {label && <div style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 2 }}>{label}</div>}
      </div>
    </div>
  );
};

// ============================================================MACRO ROW
const MacroRow = ({ protein, carbs, fat, kcal, compact = false }) => {
  // protein/carbs/fat are grams. Stack normalized to total grams for the bar.
  const total = protein + carbs + fat;
  const pct = (v) => total > 0 ? (v / total) * 100 : 0;
  if (compact) {
    return (
      <div style={{ display: "flex", gap: 10, fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-numeric)", alignItems: "center" }}>
        <span><b style={{ color: "var(--text-primary)" }}>{kcal}</b>kcal</span>
        <span style={{ width: 1, height: 10, background: "var(--gray-300)" }}/>
        <span>단백질 <b style={{ color: "var(--text-primary)" }}>{protein}g</b></span>
        <span>탄수 <b style={{ color: "var(--text-primary)" }}>{carbs}g</b></span>
        <span>지방 <b style={{ color: "var(--text-primary)" }}>{fat}g</b></span>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", background: "var(--gray-100)" }}>
        <div style={{ width: `${pct(protein)}%`, background: "var(--green-500)" }}/>
        <div style={{ width: `${pct(carbs)}%`, background: "var(--orange-400)" }}/>
        <div style={{ width: `${pct(fat)}%`, background: "var(--blue-400)" }}/>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, fontSize: 11, fontFamily: "var(--font-numeric)" }}>
        <div><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "var(--green-500)", marginRight: 6 }}/><span style={{ color: "var(--text-secondary)" }}>단백질</span> <b style={{ color: "var(--text-primary)" }}>{protein}g</b></div>
        <div><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "var(--orange-400)", marginRight: 6 }}/><span style={{ color: "var(--text-secondary)" }}>탄수화물</span> <b style={{ color: "var(--text-primary)" }}>{carbs}g</b></div>
        <div><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "var(--blue-400)", marginRight: 6 }}/><span style={{ color: "var(--text-secondary)" }}>지방</span> <b style={{ color: "var(--text-primary)" }}>{fat}g</b></div>
      </div>
    </div>
  );
};

// ============================================================FOOD CARD
const FoodCard = ({ food, onClick, layout = "grid", onCompare }) => {
  const compareTip = onCompare && (
    <button onClick={(e) => { e.stopPropagation(); onCompare(food); }} style={{ position: "absolute", right: 6, bottom: 6, width: 26, height: 26, borderRadius: 999, background: "white", border: "1px solid var(--border-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-primary)" }} title="비교함에 담기">
      <IconPlus size={14}/>
    </button>
  );
  if (layout === "list") {
    return (
      <div onClick={onClick} style={{ display: "flex", gap: 12, padding: "14px 0", borderBottom: "1px solid var(--border-tertiary)", cursor: "pointer" }}>
        <div style={{ width: 88, height: 88, borderRadius: 6, background: food.thumb, flexShrink: 0, position: "relative" }}>
          <div style={{ position: "absolute", left: 4, top: 4, background: "white", borderRadius: 999, padding: "2px 7px", fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: 12, color: scoreColor(food.score), border: `1px solid ${scoreColor(food.score)}` }}>
            {food.score.toFixed(1)}
          </div>
          {compareTip}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{food.brand}</div>
          <div style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{food.name}</div>
          <MacroRow {...food.macros} compact />
          <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
            {food.tags && food.tags.map((t, i) => <Badge key={i} variant={t.v}>{t.label}</Badge>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div onClick={onClick} style={{ background: "white", borderRadius: 8, overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column" }}>
      <div style={{ aspectRatio: "1/1", background: food.thumb, position: "relative", borderRadius: 8 }}>
        <div style={{ position: "absolute", left: 8, top: 8, background: "white", borderRadius: 999, padding: "3px 9px", fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: 13, color: scoreColor(food.score), border: `1.5px solid ${scoreColor(food.score)}` }}>
          {food.score.toFixed(1)}
        </div>
        {compareTip}
      </div>
      <div style={{ padding: "10px 4px", display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{food.brand}</div>
        <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: 36 }}>{food.name}</div>
        <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-numeric)", marginTop: 2 }}>
          <b style={{ color: "var(--text-primary)" }}>{food.macros.kcal}</b>kcal · 단백질 <b style={{ color: "var(--text-primary)" }}>{food.macros.protein}g</b>
        </div>
        {food.tags && <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
          {food.tags.slice(0, 2).map((t, i) => <Badge key={i} variant={t.v}>{t.label}</Badge>)}
        </div>}
      </div>
    </div>
  );
};

// ============================================================CHROME
const AppBar = ({ onSearch, onCompare, compareCount = 0 }) => (
  <div style={{ height: 52, background: "white", display: "flex", alignItems: "center", padding: "0 16px", gap: 12, borderBottom: "1px solid var(--border-tertiary)", flexShrink: 0 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <svg width="22" height="22" viewBox="0 0 64 64">
        <path d="M 32 8 A 24 24 0 1 0 56 32" fill="none" stroke="#00C600" strokeWidth="8" strokeLinecap="round"/>
        <circle cx="49.5" cy="14.5" r="4" fill="#00C600"/>
        <circle cx="41" cy="6.5" r="2.6" fill="#00C600" opacity=".75"/>
        <circle cx="57" cy="22" r="2.2" fill="#00C600" opacity=".5"/>
      </svg>
      <div style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, letterSpacing: "-.03em" }}>다분해</div>
    </div>
    <div onClick={onSearch} style={{ flex: 1, background: "var(--gray-100)", borderRadius: 999, padding: "8px 14px", fontSize: 13, color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
      <IconSearch size={16} />
      성분, 브랜드, 영양소로 검색
    </div>
    <IconBell />
  </div>
);

const TopTabs = ({ tabs, active, onSelect }) => (
  <div style={{ background: "white", display: "flex", padding: "0 8px", borderBottom: "1px solid var(--border-tertiary)", overflowX: "auto", flexShrink: 0 }}>
    {tabs.map((t, i) => (
      <div key={i} onClick={() => onSelect(i)} style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: i === active ? 700 : 500, padding: "14px 12px", color: i === active ? "var(--text-primary)" : "var(--text-tertiary)", position: "relative", cursor: "pointer", whiteSpace: "nowrap" }}>
        {t}
        {i === active && <span style={{ position: "absolute", bottom: -1, left: 8, right: 8, height: 2, background: "var(--gray-900)", borderRadius: 2 }}/>}
      </div>
    ))}
  </div>
);

const BottomNav = ({ active, onSelect, compareCount }) => {
  const tabs = [
    { id: "home", label: "홈", Icon: IconHome },
    { id: "category", label: "카테고리", Icon: IconCategory },
    { id: "compare", label: "비교함", Icon: IconCompare },
    { id: "myd", label: "MY", Icon: IconUser },
  ];
  return (
    <div style={{ display: "flex", background: "white", height: 56, borderTop: "1px solid var(--border-tertiary)", flexShrink: 0 }}>
      {tabs.map((t) => (
        <div key={t.id} onClick={() => onSelect(t.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, color: t.id === active ? "var(--green-500)" : "var(--text-tertiary)", fontSize: 10, fontWeight: 500, cursor: "pointer", position: "relative" }}>
          <t.Icon size={22} />
          {t.id === "compare" && compareCount > 0 && <span style={{ position: "absolute", top: 4, right: "calc(50% - 22px)", background: "var(--red-500)", color: "white", fontFamily: "var(--font-numeric)", fontSize: 9, fontWeight: 700, padding: "0 5px", borderRadius: 999, minWidth: 14, textAlign: "center" }}>{compareCount}</span>}
          {t.label}
        </div>
      ))}
    </div>
  );
};

// ============================================================DEMO DATA — Korean diet food brands
const FOODS = [
  { id: 1, brand: "MyProtein", name: "임팩트 웨이 프로틴 초콜릿 1kg", thumb: "linear-gradient(135deg,#6b3a1a,#3d1f0a)", score: 8.7, kcal: 103, macros: { kcal: 103, protein: 21, carbs: 1, fat: 1.9 }, price: 38900, serving: "1스쿱 25g", tags: [{v:"softGreen",label:"고단백 9.2"},{v:"info",label:"공식 영양정보"}], reviews: 12847, rating: 4.8 },
  { id: 2, brand: "닭신", name: "스팀 닭가슴살 오리지널 100g × 10팩", thumb: "linear-gradient(135deg,#f7d9b3,#dcae6f)", score: 9.1, kcal: 105, macros: { kcal: 105, protein: 24, carbs: 0.8, fat: 0.9 }, price: 19900, serving: "1팩 100g", tags: [{v:"softGreen",label:"고단백 9.5"},{v:"softGreen",label:"저당"}], reviews: 8201, rating: 4.9 },
  { id: 3, brand: "풀무원", name: "두부면 칼로리 다이어트 200g × 4팩", thumb: "linear-gradient(135deg,#f3f0e0,#dcd6b5)", score: 8.4, kcal: 88, macros: { kcal: 88, protein: 10, carbs: 5, fat: 4 }, price: 8900, serving: "1팩 200g", tags: [{v:"softGreen",label:"저칼로리"},{v:"softGreen",label:"비건"}], reviews: 3201, rating: 4.6 },
  { id: 4, brand: "그릭데이", name: "오리지널 무가당 그릭요거트 100g × 8개", thumb: "linear-gradient(135deg,#fafaf2,#e8e5cc)", score: 8.2, kcal: 75, macros: { kcal: 75, protein: 9, carbs: 4, fat: 3 }, price: 14900, serving: "1개 100g", tags: [{v:"softGreen",label:"고단백"},{v:"softGreen",label:"무가당"}], reviews: 5402, rating: 4.7 },
  { id: 5, brand: "마이밀", name: "마이바디 단백질 셰이크 초코맛 12개입", thumb: "linear-gradient(135deg,#5a3b1f,#2d1c0c)", score: 6.4, kcal: 220, macros: { kcal: 220, protein: 18, carbs: 25, fat: 6 }, price: 18900, serving: "1개 190ml", tags: [{v:"softOrange",label:"당류 12g"},{v:"softGreen",label:"고단백"}], reviews: 1923, rating: 4.3, alert: "당류 함량 높음" },
  { id: 6, brand: "베지마요", name: "곤약젤리 복숭아맛 130g × 10개", thumb: "linear-gradient(135deg,#fce8d6,#f4b88e)", score: 7.8, kcal: 18, macros: { kcal: 18, protein: 0, carbs: 4.5, fat: 0 }, price: 9900, serving: "1포 130g", tags: [{v:"softGreen",label:"저칼로리"},{v:"softGreen",label:"비건"}], reviews: 9201, rating: 4.5 },
  { id: 7, brand: "다노", name: "다이어트 식단도시락 닭가슴살 샐러드 230g", thumb: "linear-gradient(135deg,#dfeed4,#a8c98a)", score: 8.9, kcal: 285, macros: { kcal: 285, protein: 28, carbs: 18, fat: 9 }, price: 6900, serving: "1팩 230g", tags: [{v:"softGreen",label:"균형식"},{v:"info",label:"공식 영양정보"}], reviews: 2104, rating: 4.7 },
  { id: 8, brand: "헬로네이처", name: "무염 견과류 믹스 25g × 30봉", thumb: "linear-gradient(135deg,#e3c79b,#a87a4d)", score: 7.2, kcal: 158, macros: { kcal: 158, protein: 5, carbs: 5, fat: 13 }, price: 21900, serving: "1봉 25g", tags: [{v:"softGreen",label:"건강한지방"},{v:"softOrange",label:"고칼로리"}], reviews: 4201, rating: 4.6 }
];

const INGREDIENTS_DEMO = [
  { name: "분리유청단백 (WPI)", role: "단백질 원료", level: "safe", note: "고품질 단백질" },
  { name: "코코아분말", role: "향료", level: "safe" },
  { name: "정제염", role: "조미", level: "safe" },
  { name: "수크랄로스", role: "감미료", level: "watch", note: "인공 감미료" },
  { name: "아세설팜칼륨", role: "감미료", level: "watch", note: "인공 감미료" },
  { name: "잔탄검", role: "안정제", level: "safe" },
  { name: "혼합제제 (이산화규소)", role: "고결방지", level: "watch" }
];

Object.assign(window, {
  Icon, IconHome, IconCategory, IconCompare, IconUser, IconSearch, IconHeart, IconBell,
  IconBack, IconShare, IconClose, IconPlus, IconCheck, IconStar, IconChevron, IconInfo, IconAlert, IconFilter, IconSort, IconLeaf,
  scoreColor, scoreColorBg, scoreColorBorder,
  Button, Chip, Badge, Score, ScoreGauge, MacroRow, FoodCard, AppBar, TopTabs, BottomNav,
  FOODS, INGREDIENTS_DEMO
});
