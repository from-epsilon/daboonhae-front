// 룰 기반 분석 문장 생성기
// - 각 분석 섹션 id → (product) => string[] 한두 문장 반환
// - 데이터가 결측이면 빈 배열 또는 안전한 안내 문장 반환
// - 추후 LLM/외부 API 연동 시 ANALYZERS 매핑만 갈아끼우면 됨

// ─────────────────── 체중감량 ───────────────────

function num(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function calorieSugar(p) {
  const cal = num(p.nutrition?.calories);
  const sugar = num(p.nutrition?.sugar);
  const lines = [];

  if (cal != null) {
    if (cal === 0) lines.push('칼로리 0kcal — 다이어트 중 자유로운 섭취가 가능합니다.');
    else if (cal <= 150) lines.push(`${p.volume}당 ${cal}kcal로 가벼운 편입니다.`);
    else if (cal <= 300) lines.push(`${p.volume}당 ${cal}kcal로 일반 간식 수준입니다.`);
    else lines.push(`${p.volume}당 ${cal}kcal로 한 끼에 가까운 양입니다.`);
  }

  if (sugar != null) {
    if (sugar === 0) lines.push('당류는 표기상 0g입니다.');
    else if (sugar <= 3) lines.push(`당류 ${sugar}g — 다이어트 기준 양호한 수준입니다.`);
    else if (sugar <= 10) lines.push(`당류 ${sugar}g — 일반 식품과 비슷한 수준이니 섭취량에 주의하세요.`);
    else lines.push(`당류 ${sugar}g — 다이어트 중에는 빈도를 줄이는 것을 권장합니다.`);
  }

  return lines;
}

function carbFiber(p) {
  const carbs = num(p.nutrition?.carbs);
  const fiber = num(p.nutrition?.fiber);
  const lines = [];

  if (carbs != null && fiber != null) {
    const netCarbs = Math.max(0, carbs - fiber);
    lines.push(`탄수화물 ${carbs}g 중 식이섬유 ${fiber}g — 순탄수 약 ${netCarbs}g입니다.`);
  } else if (carbs != null) {
    lines.push(`탄수화물 ${carbs}g입니다. 식이섬유 표기 정보는 없습니다.`);
  }

  if (fiber != null) {
    if (fiber >= 5) lines.push('식이섬유가 풍부해 포만감 유지에 유리합니다.');
    else if (fiber >= 2) lines.push('식이섬유 함량은 평범한 편입니다.');
    else lines.push('식이섬유가 부족하니 다른 식품과 조합하는 것을 권장합니다.');
  }

  return lines;
}

function weightLossFit(p) {
  const cal = num(p.nutrition?.calories);
  const protein = num(p.nutrition?.protein);
  const sugar = num(p.nutrition?.sugar);
  let score = 0;
  let total = 0;

  if (cal != null) {
    total += 2;
    if (cal < 200) score += 2;
    else if (cal < 400) score += 1;
  }
  if (protein != null) {
    total += 2;
    if (protein >= 15) score += 2;
    else if (protein >= 7) score += 1;
  }
  if (sugar != null) {
    total += 2;
    if (sugar <= 3) score += 2;
    else if (sugar <= 10) score += 1;
  }

  if (total === 0) return [];
  const verdict =
    score / total >= 0.8 ? '체중감량에 매우 적합합니다.'
    : score / total >= 0.5 ? '체중감량에 무난한 선택입니다.'
    : '체중감량 중에는 빈도를 줄이는 것을 권장합니다.';
  return [`종합 적합도 ${score}/${total} — ${verdict}`];
}

// ─────────────────── 근성장 ───────────────────

function proteinContent(p) {
  const protein = num(p.nutrition?.protein);
  const sources = p.ingredients?.proteinSources ?? [];
  const lines = [];

  if (protein != null) {
    if (protein >= 25) lines.push(`단백질 ${protein}g — 1회 섭취 권장량(20g)을 충분히 충족합니다.`);
    else if (protein >= 15) lines.push(`단백질 ${protein}g — 일반 간식 대비 우수한 수준입니다.`);
    else if (protein >= 7) lines.push(`단백질 ${protein}g — 보조 단백질원으로 활용 가능합니다.`);
    else lines.push(`단백질 ${protein}g — 주 단백질원으로는 부족합니다.`);
  }

  if (sources.length > 0) lines.push(`원료: ${sources.join(', ')}.`);
  return lines;
}

function bcaaProfile(p) {
  const bcaa = num(p.nutrition?.bcaa);
  if (bcaa == null) return ['BCAA 표기 정보가 없어 단정하기 어렵습니다.'];
  if (bcaa >= 5) return [`BCAA ${bcaa}g — 운동 직후 회복에 충분한 수준입니다.`];
  if (bcaa >= 2) return [`BCAA ${bcaa}g — 보충제로 활용하기 적당합니다.`];
  if (bcaa > 0) return [`BCAA ${bcaa}g — 보조 정도로 보시면 됩니다.`];
  return ['BCAA 표기 정보가 없어 단정하기 어렵습니다.'];
}

function postWorkout(p) {
  const protein = num(p.nutrition?.protein);
  const carbs = num(p.nutrition?.carbs);
  const sources = p.ingredients?.proteinSources ?? [];
  const lines = [];

  if (sources.includes('WPI')) lines.push('WPI(분리유청)는 흡수가 빨라 운동 직후 30분 내 섭취에 적합합니다.');
  else if (sources.includes('WPC')) lines.push('WPC는 흡수 속도가 적당해 운동 후 1시간 이내 섭취를 권장합니다.');
  else if (sources.includes('카제인')) lines.push('카제인은 천천히 흡수되어 자기 전 섭취에 적합합니다.');

  if (protein >= 20 && carbs >= 5) lines.push('단백질·탄수화물 균형이 회복기에 적절합니다.');
  return lines.length > 0 ? lines : ['단백질 함량을 기준으로는 일반 보충용으로 분류됩니다.'];
}

// ─────────────────── 혈당관리 ───────────────────

function sugarWarning(p) {
  const sugar = num(p.nutrition?.sugar);
  const sweeteners = p.ingredients?.sweeteners ?? [];
  const lines = [];

  if (sugar != null) {
    if (sugar === 0) lines.push('당류 0g — 혈당 상승 우려가 거의 없습니다.');
    else if (sugar <= 3) lines.push(`당류 ${sugar}g — 혈당에 큰 영향을 주지 않는 수준입니다.`);
    else lines.push(`당류 ${sugar}g — 혈당 관리 중에는 섭취량을 조절하세요.`);
  }

  if (sweeteners.length > 0) lines.push(`대체당 사용: ${sweeteners.join(', ')}.`);
  return lines;
}

function fiberGlycemic(p) {
  const fiber = num(p.nutrition?.fiber);
  if (fiber == null) return ['식이섬유 표기 정보가 없어 단정하기 어렵습니다.'];
  if (fiber >= 5) return [`식이섬유 ${fiber}g — 식후 혈당 상승을 완만하게 만들어주는 수준입니다.`];
  if (fiber >= 2) return [`식이섬유 ${fiber}g — 보조적인 도움은 되지만 큰 효과는 기대 어렵습니다.`];
  return ['식이섬유 함량이 낮아 혈당 완화 효과는 제한적입니다.'];
}

function glucoseFit(p) {
  const sugar = num(p.nutrition?.sugar);
  const fiber = num(p.nutrition?.fiber);
  const sweeteners = p.ingredients?.sweeteners ?? [];
  let score = 0;
  let total = 0;

  if (sugar != null) {
    total += 2;
    if (sugar <= 1) score += 2;
    else if (sugar <= 5) score += 1;
  }
  if (fiber != null) {
    total += 2;
    if (fiber >= 5) score += 2;
    else if (fiber >= 2) score += 1;
  }
  if (total === 0) return [];
  const verdict =
    score / total >= 0.8 ? '혈당관리에 적합합니다.'
    : score / total >= 0.4 ? '혈당관리에 무난한 편이나 섭취량을 조절하세요.'
    : '혈당관리 중에는 빈도를 줄이는 것을 권장합니다.';
  return [`종합 적합도 ${score}/${total} — ${verdict}`];
}

// ─────────────────── 식사대용 ───────────────────

function mealBalance(p) {
  const cal = num(p.nutrition?.calories);
  const protein = num(p.nutrition?.protein);
  const carbs = num(p.nutrition?.carbs);
  const fat = num(p.nutrition?.fat);
  const lines = [`한 끼 기준 ${cal ?? '-'}kcal — 단백질 ${protein ?? '-'}g / 탄수 ${carbs ?? '-'}g / 지방 ${fat ?? '-'}g.`];

  if (protein != null && carbs != null && fat != null) {
    if (protein >= 15 && carbs >= 20 && fat >= 5) lines.push('3대 영양소가 한 끼로 균형 잡혀 있습니다.');
    else if (protein < 15) lines.push('단백질이 한 끼로는 다소 부족합니다.');
    else if (carbs < 20) lines.push('탄수화물이 적어 에너지원으로는 부족할 수 있습니다.');
  }

  return lines;
}

function satiety(p) {
  const protein = num(p.nutrition?.protein);
  const fiber = num(p.nutrition?.fiber);
  const fat = num(p.nutrition?.fat);
  const score =
    (protein != null ? (protein >= 15 ? 2 : protein >= 7 ? 1 : 0) : 0) +
    (fiber != null ? (fiber >= 5 ? 2 : fiber >= 2 ? 1 : 0) : 0) +
    (fat != null && fat >= 5 ? 1 : 0);

  if (score >= 4) return ['단백질·식이섬유·지방이 모두 갖춰져 포만감이 오래 유지됩니다.'];
  if (score >= 2) return ['포만감은 평균적인 수준입니다.'];
  return ['포만감 측면에서는 한 끼로 부족할 수 있습니다.'];
}

function mealReplacementFit(p) {
  const cal = num(p.nutrition?.calories);
  const protein = num(p.nutrition?.protein);
  const fiber = num(p.nutrition?.fiber);
  let score = 0;
  let total = 0;

  if (cal != null) {
    total += 2;
    if (cal >= 250 && cal <= 500) score += 2;
    else if (cal >= 150 && cal <= 600) score += 1;
  }
  if (protein != null) {
    total += 2;
    if (protein >= 20) score += 2;
    else if (protein >= 10) score += 1;
  }
  if (fiber != null) {
    total += 1;
    if (fiber >= 3) score += 1;
  }

  if (total === 0) return [];
  const verdict =
    score / total >= 0.8 ? '식사대용으로 적합합니다.'
    : score / total >= 0.4 ? '간단한 한 끼 대용으로는 무난합니다.'
    : '주식 대용보다 보조 섭취가 적합합니다.';
  return [`종합 적합도 ${score}/${total} — ${verdict}`];
}

// ─────────────────── 전체 ───────────────────

function basicInfo(p) {
  const n = p.nutrition ?? {};
  return [
    `${p.volume}당 칼로리 ${n.calories ?? '-'}kcal, 단백질 ${n.protein ?? '-'}g, 탄수화물 ${n.carbs ?? '-'}g, 당류 ${n.sugar ?? '-'}g, 지방 ${n.fat ?? '-'}g.`,
    '상단 목적을 선택하시면 그 기준에 맞춘 상세 해석이 표시됩니다.',
  ];
}

// section id → analyzer 함수 매핑
const ANALYZERS = {
  // 체중감량
  calorie_sugar: calorieSugar,
  carb_fiber: carbFiber,
  weight_loss_fit: weightLossFit,
  // 근성장
  protein_content: proteinContent,
  bcaa_profile: bcaaProfile,
  post_workout: postWorkout,
  // 혈당관리
  sugar_warning: sugarWarning,
  fiber_glycemic: fiberGlycemic,
  glucose_fit: glucoseFit,
  // 식사대용
  meal_balance: mealBalance,
  satiety: satiety,
  meal_replacement_fit: mealReplacementFit,
  // 전체
  basic_info: basicInfo,
};

// 단일 진입점 — 매핑 없거나 오류 시 빈 배열 반환 (UI는 안내 문구로 fallback)
export function analyzeSection(product, sectionId) {
  const fn = ANALYZERS[sectionId];
  if (!fn || !product) return [];
  try {
    return fn(product);
  } catch {
    return [];
  }
}
