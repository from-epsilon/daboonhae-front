import { useMemo } from 'react';
import { getCategoryMetrics } from '../../../data/purposes.jsx';
import { Badge } from '../../ds/Badge.jsx';
import { IconCheck, IconAlert, IconInfo } from '../../ds/Icons.jsx';

// 영양 분석 기준값
const THRESHOLDS = {
  calories:     { low: 100, mid: 250, high: 400, unit: 'kcal' },
  protein:      { low: 5,   mid: 15,  high: 25,  unit: 'g' },
  sugar:        { low: 1,   mid: 5,   high: 10,  unit: 'g' },
  fat:          { low: 3,   mid: 10,  high: 20,  unit: 'g' },
  saturatedFat: { low: 1,   mid: 5,   high: 10,  unit: 'g' },
  sodium:       { low: 100, mid: 400, high: 800, unit: 'mg' },
  fiber:        { low: 1,   mid: 3,   high: 5,   unit: 'g' },
  carbs:        { low: 5,   mid: 20,  high: 40,  unit: 'g' },
  cholesterol:  { low: 10,  mid: 50,  high: 100, unit: 'mg' },
  transFat:     { low: 0,   mid: 0.5, high: 1,   unit: 'g' },
};

const NUTRI_LABELS = {
  calories: '칼로리', protein: '단백질', sugar: '당류', fat: '지방',
  saturatedFat: '포화지방', sodium: '나트륨', fiber: '식이섬유',
  carbs: '탄수화물', cholesterol: '콜레스테롤', transFat: '트랜스지방',
};

// 감미료별 특성 설명
const SWEETENER_INFO = {
  '알룰로스': { verdict: 'good', text: '칼로리가 거의 없고 혈당 영향이 적은 천연 감미료입니다. 현재 대체당 중 가장 안전하다고 평가받고 있어요.' },
  '스테비아': { verdict: 'good', text: '식물 추출 감미료로 칼로리가 0에 가깝습니다. 단, 특유의 뒷맛이 있을 수 있어요.' },
  '수크랄로스': { verdict: 'neutral', text: '설탕의 600배 단맛을 가진 인공 감미료입니다. 칼로리는 없지만, 장기 섭취에 대한 연구가 진행 중이에요.' },
  '아스파탐': { verdict: 'caution', text: '칼로리는 없지만, 페닐케톤뇨증 환자는 피해야 합니다. 고온에서 분해되므로 조리용으로는 부적합해요.' },
  '말티톨': { verdict: 'caution', text: '당알코올 중 혈당 영향이 큰 편입니다 (GI 약 35). 다량 섭취 시 소화 불편을 유발할 수 있어요.' },
  '에리스리톨': { verdict: 'good', text: '칼로리가 거의 없고 혈당에 영향이 적습니다. 소화 부담도 다른 당알코올보다 적은 편이에요.' },
  '아세설팜칼륨': { verdict: 'neutral', text: '설탕의 200배 단맛, 칼로리 0입니다. 다른 감미료와 혼합하여 사용되는 경우가 많아요.' },
  '자일리톨': { verdict: 'neutral', text: '충치 예방에 도움이 되지만, 다량 섭취 시 소화 불편이 있을 수 있어요.' },
};

// 단백질 원료별 특성
const PROTEIN_SOURCE_INFO = {
  'WPI': '유청단백 분리물(WPI)은 유청에서 지방·유당을 제거한 고순도 단백질입니다. 흡수가 빠르고 유당 부담이 적어요.',
  'WPC': '유청단백 농축물(WPC)은 가성비가 좋지만 유당이 일부 포함되어 있어, 유당 민감자는 주의가 필요해요.',
  '카제인': '카제인은 흡수가 느려 포만감이 오래 유지됩니다. 취침 전이나 식간 단백질 보충에 적합해요.',
  '대두': '식물성 단백질로 필수 아미노산이 포함되어 있습니다. 대두 알레르기가 있다면 피해야 해요.',
  '닭고기': '동물성 단백질 원료로, 저지방 고단백이 특징입니다.',
  '계란': '아미노산 조성이 우수한 완전 단백질입니다. 난백(흰자)은 거의 순수 단백질이에요.',
};

