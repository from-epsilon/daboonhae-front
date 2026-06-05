import { useMemo } from 'react';
import { Badge } from '../../ds/Badge.jsx';
import { IconCheck, IconAlert, IconInfo } from '../../ds/Icons.jsx';

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

function SummaryColumn({ title, type, items, empty }) {
  const Icon = type === 'good' ? IconCheck : IconAlert;
  return (
    <div className={`d-analysis-summary-col is-${type}`}>
      <h4 className="d-analysis-summary-title">{title}</h4>
      <ul className="d-analysis-summary-list">
        {(items.length > 0 ? items : [empty]).map((item, i) => (
          <li key={i} className="d-analysis-summary-item">
            <Icon size={14} stroke={2.5} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatMg(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return null;
  return value >= 1000 ? `${Math.round(value).toLocaleString()}mg` : `${Math.round(value * 10) / 10}mg`;
}

function aminoAcidComment(kind, value, protein) {
  if (!value) return `${kind} 함량 데이터가 아직 등록되지 않았어요.`;
  const gram = value / 1000;
  const ratio = protein > 0 ? Math.round((gram / protein) * 100) : null;
  if (kind === 'EAA') {
    return ratio
      ? <>필수아미노산이 <strong>단백질 대비 비율</strong> 약 {ratio}% 수준으로 표시돼요. 단백질 품질을 볼 때 함께 확인하면 좋아요.</>
      : '필수아미노산 총량이 등록되어 있어요.';
  }
  return ratio
    ? <>BCAA가 <strong>단백질 대비 비율</strong> 약 {ratio}% 수준으로 표시돼요. 운동 후 회복 관점에서 참고할 수 있어요.</>
    : 'BCAA 총량이 등록되어 있어요.';
}

function aminoAcidIntro(kind) {
  if (kind === 'EAA') {
    return <>EAA는 몸에서 충분히 만들 수 없어 식품으로 섭취해야 하는 <strong>필수아미노산 9종</strong>의 합계예요. 단백질 총량이 같아도 EAA가 충분해야 단백질 품질을 더 좋게 볼 수 있어요.</>;
  }
  return <>BCAA는 EAA 중 <strong>류신·이소류신·발린</strong> 3종을 따로 묶어 보는 값이에요. 특히 류신은 근단백 합성 신호와 관련이 있어 단백질 음료에서 자주 확인하는 지표예요.</>;
}

function aminoAcidDetail(kind, nutrition) {
  if (kind !== 'BCAA') return <>류신·이소류신·발린을 포함해 <strong>필수아미노산 9종</strong>을 모두 합산한 값입니다.</>;
  const parts = [
    { label: '류신', value: nutrition?.leucine },
    { label: '이소류신', value: nutrition?.isoleucine },
    { label: '발린', value: nutrition?.valine },
  ].filter((item) => typeof item.value === 'number' && item.value > 0);
  if (parts.length === 0) return <>BCAA 총량은 <strong>류신·이소류신·발린</strong>을 합산해 계산합니다.</>;
  return <>류신·이소류신·발린 구성: {parts.map((item) => `${item.label} ${formatMg(item.value)}`).join(' + ')}</>;
}

function AminoAcidAnalysis({ nutrition }) {
  const protein = nutrition?.protein ?? 0;
  const items = [
    { label: 'EAA', value: nutrition?.eaa },
    { label: 'BCAA', value: nutrition?.bcaa },
  ];

  return (
    <AnalysisSection title="BCAA/EAA 함량" icon={<IconInfo size={16} />}>
      <div className="d-analysis-amino-grid">
        {items.map((item) => {
          const hasValue = typeof item.value === 'number' && item.value > 0;
          return (
            <div key={item.label} className="d-analysis-amino-card">
              <div className="d-analysis-amino-head">
                <span className="d-analysis-amino-label">{item.label}</span>
                <strong>{formatMg(item.value) ?? '데이터 없음'}</strong>
              </div>
              <p className="d-analysis-amino-intro">{aminoAcidIntro(item.label)}</p>
              <p className="d-analysis-amino-detail">{aminoAcidDetail(item.label, nutrition)}</p>
              <p>{aminoAcidComment(item.label, hasValue ? item.value : 0, protein)}</p>
            </div>
          );
        })}
      </div>
    </AnalysisSection>
  );
}

export function AnalysisReport({ nutrition, ingredients, category, categoryCode }) {
  const n = nutrition ?? {};
  const ing = ingredients ?? {};
  const isProteinDrink = categoryCode === 'protein_drink' || category === '단백질 음료';

  const { strengths, cautions } = useMemo(
    () => generateInsights(n, ing, category),
    [n, ing, category],
  );

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
        <div className="d-analysis-summary-grid">
          <SummaryColumn
            title="좋은 점"
            type="good"
            items={strengths}
            empty="눈에 띄는 강점은 많지 않아요. 아래 항목별 분석을 확인해보세요."
          />
          <SummaryColumn
            title="확인할 점"
            type="caution"
            items={cautions}
            empty="현재 기준으로 큰 주의 포인트는 많지 않아요."
          />
        </div>
      </AnalysisSection>

      {isProteinDrink && <AminoAcidAnalysis nutrition={n} />}

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
    </section>
  );
}
