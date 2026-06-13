import { useMemo } from 'react';
import { Badge } from '../../ds/Badge.jsx';
import { IconCheck, IconAlert, IconInfo } from '../../ds/Icons.jsx';
import { useProteinResolver, proteinGradeMeta, cleanProteinLabel } from '../../../data/proteinQuality.js';

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

// 단백질 대비 아미노산 비율(%)
function aminoRatio(value, protein) {
  if (!value || protein <= 0) return null;
  return Math.round((value / 1000 / protein) * 100);
}

// BCAA 구성(류신·이소류신·발린) 한 줄
function bcaaBreakdown(nutrition) {
  const parts = [
    { label: '류신', value: nutrition?.leucine },
    { label: '이소류신', value: nutrition?.isoleucine },
    { label: '발린', value: nutrition?.valine },
  ].filter((item) => typeof item.value === 'number' && item.value > 0);
  if (parts.length === 0) return null;
  return parts.map((item) => `${item.label} ${formatMg(item.value)}`).join(' · ');
}

// 공통 정보 행 — 라벨 + (수치) + (평가 태그) + 한 줄 설명 + 보조 수치
// - value === undefined 면 수치 영역 미표시, value === null 이면 '데이터 없음'
function MetricRow({ label, value, tag, note, sub, primary }) {
  return (
    <div className={`d-analysis-row${primary ? ' is-primary' : ''}`}>
      <div className="d-analysis-row-head">
        <span className="d-analysis-row-label">{label}</span>
        {value !== undefined && (
          <span className="d-analysis-row-metric">
            <span className={`d-analysis-row-value${value === null ? ' is-na' : ''}`}>
              {value === null ? '데이터 없음' : value}
            </span>
            {tag && <span className={`d-analysis-row-tag is-${tag.tone}`}>{tag.label}</span>}
          </span>
        )}
      </div>
      {note && <p className="d-analysis-row-note">{note}</p>}
      {sub && <p className="d-analysis-row-sub">{sub}</p>}
    </div>
  );
}

// 단백질 총량 평가 (1회 제공량 기준)
function proteinTotalVerdict(protein) {
  if (protein >= 25) return { tone: 'good', label: '우수', text: '1회 25g 이상으로 단백질 보충에 충분한 양이에요.' };
  if (protein >= 20) return { tone: 'good', label: '양호', text: '1회 20g 이상으로 무난한 단백질 함량이에요.' };
  if (protein >= 15) return { tone: 'neutral', label: '보통', text: '15~20g 수준으로 간식·보조용으로는 적당해요.' };
  return { tone: 'caution', label: '아쉬움', text: '단백질 함량이 낮은 편이라 보충 목적엔 다소 아쉬워요.' };
}

// 단백질 대비 비율을 설명 끝에 덧붙임
function withRatio(text, ratio) {
  return ratio != null ? `${text} · 단백질 대비 약 ${ratio}%` : text;
}

// [섹션 1] 단백질 성분 — 총량 + EAA·BCAA
function ProteinContentSection({ nutrition }) {
  const protein = nutrition?.protein ?? 0;
  const v = proteinTotalVerdict(protein);
  const breakdown = bcaaBreakdown(nutrition);
  return (
    <AnalysisSection title="단백질 성분" icon={<IconInfo size={16} />}>
      {/* 단백질 총량 — 결이 다른 강조 스트립 */}
      <div className="d-analysis-total">
        <div className="d-analysis-total-head">
          <span className="d-analysis-total-label">단백질 총량</span>
          <span className="d-analysis-total-metric">
            {protein > 0 ? (
              <>
                <strong>{Math.round(protein * 10) / 10}</strong>
                <span className="d-analysis-total-unit">g</span>
                <span className={`d-analysis-row-tag is-${v.tone}`}>{v.label}</span>
              </>
            ) : (
              <span className="d-analysis-total-na">데이터 없음</span>
            )}
          </span>
        </div>
        <p className="d-analysis-total-text">
          {protein > 0 ? v.text : '단백질 총량 데이터가 아직 등록되지 않았어요.'}
        </p>
      </div>
      {/* EAA·BCAA — 행 리스트 */}
      <div className="d-analysis-rows">
        <MetricRow
          label="필수 아미노산(EAA)"
          value={formatMg(nutrition?.eaa) ?? null}
          note={withRatio('필수아미노산 9종 합계', aminoRatio(nutrition?.eaa, protein))}
        />
        <MetricRow
          label="BCAA"
          value={formatMg(nutrition?.bcaa) ?? null}
          note={withRatio('근단백 합성·회복에 관여', aminoRatio(nutrition?.bcaa, protein))}
          sub={breakdown ? `구성 ${breakdown}` : null}
        />
      </div>
    </AnalysisSection>
  );
}

// 단백질 원료 카드 — 원료명 + 약자(WPC 등) + 품질 등급 배지 (근거 텍스트는 미표시)
function ProteinNoteCard({ note }) {
  return (
    <div className="d-analysis-ingr-card is-neutral d-analysis-protein-card">
      <div className="d-analysis-ingr-head d-analysis-protein-head">
        <span className="d-analysis-ingr-name">{note.name}</span>
        {note.abbreviation && <span className="d-analysis-ingr-abbr">{note.abbreviation}</span>}
        {note.grade && <span className={`d-analysis-ingr-grade ${note.grade.cls}`}>{note.grade.label}</span>}
      </div>
    </div>
  );
}