function getVerdict(key, val) {
  const t = THRESHOLDS[key];
  if (!t || val == null) return null;
  if (key === 'protein' || key === 'fiber') {
    if (val >= t.high) return 'good';
    if (val >= t.mid) return 'neutral';
    return 'low';
  }
  if (val <= t.low) return 'good';
  if (val <= t.mid) return 'neutral';
  return 'caution';
}

function getVerdictLabel(v) {
  if (v === 'good') return { text: '좋음', variant: 'softGreen' };
  if (v === 'neutral') return { text: '보통', variant: 'info' };
  if (v === 'caution') return { text: '주의', variant: 'softOrange' };
  if (v === 'low') return { text: '부족', variant: 'softOrange' };
  return { text: '-', variant: 'outline' };
}

// 영양 분석 코멘트 생성
function getNutrientComment(key, val, category) {
  if (val == null) return '';
  const comments = {
    calories: () => {
      if (val <= 50) return '매우 낮은 칼로리로, 간식이나 음료로 부담 없이 섭취할 수 있어요.';
      if (val <= 150) return '비교적 낮은 칼로리입니다. 체중 관리 중에도 무리 없는 수준이에요.';
      if (val <= 300) return '한 끼 간식이나 가벼운 식사 대용으로 적당한 칼로리예요.';
      return '칼로리가 높은 편이에요. 한 끼 식사 대용이나 운동 전후 에너지 보충에 적합합니다.';
    },
    protein: () => {
      if (val >= 25) return `${val}g은 상당히 높은 단백질 함량입니다. 운동 후 회복이나 근육 유지에 효과적이에요.`;
      if (val >= 15) return `${val}g으로 단백질이 충분한 편입니다. 일반적인 단백질 보충 목적에 적합해요.`;
      if (val >= 5) return `단백질이 ${val}g으로, 간식 수준입니다. 주요 단백질원으로는 부족할 수 있어요.`;
      return '단백질 함량이 매우 적습니다. 단백질 보충이 목적이라면 다른 제품을 고려해보세요.';
    },
    sugar: () => {
      if (val <= 1) return `당류 ${val}g으로 거의 무당에 가깝습니다. 혈당 관리에 안심할 수 있는 수준이에요.`;
      if (val <= 3) return `당류 ${val}g으로 저당 기준을 충족합니다.`;
      if (val <= 5) return `당류 ${val}g입니다. 저당은 아니지만, 일반 제품 대비 적은 편이에요.`;
      if (val <= 10) return `당류 ${val}g으로 약간 높은 편입니다. 혈당 관리 중이라면 섭취량에 주의하세요.`;
      return `당류 ${val}g으로 높은 편이에요. 당류 섭취를 줄이려는 분에게는 적합하지 않을 수 있습니다.`;
    },
    fat: () => {
      if (val <= 2) return '지방이 매우 적어요. 저지방 식단에 적합합니다.';
      if (val <= 8) return '적당한 지방 함량이에요.';
      return `지방이 ${val}g으로 높은 편입니다. 특히 포화지방 비율을 함께 확인해보세요.`;
    },
    sodium: () => {
      if (val <= 100) return '나트륨이 매우 낮아요.';
      if (val <= 300) return '나트륨이 적절한 수준입니다.';
      if (val <= 600) return `나트륨 ${val}mg으로 다소 높은 편이에요. 하루 섭취량(2,000mg)을 고려해서 드세요.`;
      return `나트륨 ${val}mg으로 높습니다. 특히 ${category || '이 카테고리'} 제품 중에서도 높은 편이에요.`;
    },
    fiber: () => {
      if (val >= 5) return `식이섬유 ${val}g으로 풍부합니다. 포만감과 장 건강에 도움이 돼요.`;
      if (val >= 2) return '식이섬유가 적당히 포함되어 있어요.';
      return '식이섬유는 거의 없습니다.';
    },
    saturatedFat: () => {
      if (val <= 1) return '포화지방이 매우 적어요.';
      if (val <= 4) return '포화지방이 보통 수준입니다.';
      return `포화지방 ${val}g으로 높은 편이에요. 하루 권장량(15g)의 ${Math.round(val / 15 * 100)}%에 해당합니다.`;
    },
    transFat: () => {
      if (val === 0) return '트랜스지방 0g으로 안심할 수 있어요.';
      return `트랜스지방이 ${val}g 포함되어 있어요. 가급적 0에 가까운 제품을 권장합니다.`;
    },
    cholesterol: () => {
      if (val <= 10) return '콜레스테롤이 거의 없어요.';
      if (val <= 50) return '콜레스테롤이 보통 수준이에요.';
      return `콜레스테롤 ${val}mg으로, 동물성 원료가 포함된 제품입니다. 하루 권장량(300mg) 대비 ${Math.round(val / 300 * 100)}%예요.`;
    },
    carbs: () => {
      if (val <= 5) return '탄수화물이 매우 적어요. 저탄수 식단에 적합합니다.';
      if (val <= 15) return '탄수화물이 적당한 수준입니다.';
      return `탄수화물 ${val}g입니다. 당류 함량과 함께 확인하는 것이 좋아요.`;
    },
  };
  return comments[key]?.() ?? '';
}

// 종합 강점/주의사항 자동 생성
function generateInsights(nutrition, ingredients, category) {
  const strengths = [];
  const cautions = [];
  const n = nutrition ?? {};
  const ing = ingredients ?? {};

  if (n.protein >= 20) strengths.push('고단백 제품으로, 근육 유지와 포만감에 도움이 됩니다.');
  if (n.sugar <= 1) strengths.push('당류가 거의 없어 혈당 부담이 적습니다.');
  else if (n.sugar <= 3) strengths.push('저당 기준을 충족하는 제품입니다.');
  if (n.calories <= 100) strengths.push('100kcal 이하의 저칼로리 제품입니다.');
  if (n.fiber >= 5) strengths.push('식이섬유가 풍부하여 포만감에 도움이 됩니다.');
  if (n.transFat === 0) strengths.push('트랜스지방이 0g입니다.');
  if (ing.lactoseFree === true) strengths.push('유당이 없어 유당 불내증이 있는 분도 섭취 가능합니다.');
  if (n.sodium <= 100) strengths.push('나트륨 함량이 매우 낮습니다.');

  if (n.sugar >= 10) cautions.push(`당류 ${n.sugar}g으로 높은 편이에요. 혈당 관리 중이라면 주의가 필요합니다.`);
  if (n.sodium >= 600) cautions.push(`나트륨 ${n.sodium}mg으로 높은 편이에요. 하루 총 섭취량을 고려하세요.`);
  if (n.saturatedFat >= 7) cautions.push(`포화지방 ${n.saturatedFat}g으로, 하루 권장량의 상당 부분에 해당합니다.`);
  if (n.fat >= 15) cautions.push(`지방 ${n.fat}g으로 높은 편이에요. 칼로리 관리에 영향을 줄 수 있습니다.`);
  if (ing.sweeteners?.some(s => s === '말티톨')) cautions.push('말티톨이 포함되어 있어 다른 대체당보다 혈당 영향이 클 수 있어요.');
  if (ing.sweeteners?.some(s => s === '아스파탐')) cautions.push('아스파탐이 포함되어 있습니다. 페닐케톤뇨증 환자는 섭취를 피해야 합니다.');

  return { strengths, cautions };
}