// [섹션 2] 단백질 원료
function ProteinSourceSection({ proteinNotes }) {
  return (
    <AnalysisSection title="단백질 원료" icon={<IconInfo size={16} />}>
      {proteinNotes.length > 0 ? (
        <div className="d-analysis-ingredients">
          {proteinNotes.map((p) => (
            <ProteinNoteCard key={p.name} note={p} />
          ))}
        </div>
      ) : (
        <p className="d-analysis-empty-note">등록된 단백질 원료 정보가 아직 없어요. 원재료명에서 직접 확인해 주세요.</p>
      )}
    </AnalysisSection>
  );
}

// [섹션 3] 기타 영양소 — 매크로·아미노산 외 성분 (칼슘·카르니틴·아르기닌 등)
// 매크로/아미노산 코드는 위 섹션·영양성분 표에서 다루므로 제외
const OTHER_NUTRIENT_EXCLUDE = new Set([
  'energy_kcal', 'protein_g', 'carbohydrate_g', 'sugars_g', 'fat_g', 'dietary_fiber',
  'sodium_mg', 'trans_fat_g', 'saturated_fat_g', 'cholesterol_mg', 'src_알룰로오스_g',
  'src_eaa_mg', 'src_bcaa_mg', 'leucine', 'isoleucine', 'valine', 'lysine', 'methionine',
  'phenylalanine', 'threonine', 'tryptophan', 'histidine',
]);

// EAA/BCAA는 코드가 달라도(이름이 EAA·BCAA) 기타 영양소에서 제외
function isAggAminoName(name) {
  const up = (name || '').trim().toUpperCase();
  return up === 'EAA' || up === 'BCAA';
}

// name_ko 부분일치 → 간단 설명
function otherNutrientInfo(name) {
  if (!name) return null;
  if (name.includes('칼슘')) return '뼈·근육 기능에 관여하는 미네랄. 유청 기반 단백질 제품에 함유되는 경우가 많아요.';
  if (name.includes('카르니틴')) return '지방을 에너지로 전환하는 과정을 돕는 성분으로, 운동 보조 목적으로 첨가돼요.';
  if (name.includes('아르기닌')) return '혈류·혈관 확장과 관련된 아미노산으로, 운동 전 펌핑 보조용으로 쓰여요.';
  if (name.includes('비타민')) return '대사·면역 등 기능에 관여하는 미량 영양소예요.';
  if (name.includes('철')) return '산소 운반에 관여하는 미네랄이에요.';
  if (name.includes('아연')) return '면역·대사 효소 작용에 관여하는 미네랄이에요.';
  if (name.includes('마그네슘')) return '에너지 대사·근육 기능에 관여하는 미네랄이에요.';
  if (name.includes('칼륨')) return '체내 수분·전해질 균형에 관여하는 미네랄이에요.';
  return null;
}

function formatNutrientAmount(fn) {
  if (fn.amount_text) return fn.amount_text;
  const unit = fn.unit || fn.nutrients?.default_unit || '';
  return fn.amount != null ? `${fn.amount}${unit}` : '-';
}

function OtherNutrientsSection({ foodNutrients }) {
  const others = (foodNutrients ?? [])
    .filter((fn) => !OTHER_NUTRIENT_EXCLUDE.has(fn.nutrient_code) && !isAggAminoName(fn.nutrients?.name_ko))
    .sort((a, b) => (a.nutrients?.display_order ?? 999) - (b.nutrients?.display_order ?? 999));

  return (
    <AnalysisSection title="기타 영양소" icon={<IconInfo size={16} />}>
      {others.length > 0 ? (
        <div className="d-analysis-ingredients">
          {others.map((fn) => {
            const name = fn.nutrients?.name_ko || fn.nutrient_code;
            const info = otherNutrientInfo(name);
            return (
              <div key={fn.nutrient_code} className="d-analysis-ingr-card is-neutral">
                <div className="d-analysis-ingr-head">
                  <span className="d-analysis-ingr-name">{name}</span>
                  <strong className="d-analysis-other-amount">{formatNutrientAmount(fn)}</strong>
                </div>
                {info && <p className="d-analysis-ingr-text">{info}</p>}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="d-analysis-empty-note">칼슘·카르니틴·아르기닌 등 추가 영양성분 정보가 아직 없어요.</p>
      )}
    </AnalysisSection>
  );
}

export function AnalysisReport({ nutrition, ingredients, category, categoryCode, foodNutrients }) {
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

  // 단백질 원료 — 라벨 정리(분말/숫자 제거)+중복제거 → 정규 원료로 해석해 약자·품질등급 보강
  const proteinLabels = useMemo(
    () => [...new Set((ing.proteinSources ?? []).map(cleanProteinLabel).filter(Boolean))],
    [ing.proteinSources],
  );
  const resolveProtein = useProteinResolver(proteinLabels);
  const proteinNotes = useMemo(() => proteinLabels.map((name) => {
    const ingr = resolveProtein(name);
    return {
      name,
      abbreviation: ingr?.abbreviation ?? null,
      grade: ingr ? proteinGradeMeta(ingr.qualityGrade) : null,
    };
  }), [proteinLabels, resolveProtein]);

  // 단백질 음료 — 3섹션 구성 (단백질 성분 / 단백질 원료 / 기타 영양소), 종합 평가 없음
  if (isProteinDrink) {
    return (
      <section className="d-detail-card d-detail-report">
        <header className="d-detail-card-head">
          <h2 className="d-detail-card-title">분석 리포트</h2>
          <span className="d-detail-card-sub">{category}</span>
        </header>
        <ProteinContentSection nutrition={n} />
        <ProteinSourceSection proteinNotes={proteinNotes} />
        <OtherNutrientsSection foodNutrients={foodNutrients} />
      </section>
    );
  }

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
              <ProteinNoteCard key={p.name} note={p} />
            ))}
          </div>
        </AnalysisSection>
      )}
    </section>
  );
}