// 목적별 적합도
function getPurposeFit(nutrition, ingredients) {
  const n = nutrition ?? {};
  const fits = [];

  // 체중감량
  const wlScore = (n.calories <= 150 ? 2 : n.calories <= 250 ? 1 : 0)
    + (n.sugar <= 3 ? 2 : n.sugar <= 5 ? 1 : 0)
    + (n.protein >= 15 ? 1 : 0);
  fits.push({
    label: '체중감량',
    level: wlScore >= 4 ? 'high' : wlScore >= 2 ? 'mid' : 'low',
    reason: wlScore >= 4
      ? '저칼로리·저당으로 체중 관리에 적합한 제품이에요.'
      : wlScore >= 2
        ? '보통 수준이에요. 칼로리나 당류 중 하나가 다소 높을 수 있어요.'
        : '체중 관리 목적으로는 칼로리 또는 당류가 높은 편이에요.',
  });

  // 근성장
  const msScore = (n.protein >= 25 ? 3 : n.protein >= 15 ? 2 : n.protein >= 10 ? 1 : 0);
  fits.push({
    label: '근성장/단백질 보충',
    level: msScore >= 3 ? 'high' : msScore >= 2 ? 'mid' : 'low',
    reason: msScore >= 3
      ? '25g 이상의 고단백으로 근육 합성에 효과적이에요.'
      : msScore >= 2
        ? '단백질이 적당히 포함되어 있어요.'
        : '단백질 함량이 부족한 편이에요.',
  });

  // 혈당 관리
  const bgScore = (n.sugar <= 1 ? 3 : n.sugar <= 3 ? 2 : n.sugar <= 5 ? 1 : 0)
    + (n.fiber >= 3 ? 1 : 0);
  fits.push({
    label: '혈당 관리',
    level: bgScore >= 3 ? 'high' : bgScore >= 2 ? 'mid' : 'low',
    reason: bgScore >= 3
      ? '당류가 매우 낮아 혈당 관리에 적합합니다.'
      : bgScore >= 2
        ? '당류가 적은 편이지만, 완전한 저당은 아닙니다.'
        : '당류가 높아 혈당 관리에는 적합하지 않을 수 있어요.',
  });

  // 식사대용
  const mrScore = (n.calories >= 200 ? 1 : 0)
    + (n.protein >= 15 ? 1 : 0)
    + (n.carbs >= 15 ? 1 : 0)
    + (n.fiber >= 3 ? 1 : 0);
  fits.push({
    label: '식사 대용',
    level: mrScore >= 3 ? 'high' : mrScore >= 2 ? 'mid' : 'low',
    reason: mrScore >= 3
      ? '칼로리·단백질·탄수화물이 균형 잡혀 식사 대용으로 적합해요.'
      : mrScore >= 2
        ? '어느 정도 식사 대용이 가능하지만, 영양 균형이 완벽하지는 않아요.'
        : '간식 수준이에요. 식사를 대체하기에는 영양이 부족합니다.',
  });

  return fits;
}

const FIT_STYLES = {
  high: { bg: 'var(--green-50)', color: 'var(--green-700)', label: '적합' },
  mid: { bg: 'var(--blue-50)', color: 'var(--blue-700)', label: '보통' },
  low: { bg: 'var(--gray-100)', color: 'var(--text-tertiary)', label: '부적합' },
};

// 섹션 카드 래퍼
function AnalysisSection({ title, icon, children }) {
  return (
    <div className="d-analysis-section">
      <h3 className="d-analysis-section-title">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

export function AnalysisReport({ nutrition, ingredients, category }) {
  const n = nutrition ?? {};
  const ing = ingredients ?? {};

  const { strengths, cautions } = useMemo(
    () => generateInsights(n, ing, category),
    [n, ing, category],
  );

  const nutrientAnalysis = useMemo(() => {
    const keys = ['calories', 'protein', 'carbs', 'sugar', 'fat', 'saturatedFat', 'transFat', 'sodium', 'fiber', 'cholesterol'];
    return keys
      .filter((k) => n[k] !== undefined)
      .map((k) => ({
        key: k,
        label: NUTRI_LABELS[k],
        value: n[k],
        unit: THRESHOLDS[k]?.unit ?? '',
        verdict: getVerdict(k, n[k]),
        comment: getNutrientComment(k, n[k], category),
      }));
  }, [n, category]);

  const purposeFits = useMemo(() => getPurposeFit(n, ing), [n, ing]);

  const sweetenerNotes = useMemo(() => {
    if (!ing.sweeteners?.length) return [];
    return ing.sweeteners.map((s) => ({
      name: s,
      ...(SWEETENER_INFO[s] ?? { verdict: 'neutral', text: '추후 정보가 추가될 예정입니다.' }),
    }));
  }, [ing.sweeteners]);

  const proteinNotes = useMemo(() => {
    if (!ing.proteinSources?.length) return [];
    return ing.proteinSources.map((s) => ({
      name: s,
      text: PROTEIN_SOURCE_INFO[s] ?? '추후 정보가 추가될 예정입니다.',
    }));
  }, [ing.proteinSources]);

  return (
    <section className="d-detail-card d-detail-report">
      <header className="d-detail-card-head">
        <h2 className="d-detail-card-title">분석 리포트</h2>
        <span className="d-detail-card-sub">{category}</span>
      </header>

      {/* 종합 평가 */}
      <AnalysisSection title="종합 평가" icon={<IconInfo size={16} />}>
        {strengths.length > 0 && (
          <div className="d-analysis-list">
            {strengths.map((s, i) => (
              <div key={i} className="d-analysis-item is-good">
                <IconCheck size={14} stroke={2.5} />
                <span>{s}</span>
              </div>
            ))}
          </div>
        )}
        {cautions.length > 0 && (
          <div className="d-analysis-list" style={{ marginTop: strengths.length > 0 ? 12 : 0 }}>
            {cautions.map((c, i) => (
              <div key={i} className="d-analysis-item is-caution">
                <IconAlert size={14} stroke={2.5} />
                <span>{c}</span>
              </div>
            ))}
          </div>
        )}
        {strengths.length === 0 && cautions.length === 0 && (
          <p className="d-analysis-empty">특이사항 없음</p>
        )}
      </AnalysisSection>

      {/* 영양성분 분석 */}
      <AnalysisSection title="영양성분 분석" icon={<IconInfo size={16} />}>
        <div className="d-analysis-nutrients">
          {nutrientAnalysis.map((item) => {
            const vl = getVerdictLabel(item.verdict);
            return (
              <div key={item.key} className="d-analysis-nutri-row">
                <div className="d-analysis-nutri-head">
                  <span className="d-analysis-nutri-label">{item.label}</span>
                  <span className="d-analysis-nutri-value">
                    {item.value}{item.unit}
                  </span>
                  <Badge variant={vl.variant}>{vl.text}</Badge>
                </div>
                {item.comment && (
                  <p className="d-analysis-nutri-comment">{item.comment}</p>
                )}
              </div>
            );
          })}
        </div>
      </AnalysisSection>

      {/* 감미료 분석 */}
      {sweetenerNotes.length > 0 && (
        <AnalysisSection title="감미료 분석" icon={<IconAlert size={16} />}>
          <div className="d-analysis-ingredients">
            {sweetenerNotes.map((s) => (
              <div key={s.name} className={`d-analysis-ingr-card is-${s.verdict}`}>
                <div className="d-analysis-ingr-head">
                  <span className="d-analysis-ingr-name">{s.name}</span>
                  <Badge variant={s.verdict === 'good' ? 'softGreen' : s.verdict === 'caution' ? 'softOrange' : 'info'}>
                    {s.verdict === 'good' ? '양호' : s.verdict === 'caution' ? '주의' : '보통'}
                  </Badge>
                </div>
                <p className="d-analysis-ingr-text">{s.text}</p>
              </div>
            ))}
          </div>
        </AnalysisSection>
      )}

      {/* 단백질원 분석 */}
      {proteinNotes.length > 0 && (
        <AnalysisSection title="단백질원 분석" icon={<IconInfo size={16} />}>
          <div className="d-analysis-ingredients">
            {proteinNotes.map((p) => (
              <div key={p.name} className="d-analysis-ingr-card is-neutral">
                <span className="d-analysis-ingr-name">{p.name}</span>
                <p className="d-analysis-ingr-text">{p.text}</p>
              </div>
            ))}
          </div>
        </AnalysisSection>
      )}

      {/* 목적별 적합도 */}
      <AnalysisSection title="목적별 적합도" icon={<IconInfo size={16} />}>
        <div className="d-analysis-purpose-grid">
          {purposeFits.map((f) => {
            const st = FIT_STYLES[f.level];
            return (
              <div key={f.label} className="d-analysis-purpose-card" style={{ background: st.bg }}>
                <div className="d-analysis-purpose-head">
                  <span className="d-analysis-purpose-label">{f.label}</span>
                  <span className="d-analysis-purpose-badge" style={{ color: st.color }}>{st.label}</span>
                </div>
                <p className="d-analysis-purpose-reason">{f.reason}</p>
              </div>
            );
          })}
        </div>
      </AnalysisSection>
    </section>
  );
}
