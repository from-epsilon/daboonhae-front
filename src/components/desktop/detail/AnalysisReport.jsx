import { useMemo } from 'react';
import { IconCheck, IconAlert, IconInfo } from '../../ds/Icons.jsx';
import { getAdapted } from '../../../data/adapters.js';
import { EAA_KEYS, BCAA_KEYS } from '../../../data/aminoAcids.js';
import { cheapestUnitPrice } from '../../../data/categoryCardMetrics.js';
import { useResolvedProteinSources, useResolvedSweeteners, proteinGradeMeta } from '../../../data/proteinQuality.js';
import { IngredientList } from './IngredientList.jsx';

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

const RANK_BASES = [
  { key: 'protein', label: '단백질', unit: 'g' },
  { key: 'eaa', label: 'EAA', unit: 'mg' },
  { key: 'leucine', label: '류신', unit: 'mg' },
  { key: 'bcaa', label: 'BCAA', unit: 'mg' },
];

const RANK_MODES = [
  { key: 'total', label: '총량' },
  { key: 'kcal', label: '100kcal당' },
  { key: 'price', label: '1,000원당' },
];

const NUTRIENT_COLORS = {
  carbs: {
    main: '#fb923c',
    sugar: '#ea580c',
    fiber: '#a16207',
    allulose: '#facc15',
    sugarAlcohol: '#f59e0b',
  },
  protein: {
    main: '#22c55e',
    eaa: '#16a34a',
    bcaa: '#0f766e',
    other: '#bbf7d0',
  },
  fat: {
    main: '#60a5fa',
  },
  neutral: {
    main: '#d1d5db',
    muted: '#cbd5e1',
    pale: '#e5e7eb',
  },
};

// 종합 강점/주의사항 자동 생성
function generateInsights(nutrition, ingredients) {
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

function AnalysisSection({ title, icon, children, compact = false }) {
  return (
    <div className={`d-analysis-section${compact ? ' is-compact' : ''}`}>
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

function round1(value) {
  return Math.round(value * 10) / 10;
}

function formatG(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return null;
  return `${round1(value).toLocaleString()}g`;
}

function formatG0(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '-';
  return `${round1(value).toLocaleString()}g`;
}

function formatKcal(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '-';
  return `${Math.round(value).toLocaleString()}kcal`;
}

function formatMg(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return null;
  return `${Math.round(value).toLocaleString()}mg`;
}

function formatRankValue(value, unit) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return null;
  if (unit === 'kcal') return `${Math.round(value).toLocaleString()}kcal`;
  if (unit === 'mg') return `${Math.round(value).toLocaleString()}mg`;
  return `${round1(value).toLocaleString()}g`;
}

function aminoRatio(value, protein) {
  if (!value || protein <= 0) return null;
  return Math.round((value / 1000 / protein) * 100);
}

function allPositive(n, keys) {
  return keys.every((key) => typeof n?.[key] === 'number' && n[key] > 0);
}

function countPositive(n, keys) {
  return keys.filter((key) => typeof n?.[key] === 'number' && n[key] > 0).length;
}

function proteinCriterion(protein) {
  if (!(protein > 0)) {
    return {
      tone: 'neutral',
      label: '단백질 정보 없음',
      summary: '단백질 총량이 없어 1회 섭취량 판단은 제외했어요.',
      basis: '운동용 1회 단백질 20g 이상',
    };
  }
  if (protein < 10) {
    return {
      tone: 'poor',
      label: '보충용으론 낮음',
      summary: `단백질 ${formatG(protein)}입니다. 단백질 보충용으로 보기엔 낮고, 일반 음료에 가까운 함량이에요.`,
      basis: '운동용 1회 단백질 20g 이상',
    };
  }
  if (protein < 15) {
    return {
      tone: 'light',
      label: '가벼운 간식 수준',
      summary: `단백질 ${formatG(protein)}입니다. 보충용 메인 제품보다는 가볍게 단백질을 더하는 수준으로 보는 게 좋아요.`,
      basis: '운동용 1회 단백질 20g 이상',
    };
  }
  if (protein < 20) {
    const diff = round1(20 - protein);
    return {
      tone: 'near',
      label: '20g 기준 근접',
      summary: `단백질 ${formatG(protein)}입니다. 운동용 1회 기준으로 자주 보는 20g보다 ${diff}g 낮아요.`,
      basis: '운동용 1회 단백질 20g 이상',
    };
  }
  if (protein < 25) {
    return {
      tone: 'solid',
      label: '양호',
      summary: `단백질 ${formatG(protein)}입니다. 운동용 단백질 제품에서 자주 보는 20g 기준을 넘는 양호한 함량이에요.`,
      basis: '운동용 1회 단백질 20g 이상',
    };
  }
  if (protein < 35) {
    return {
      tone: 'strong',
      label: '넉넉한 함량',
      summary: `단백질 ${formatG(protein)}입니다. 한 번에 단백질을 꽤 채울 수 있는 넉넉한 함량이에요.`,
      basis: '운동용 1회 단백질 20-40g',
    };
  }
  if (protein <= 40) {
    return {
      tone: 'high',
      label: '고함량',
      summary: `단백질 ${formatG(protein)}입니다. 1회 기준 상단에 가까운 고함량 제품이에요.`,
      basis: '운동용 1회 단백질 20-40g',
    };
  }
  return {
    tone: 'very-high',
    label: '매우 높음',
    summary: `단백질 ${formatG(protein)}입니다. 1회 기준 상단으로 자주 보는 40g을 넘으니 하루 총 섭취량과 함께 보세요.`,
    basis: '운동용 1회 단백질 20-40g',
  };
}

function proteinQuickText(tone) {
  if (tone === 'poor') return '보충용 메인으로는 낮아요.';
  if (tone === 'light') return '가볍게 더하는 정도예요.';
  if (tone === 'near') return '기본선에 가까워요.';
  if (tone === 'solid') return '양호한 함량이에요.';
  if (tone === 'strong') return '한 번에 채우기 넉넉해요.';
  if (tone === 'high') return '고함량 제품이에요.';
  if (tone === 'very-high') return '매우 높은 함량이에요.';
  return '단백질 총량 데이터가 필요해요.';
}

function eaaAmountCriterion(eaa) {
  if (!(eaa > 0)) {
    return {
      tone: 'caution',
      label: '정보 없음',
      summary: '필수아미노산 데이터가 없어요.',
      basis: '필수아미노산 총량 기준',
    };
  }
  if (eaa < 4000) {
    return {
      tone: 'poor',
      label: '낮음',
      summary: '단백질 보충 제품 기준으로는 낮은 편이에요.',
      basis: '단백질 음료 분포 기반 EAA 4,000 / 6,000 / 8,000 / 10,000 / 14,000 / 18,000mg 기준',
    };
  }
  if (eaa < 6000) {
    return {
      tone: 'light',
      label: '낮은 편',
      summary: '단백질 양에 비해 필수아미노산 총량은 낮은 쪽에 가까워요.',
      basis: '단백질 음료 분포 기반 EAA 4,000 / 6,000 / 8,000 / 10,000 / 14,000 / 18,000mg 기준',
    };
  }
  if (eaa < 8000) {
    return {
      tone: 'near',
      label: '양호권 근접',
      summary: '현재 단백질 음료 분포에서 양호한 구간에 가까워지는 필수아미노산 함량이에요.',
      basis: '단백질 음료 분포 기반 EAA 4,000 / 6,000 / 8,000 / 10,000 / 14,000 / 18,000mg 기준',
    };
  }
  if (eaa < 10000) {
    return {
      tone: 'solid',
      label: '양호',
      summary: '현재 단백질 음료 분포에서 양호한 수준의 필수아미노산 함량이에요.',
      basis: '단백질 음료 분포 기반 EAA 4,000 / 6,000 / 8,000 / 10,000 / 14,000 / 18,000mg 기준',
    };
  }
  if (eaa < 14000) {
    return {
      tone: 'strong',
      label: '높은 편',
      summary: '현재 단백질 음료 분포에서 높은 편에 들어가는 필수아미노산 함량이에요.',
      basis: '단백질 음료 분포 기반 EAA 4,000 / 6,000 / 8,000 / 10,000 / 14,000 / 18,000mg 기준',
    };
  }
  if (eaa < 18000) {
    return {
      tone: 'high',
      label: '고함량',
      summary: '현재 단백질 음료 분포에서 상위권에 가까운 필수아미노산 함량이에요.',
      basis: '단백질 음료 분포 기반 EAA 4,000 / 6,000 / 8,000 / 10,000 / 14,000 / 18,000mg 기준',
    };
  }
  return {
    tone: 'very-high',
    label: '매우 높음',
    summary: '현재 단백질 음료 분포에서 상위권에 해당하는 매우 높은 필수아미노산 함량이에요.',
    basis: '단백질 음료 분포 기반 EAA 4,000 / 6,000 / 8,000 / 10,000 / 14,000 / 18,000mg 기준',
  };
}

function bcaaAmountCriterion(bcaa) {
  if (!(bcaa > 0)) {
    return {
      tone: 'caution',
      label: '정보 없음',
      summary: 'BCAA 데이터가 없어요.',
      basis: 'BCAA 총량 기준',
    };
  }
  if (bcaa < 2000) {
    return {
      tone: 'poor',
      label: '낮음',
      summary: '단백질 음료 기준으로는 낮은 편이에요.',
      basis: '단백질 음료 분포 기반 BCAA 2,000 / 3,000 / 4,000 / 5,000 / 7,000 / 9,000mg 기준',
    };
  }
  if (bcaa < 3000) {
    return {
      tone: 'light',
      label: '낮은 편',
      summary: 'BCAA가 있는 제품군 안에서는 낮은 쪽에 가까워요.',
      basis: '단백질 음료 분포 기반 BCAA 2,000 / 3,000 / 4,000 / 5,000 / 7,000 / 9,000mg 기준',
    };
  }
  if (bcaa < 4000) {
    return {
      tone: 'near',
      label: '양호권 근접',
      summary: '현재 단백질 음료 분포에서 양호한 구간에 가까워지는 BCAA 함량이에요.',
      basis: '단백질 음료 분포 기반 BCAA 2,000 / 3,000 / 4,000 / 5,000 / 7,000 / 9,000mg 기준',
    };
  }
  if (bcaa < 5000) {
    return {
      tone: 'solid',
      label: '양호',
      summary: '현재 단백질 음료 분포에서 양호한 수준의 BCAA 함량이에요.',
      basis: '단백질 음료 분포 기반 BCAA 2,000 / 3,000 / 4,000 / 5,000 / 7,000 / 9,000mg 기준',
    };
  }
  if (bcaa < 7000) {
    return {
      tone: 'strong',
      label: '높은 편',
      summary: '현재 단백질 음료 분포에서 높은 편에 들어가는 BCAA 함량이에요.',
      basis: '단백질 음료 분포 기반 BCAA 2,000 / 3,000 / 4,000 / 5,000 / 7,000 / 9,000mg 기준',
    };
  }
  if (bcaa < 9000) {
    return {
      tone: 'high',
      label: '고함량',
      summary: '현재 단백질 음료 분포에서 상위권에 가까운 BCAA 함량이에요.',
      basis: '단백질 음료 분포 기반 BCAA 2,000 / 3,000 / 4,000 / 5,000 / 7,000 / 9,000mg 기준',
    };
  }
  return {
    tone: 'very-high',
    label: '매우 높음',
    summary: '현재 단백질 음료 분포에서 상위권에 해당하는 매우 높은 BCAA 함량이에요.',
    basis: '단백질 음료 분포 기반 BCAA 2,000 / 3,000 / 4,000 / 5,000 / 7,000 / 9,000mg 기준',
  };
}

function leucineAmountCriterion(leucine) {
  if (!(leucine > 0)) {
    return {
      tone: 'neutral',
      label: '정보 없음',
      summary: '류신 개별 수치가 없어요.',
      basis: '류신 개별 수치 기준',
    };
  }
  if (leucine < 700) {
    return {
      tone: 'poor',
      label: '매우 낮음',
      summary: '류신 함량이 매우 낮아 단백질 보충용으로 보기엔 부족한 편이에요.',
      basis: '류신 700mg 미만 / 700~1,499 / 1,500~1,999 / 2,000~2,399 / 2,400~2,999 / 3,000~3,499 / 3,500mg 이상 기준',
    };
  }
  if (leucine < 1500) {
    return {
      tone: 'light',
      label: '낮은 편',
      summary: '일반적인 단백질 보충 기준으로도 류신이 낮은 편이에요.',
      basis: '류신 700mg 미만 / 700~1,499 / 1,500~1,999 / 2,000~2,399 / 2,400~2,999 / 3,000~3,499 / 3,500mg 이상 기준',
    };
  }
  if (leucine < 2000) {
    return {
      tone: 'near',
      label: '기본선 근접',
      summary: '일반 보충 기준으로 보기 좋은 2g에 가까워지는 함량이에요.',
      basis: '류신 700mg 미만 / 700~1,499 / 1,500~1,999 / 2,000~2,399 / 2,400~2,999 / 3,000~3,499 / 3,500mg 이상 기준',
    };
  }
  if (leucine < 2400) {
    return {
      tone: 'solid',
      label: '충분',
      summary: '일반적인 단백질 보충 기준으로는 충분한 류신 함량이에요.',
      basis: '류신 700mg 미만 / 700~1,499 / 1,500~1,999 / 2,000~2,399 / 2,400~2,999 / 3,000~3,499 / 3,500mg 이상 기준',
    };
  }
  if (leucine < 3000) {
    return {
      tone: 'strong',
      label: '넉넉함',
      summary: '일반적인 단백질 보충 기준을 넘는 넉넉한 류신 함량이에요.',
      basis: '류신 700mg 미만 / 700~1,499 / 1,500~1,999 / 2,000~2,399 / 2,400~2,999 / 3,000~3,499 / 3,500mg 이상 기준',
    };
  }
  if (leucine < 3500) {
    return {
      tone: 'high',
      label: '높은 편',
      summary: '운동 후 기준의 상단에 가까워지는 높은 류신 함량이에요.',
      basis: '류신 700mg 미만 / 700~1,499 / 1,500~1,999 / 2,000~2,399 / 2,400~2,999 / 3,000~3,499 / 3,500mg 이상 기준',
    };
  }
  return {
    tone: 'very-high',
    label: '매우 높음',
    summary: '운동 후 기준에서도 상단에 가까운 매우 높은 류신 함량이에요.',
    basis: '류신 700mg 미만 / 700~1,499 / 1,500~1,999 / 2,000~2,399 / 2,400~2,999 / 3,000~3,499 / 3,500mg 이상 기준',
  };
}

function formatPercent(value) {
  if (!Number.isFinite(value)) return '0%';
  return `${round1(value).toLocaleString()}%`;
}

function proteinCompositionData(nutrition) {
  const protein = nutrition?.protein ?? 0;
  if (!(protein > 0)) {
    return {
      total: 0,
      outerSegments: [{ key: 'unknown', label: '단백질 정보 없음', percent: 100, color: NUTRIENT_COLORS.neutral.pale }],
      innerSegments: [],
      rows: [{
        key: 'unknown',
        label: '단백질 정보 없음',
        displayValue: '-',
        color: NUTRIENT_COLORS.neutral.pale,
      }],
    };
  }

  const eaaG = Math.min(Math.max((nutrition?.eaa ?? 0) / 1000, 0), protein);
  const bcaaG = Math.min(Math.max((nutrition?.bcaa ?? 0) / 1000, 0), protein);
  const hasEaa = eaaG > 0;
  const hasBcaa = bcaaG > 0;
  const knownEaa = hasEaa ? eaaG : 0;
  const knownBcaa = hasEaa && hasBcaa ? Math.min(bcaaG, knownEaa) : 0;
  const otherProtein = Math.max(protein - knownEaa, 0);
  const eaaPercentOfProtein = (knownEaa / protein) * 100;
  const bcaaPercentOfProtein = (knownBcaa / protein) * 100;
  const bcaaPercentOfEaa = knownEaa > 0 ? (knownBcaa / knownEaa) * 100 : 0;

  const outerSegments = hasEaa
    ? [
      { key: 'eaa', label: '필수아미노산', percent: eaaPercentOfProtein, color: NUTRIENT_COLORS.protein.eaa },
      { key: 'other-amino', label: '기타 아미노산', percent: 100 - eaaPercentOfProtein, color: NUTRIENT_COLORS.protein.other },
    ].filter((item) => item.percent > 0)
    : [{ key: 'eaa-missing', label: '필수아미노산 정보 없음', percent: 100, color: NUTRIENT_COLORS.neutral.pale }];

  const innerSegments = hasEaa
    ? [
      { key: 'bcaa', label: 'BCAA', percent: bcaaPercentOfProtein, color: NUTRIENT_COLORS.protein.bcaa },
    ].filter((item) => item.percent > 0)
    : [];

  const rows = [
    hasEaa ? {
      key: 'eaa',
      label: '필수아미노산',
      displayValue: `${formatG(knownEaa)} · ${formatPercent(eaaPercentOfProtein)}`,
      color: NUTRIENT_COLORS.protein.eaa,
    } : {
      key: 'eaa-missing',
      label: '필수아미노산',
      displayValue: '정보 없음',
      color: NUTRIENT_COLORS.neutral.muted,
    },
    hasEaa && knownBcaa > 0 ? {
      key: 'bcaa',
      label: 'BCAA',
      displayValue: `${formatG(knownBcaa)} · ${formatPercent(bcaaPercentOfProtein)}`,
      color: NUTRIENT_COLORS.protein.bcaa,
      child: true,
    } : !hasEaa && hasBcaa ? {
      key: 'bcaa-orphan',
      label: 'BCAA',
      displayValue: `${formatG(bcaaG)}`,
      color: NUTRIENT_COLORS.protein.bcaa,
      child: true,
    } : {
      key: 'bcaa-missing',
      label: 'BCAA',
      displayValue: '정보 없음',
      color: NUTRIENT_COLORS.neutral.muted,
      child: true,
    },
    hasEaa && otherProtein > 0 ? {
      key: 'other-amino',
      label: '기타 아미노산',
      displayValue: `${formatG(otherProtein)} · ${formatPercent((otherProtein / protein) * 100)}`,
      help: '비필수 아미노산과 조건부 필수 아미노산을 포함해 표시합니다.',
      color: NUTRIENT_COLORS.protein.other,
    } : null,
  ].filter(Boolean);

  return { total: protein, outerSegments, innerSegments, rows };
}

function polarToCartesian(cx, cy, r, angle) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + (r * Math.cos(rad)),
    y: cy + (r * Math.sin(rad)),
  };
}

function donutSlicePath(cx, cy, outerRadius, innerRadius, startAngle, endAngle) {
  const angle = endAngle - startAngle;
  if (angle >= 359.99) {
    return [
      `M ${cx} ${cy - outerRadius}`,
      `A ${outerRadius} ${outerRadius} 0 1 1 ${cx} ${cy + outerRadius}`,
      `A ${outerRadius} ${outerRadius} 0 1 1 ${cx} ${cy - outerRadius}`,
      `M ${cx} ${cy - innerRadius}`,
      `A ${innerRadius} ${innerRadius} 0 1 0 ${cx} ${cy + innerRadius}`,
      `A ${innerRadius} ${innerRadius} 0 1 0 ${cx} ${cy - innerRadius}`,
      'Z',
    ].join(' ');
  }

  const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);
  const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);
  const largeArc = angle <= 180 ? 0 : 1;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');
}

function ProteinCompositionRing({ segments, radius, width }) {
  let angle = 0;
  return (
    <>
      {segments.map((segment) => {
        const start = angle;
        const end = angle + ((segment.percent / 100) * 360);
        angle = end;
        return (
          <path
            key={segment.key}
            className="d-analysis-quality-slice"
            d={donutSlicePath(64, 64, radius, radius - width, start, end)}
            fill={segment.color}
          />
        );
      })}
    </>
  );
}

function ProteinQualityChart({ nutrition }) {
  const { total, outerSegments, innerSegments, rows } = proteinCompositionData(nutrition);

  return (
    <div
      className="d-analysis-quality-panel"
      aria-label="단백질 구성"
    >
      <div className="d-analysis-quality-panel-title">
        <strong>단백질 구성</strong>
      </div>
      <div className="d-analysis-quality-chart" aria-hidden="true">
        <svg viewBox="0 0 128 128" role="img">
          <ProteinCompositionRing segments={outerSegments} radius={58} width={18} />
          {innerSegments.length > 0 && <ProteinCompositionRing segments={innerSegments} radius={34} width={14} />}
        </svg>
        <div className="d-analysis-quality-center">
          <span>단백질</span>
          <strong>{formatG(total) ?? '-'}</strong>
        </div>
      </div>
      <div className="d-analysis-quality-list">
        {rows.map((item) => (
          <div className={`d-analysis-quality-item${item.child ? ' is-child' : ''}`} key={item.key}>
            <span className="d-analysis-quality-dot" style={{ backgroundColor: item.color }} />
            <div className="d-analysis-quality-copy">
              <div className="d-analysis-quality-row">
                <strong>
                  {item.label}
                  {item.help && (
                    <span className="d-analysis-help d-analysis-quality-help" tabIndex="0" aria-label={item.help}>
                      ?
                      <span className="d-analysis-help-bubble" role="tooltip">{item.help}</span>
                    </span>
                  )}
                </strong>
                <span>{item.displayValue}</span>
              </div>
              {item.subValue && <p>{item.subValue}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function metricValue(food, base, mode) {
  const n = food?.nutrition ?? {};
  const total = n[base];
  if (!(total > 0)) return null;
  if (mode === 'total') return total;
  if (mode === 'kcal') return n.calories > 0 ? (total / n.calories) * 100 : null;
  if (mode === 'price') {
    const unitPrice = cheapestUnitPrice(food);
    return unitPrice > 0 ? (total / unitPrice) * 1000 : null;
  }
  return null;
}

function sameProteinDrinkCategory(product, categoryCode, category) {
  if (!product) return false;
  return product.categoryCode === categoryCode || product.categoryCode === 'protein_drink' || product.category === category || product.category === '단백질 음료';
}

function buildCategoryRanks(current, products, categoryCode, category) {
  if (!current?.id || !Array.isArray(products)) return {};

  const peers = products
    .filter((p) => sameProteinDrinkCategory(p, categoryCode, category))
    .map(getAdapted);

  if (!peers.some((p) => String(p.id) === String(current.id))) {
    peers.push(current);
  }

  const ranks = {};
  for (const base of RANK_BASES) {
    ranks[base.key] = {};
    for (const mode of RANK_MODES) {
      const rows = peers
        .map((food) => ({ food, value: metricValue(food, base.key, mode.key) }))
        .filter((row) => row.value != null && Number.isFinite(row.value) && row.value > 0)
        .sort((a, b) => b.value - a.value);
      const index = rows.findIndex((row) => String(row.food.id) === String(current.id));
      if (index >= 0) {
        ranks[base.key][mode.key] = {
          rank: index + 1,
          total: rows.length,
          value: rows[index].value,
          unit: base.unit,
          topPercent: Math.max(1, Math.round(((index + 1) / rows.length) * 100)),
        };
      } else {
        ranks[base.key][mode.key] = null;
      }
    }
  }
  return ranks;
}

function categoryRankTier(avgTopPercent) {
  if (!Number.isFinite(avgTopPercent)) return null;
  const title = `단백질, EAA, 류신, BCAA 평균 상위 ${formatPercent(avgTopPercent)}`;
  if (avgTopPercent <= 15) {
    return {
      label: '최상위권',
      tone: 'top',
      title,
    };
  }
  if (avgTopPercent <= 35) {
    return {
      label: '상위권',
      tone: 'upper',
      title,
    };
  }
  if (avgTopPercent <= 70) {
    return {
      label: '중위권',
      tone: 'mid',
      title,
    };
  }
  return {
    label: '하위권',
    tone: 'low',
    title,
  };
}

function categoryRankTierByMode(ranks, modeKey) {
  const percents = RANK_BASES
    .map((base) => ranks?.[base.key]?.[modeKey]?.topPercent)
    .filter((value) => Number.isFinite(value));

  if (percents.length !== RANK_BASES.length) return null;
  const avg = percents.reduce((sum, value) => sum + value, 0) / percents.length;
  return categoryRankTier(avg);
}

function bcaaBreakdown(nutrition) {
  const labels = { leucine: '류신', isoleucine: '이소류신', valine: '발린' };
  const parts = BCAA_KEYS
    .map((key) => ({ label: labels[key], value: nutrition?.[key] }))
    .filter((item) => typeof item.value === 'number' && item.value > 0);
  if (parts.length === 0) return null;
  return parts.map((item) => `${item.label} ${formatMg(item.value)}`).join(' · ');
}

function sourceInfo(note) {
  const text = note.displayDescription || '제품에 표시된 단백질 원료예요. 원료 종류에 따라 아미노산 구성과 소화 부담이 달라질 수 있습니다.';
  return text;
}

function ProteinNoteCard({ note }) {
  const name = note.abbreviation ? `${note.name} (${note.abbreviation})` : note.name;
  return (
    <div className="d-analysis-ingr-card is-neutral d-analysis-protein-card">
      <div className="d-analysis-ingr-head d-analysis-protein-head">
        <span className="d-analysis-ingr-name">{name}</span>
        {note.grade && <span className={`d-analysis-ingr-grade ${note.grade.cls}`}>{note.grade.label}</span>}
      </div>
      <p className="d-analysis-ingr-text">{sourceInfo(note)}</p>
    </div>
  );
}

function JudgmentCard({ title, value, valueExtra, label, tone, text, help, hideLabel = false }) {
  const isMissingValue = value === '정보 없음' || value === '데이터 없음';
  const hasActions = (!hideLabel && label && !isMissingValue) || help;
  return (
    <div className={`d-analysis-judgment-card is-${tone}`}>
      <div className="d-analysis-judgment-head">
        <span className="d-analysis-judgment-title">{title}</span>
        {hasActions && (
          <div className="d-analysis-judgment-actions">
            {!hideLabel && label && <span className={`d-analysis-row-tag is-${tone}`}>{label}</span>}
            {help && (
              <span className="d-analysis-help" tabIndex="0" aria-label={help}>
                ?
                <span className="d-analysis-help-bubble" role="tooltip">{help}</span>
              </span>
            )}
          </div>
        )}
      </div>
      <strong className={`d-analysis-judgment-value${isMissingValue ? ' is-missing' : ''}`}>
        {value ?? '데이터 없음'}
        {valueExtra && <span className="d-analysis-judgment-value-extra">{valueExtra}</span>}
      </strong>
      <p>{text}</p>
    </div>
  );
}

function eaaJudgment(nutrition) {
  const eaaCount = countPositive(nutrition, EAA_KEYS);
  const eaaComplete = allPositive(nutrition, EAA_KEYS);

  if (nutrition?.eaa > 0) {
    const tier = eaaAmountCriterion(nutrition.eaa);
    return {
      value: formatMg(nutrition.eaa),
      label: tier.label,
      tone: tier.tone,
      text: tier.summary,
      help: eaaComplete
        ? `${tier.basis}. 현재 단백질 음료 전체 분포와 단백질 대비 EAA 비율 스케일을 참고했습니다. 필수아미노산 9종을 모두 확인했습니다.`
        : `${tier.basis}. 현재 단백질 음료 전체 분포와 단백질 대비 EAA 비율 스케일을 참고했습니다. 필수아미노산 총량은 있지만 9종 중 ${eaaCount}종만 개별 수치가 있어요. 세부 구성 비교는 제한됩니다.`,
    };
  }

  const tier = eaaAmountCriterion(nutrition?.eaa);
  return {
    value: null,
    label: tier.label,
    tone: tier.tone,
    text: tier.summary,
    help: 'EAA 총량 또는 필수아미노산 9종 수치가 있어야 이 항목을 판단할 수 있어요. 기준은 단백질 음료 전체 분포를 참고해 산정했습니다.',
  };
}

function bcaaJudgment(nutrition) {
  const protein = nutrition?.protein ?? 0;
  const bcaaCount = countPositive(nutrition, BCAA_KEYS);
  const bcaaComplete = allPositive(nutrition, BCAA_KEYS);
  const breakdown = bcaaBreakdown(nutrition);
  const ratio = aminoRatio(nutrition?.bcaa, protein);

  if (nutrition?.bcaa > 0) {
    const tier = bcaaAmountCriterion(nutrition.bcaa);
    return {
      value: formatMg(nutrition.bcaa),
      label: tier.label,
      tone: tier.tone,
      text: tier.summary,
      help: bcaaComplete
        ? `${tier.basis}. 현재 단백질 음료 전체 분포와 단백질 대비 BCAA 비율 스케일을 참고했습니다. BCAA는 류신, 이소류신, 발린 3종을 묶은 보조 지표입니다. ${breakdown}.`
        : `${tier.basis}. 현재 단백질 음료 전체 분포와 단백질 대비 BCAA 비율 스케일을 참고했습니다. BCAA는 류신, 이소류신, 발린 3종을 묶은 보조 지표이며, 총량은 있지만 3종 중 ${bcaaCount}종만 개별 수치가 있어요.${ratio != null ? ` 단백질 대비 약 ${ratio}%입니다.` : ''}`,
    };
  }

  const tier = bcaaAmountCriterion(nutrition?.bcaa);
  return {
    value: null,
    label: tier.label,
    tone: tier.tone,
    text: tier.summary,
    help: 'BCAA 총량 또는 류신, 이소류신, 발린 수치가 있어야 이 항목을 판단할 수 있어요. 기준은 단백질 음료 전체 분포를 참고해 산정했습니다.',
  };
}

function leucineJudgment(nutrition) {
  const leucine = nutrition?.leucine;
  const tier = leucineAmountCriterion(leucine);
  const help = `${tier.basis}. ISSN의 류신 700~3000mg 범위와 휴식 시 약 2g, 운동 후 최대 3.5g 해석, 현재 등록 제품 분포를 함께 참고했습니다. 류신은 단백질 총량과 EAA 구성도 함께 봐야 합니다.`;

  if (!(leucine > 0)) {
    return {
      value: '정보 없음',
      label: tier.label,
      tone: tier.tone,
      text: tier.summary,
      help,
    };
  }

  return {
    value: formatMg(leucine),
    label: tier.label,
    tone: tier.tone,
    text: tier.summary,
    help,
  };
}

function KeyJudgmentSection({ nutrition, proteinVerdict }) {
  const eaa = eaaJudgment(nutrition);
  const leucine = leucineJudgment(nutrition);
  const bcaa = bcaaJudgment(nutrition);

  return (
    <div className="d-analysis-judgment-grid" aria-label="핵심 판단">
      <JudgmentCard
        title="단백질 양"
        value={formatG(nutrition?.protein)}
        label={proteinVerdict.label}
        tone={proteinVerdict.tone}
        text={proteinQuickText(proteinVerdict.tone)}
        help={`${proteinVerdict.basis}. ${proteinVerdict.summary}`}
      />
      <JudgmentCard
        title="필수아미노산"
        value={eaa.value}
        label={eaa.label}
        tone={eaa.tone}
        text={eaa.text}
        help={eaa.help}
      />
      <JudgmentCard
        title="류신"
        value={leucine.value}
        label={leucine.label}
        tone={leucine.tone}
        text={leucine.text}
        help={leucine.help}
      />
      <JudgmentCard
        title="BCAA"
        value={bcaa.value}
        label={bcaa.label}
        tone={bcaa.tone}
        text={bcaa.text}
        help={bcaa.help}
      />
    </div>
  );
}

function RankCell({ rank, tier }) {
  const className = [
    'd-analysis-rank-cell',
    tier ? `has-rank-tier is-${tier.tone}` : '',
    !rank ? 'is-empty' : '',
  ].filter(Boolean).join(' ');

  if (!rank) {
    return (
      <div className={className}>
        <span>-</span>
      </div>
    );
  }
  return (
    <div className={className}>
      <span className="d-analysis-rank-main">{rank.rank}위</span>
      <span className="d-analysis-rank-total">/ {rank.total}개</span>
      <span className="d-analysis-rank-value">{formatRankValue(rank.value, rank.unit)}</span>
    </div>
  );
}

function CategoryRankSection({ ranks }) {
  const tiersByMode = Object.fromEntries(
    RANK_MODES.map((mode) => [mode.key, categoryRankTierByMode(ranks, mode.key)]),
  );

  return (
    <AnalysisSection title="동일 카테고리 위치" icon={<IconInfo size={16} />}>
      <div className="d-analysis-rank-table" role="table" aria-label="단백질 음료 카테고리 내 상대 순위">
        <div className="d-analysis-rank-row is-head" role="row">
          <span role="columnheader" className="d-analysis-rank-head-label">성분</span>
          {RANK_MODES.map((mode) => {
            const tier = tiersByMode[mode.key];
            return (
              <span
                key={mode.key}
                role="columnheader"
                className={`d-analysis-rank-head-cell${tier ? ` has-rank-tier is-${tier.tone}` : ''}`}
              >
                <span className="d-analysis-rank-head-text">{mode.label}</span>
                {tier && (
                  <span className={`d-analysis-rank-tier is-${tier.tone}`} title={tier.title}>
                    {tier.label}
                  </span>
                )}
              </span>
            );
          })}
        </div>
        {RANK_BASES.map((base) => (
          <div className="d-analysis-rank-row" role="row" key={base.key}>
            <span className="d-analysis-rank-label" role="rowheader">{base.label}</span>
            {RANK_MODES.map((mode) => (
              <RankCell key={mode.key} rank={ranks?.[base.key]?.[mode.key]} tier={tiersByMode[mode.key]} />
            ))}
          </div>
        ))}
      </div>
      <p className="d-analysis-rank-note">
        등급은 단백질, EAA, 류신, BCAA의 평균 상위 백분위로 표시합니다. 1,000원당 값은 등록된 구매링크의 개당 최저가로 계산합니다.
      </p>
    </AnalysisSection>
  );
}

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

const OTHER_NUTRIENT_EXCLUDE = new Set([
  'energy_kcal', 'protein_g', 'carbohydrate_g', 'sugars_g', 'fat_g', 'dietary_fiber',
  'sodium_mg', 'trans_fat_g', 'saturated_fat_g', 'cholesterol_mg', 'src_알룰로오스_g',
  'src_eaa_mg', 'src_bcaa_mg', ...EAA_KEYS,
]);

function isAggAminoName(name) {
  const up = (name || '').trim().toUpperCase();
  return up === 'EAA' || up === 'BCAA';
}

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
    <AnalysisSection title="추가 성분" icon={<IconInfo size={16} />} compact>
      {others.length > 0 ? (
        <div className="d-analysis-ingredients is-subtle">
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
        <p className="d-analysis-empty-note">추가 영양성분 정보가 없어요.</p>
      )}
    </AnalysisSection>
  );
}

function IngredientRawSection({ ingredients, rawText, annotations }) {
  return (
    <IngredientList
      ingredients={ingredients}
      rawText={rawText}
      annotations={annotations}
      embedded
      rawOnly
      title="원재료명"
    />
  );
}

function ProteinDrinkReport({ product, products, nutrition, ingredients, category, categoryCode, proteinNotes, foodNutrients, rawText, annotations }) {
  const proteinVerdict = proteinCriterion(nutrition?.protein ?? 0);
  const ranks = useMemo(
    () => buildCategoryRanks(product, products, categoryCode, category),
    [product, products, categoryCode, category],
  );

  return (
    <section className="d-detail-card d-detail-report">
      <header className="d-detail-card-head">
        <h2 className="d-detail-card-title">분석 리포트</h2>
        <span className="d-detail-card-sub">{category}</span>
      </header>
      <ProteinQualityChart nutrition={nutrition} />
      <KeyJudgmentSection
        nutrition={nutrition}
        proteinVerdict={proteinVerdict}
      />
      <CategoryRankSection ranks={ranks} />
      <ProteinSourceSection proteinNotes={proteinNotes} />
      <OtherNutrientsSection foodNutrients={foodNutrients} />
      <IngredientRawSection ingredients={ingredients} rawText={rawText} annotations={annotations} />
    </section>
  );
}

function normalizeMixerName(name) {
  if (name === '대유') return '두유';
  return name;
}

function getShakePreparation(additionalContent) {
  const item = (additionalContent ?? []).find((content) => content?.kind === 'shake_preparation');
  const defaultCalorieHelp = '대략 100ml 기준 우유는 60~70kcal, 무가당 두유는 35~50kcal 정도예요. 제품마다 차이가 있습니다.';
  if (!item) return { calorieHelp: defaultCalorieHelp };
  const data = item.data ?? {};
  const rawNames = Array.isArray(data.mixer_names)
    ? data.mixer_names
    : String(data.mixer_name ?? '').split(',').map((name) => name.trim()).filter(Boolean);
  const mixerNames = [...new Set(rawNames.map(normalizeMixerName).filter(Boolean))];
  const amount = Number(data.mixer_amount);
  const unit = data.mixer_unit || 'ml';
  const body = item.body || (mixerNames.length > 0 && Number.isFinite(amount) && amount > 0
    ? `${mixerNames.join(' 또는 ')} ${amount}${unit}에 타서 섭취`
    : '');
  const hasWaterOnly = mixerNames.length > 0 && mixerNames.every((name) => name === '물');
  const hasMilkLike = mixerNames.some((name) => name.includes('우유') || name.includes('두유'));
  const calorieRange = hasMilkLike && Number.isFinite(amount) && amount > 0
    ? {
      min: Math.round(amount * 0.35),
      max: Math.round(amount * 0.7),
    }
    : null;
  const calorieText = calorieRange
    ? `${mixerNames.filter((name) => name !== '물').join('·') || '우유·두유'} 선택 시 +${calorieRange.min}~${calorieRange.max}kcal 정도`
    : hasWaterOnly
      ? '물 기준 추가 열량은 없어요.'
      : null;
  const extraCaloriesLabel = calorieRange
    ? `+${calorieRange.min}~${calorieRange.max}kcal`
    : hasWaterOnly
      ? '+0kcal'
      : null;
  const calorieHelp = Number.isFinite(amount) && amount > 0 && unit === 'ml'
    ? `${amount}${unit} 기준 우유는 약 ${Math.round(amount * 0.6)}~${Math.round(amount * 0.7)}kcal, 무가당 두유는 약 ${Math.round(amount * 0.35)}~${Math.round(amount * 0.5)}kcal 정도예요. 제품마다 차이가 있습니다.`
    : defaultCalorieHelp;

  return { body, mixerNames, amount, unit, calorieText, extraCaloriesLabel, calorieHelp };
}

function percentOfServing(value, servingWeight) {
  if (!(servingWeight > 0)) return 0;
  return Math.max(0, Math.min(100, Math.round(((value ?? 0) / servingWeight) * 100)));
}

function nutrientAmountInfo(foodNutrients, pattern) {
  let found = false;
  const total = (foodNutrients ?? []).reduce((sum, fn) => {
    const code = fn?.nutrient_code || fn?.nutrients?.code || '';
    const name = fn?.nutrients?.name_ko || '';
    if (!pattern.test(`${code} ${name}`)) return sum;
    found = true;
    return sum + (Number(fn.amount) || 0);
  }, 0);
  return found ? total : null;
}

function hasNutrientInfo(foodNutrients, pattern) {
  return nutrientAmountInfo(foodNutrients, pattern) !== null;
}

function nutrientValueIfShown(nutrition, foodNutrients, key, pattern) {
  if (!hasNutrientInfo(foodNutrients, pattern)) return null;
  const value = nutrition?.[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function formatGOrUnknown(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '정보 없음';
  return formatG0(value);
}

function formatKcalOrUnknown(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '정보 없음';
  return formatKcal(value);
}

function carbCaloriePercent(carbs, calories) {
  if (typeof carbs !== 'number' || !Number.isFinite(carbs)) return null;
  if (!(calories > 0)) return null;
  return (carbs * 4 / calories) * 100;
}

function formatCarbCaloriePercent(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '정보 없음';
  return `${Math.round(value).toLocaleString()}%`;
}

function formatMacroRowValue(value, servingWeight) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '정보 없음';
  return `${formatG0(value)} · ${percentOfServing(value, servingWeight)}%`;
}

function carbComponentText(type, value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return `표시된 ${type} 정보가 아직 없어요.`;
  }
  if (type === '당알코올') return '종류와 양에 따라 혈당·소화 부담이 달라질 수 있어요.';
  if (type === '식이섬유') return '포만감 유지와 장 건강에 도움이 될 수 있어요.';
  return '표시된 구성 정보를 기준으로 봅니다.';
}

function ShakeMacroPie({ nutrition, foodNutrients, servingSize, servingUnit }) {
  const carbs = nutrientValueIfShown(nutrition, foodNutrients, 'carbs', /carbohydrate_g|탄수화물/i);
  const protein = nutrientValueIfShown(nutrition, foodNutrients, 'protein', /protein_g|단백질/i);
  const fat = nutrientValueIfShown(nutrition, foodNutrients, 'fat', /fat_g|(^|\s)지방(\s|$)/i);
  const sugar = nutrientValueIfShown(nutrition, foodNutrients, 'sugar', /sugars_g|당류/i);
  const fiber = nutrientValueIfShown(nutrition, foodNutrients, 'fiber', /dietary_fiber|식이섬유/i);
  const allulose = typeof nutrition?.allulose === 'number' && Number.isFinite(nutrition.allulose)
    ? nutrition.allulose
    : nutrientAmountInfo(foodNutrients, /알룰로|allulose/i);
  const sugarAlcohol = nutrientAmountInfo(foodNutrients, /에리스리톨|말티톨|자일리톨|소르비톨|당알코올|erythritol|maltitol|xylitol|sorbitol|polyol/i);
  const carbsValue = carbs ?? 0;
  const proteinValue = protein ?? 0;
  const fatValue = fat ?? 0;
  const sugarValue = sugar ?? 0;
  const fiberValue = fiber ?? 0;
  const alluloseValue = allulose ?? 0;
  const sugarAlcoholValue = sugarAlcohol ?? 0;
  const macroTotal = carbsValue + proteinValue + fatValue;
  const servingWeight = servingSize > 0 ? servingSize : macroTotal;
  const pctExact = (value) => (servingWeight > 0 ? Math.max(0, Math.min(100, ((value ?? 0) / servingWeight) * 100)) : 0);
  const carbsPctExact = pctExact(carbsValue);
  const proteinPctExact = pctExact(proteinValue);
  const fatPctExact = pctExact(fatValue);
  const usedPct = Math.min(100, carbsPctExact + proteinPctExact + fatPctExact);
  const hasMainMacroInfo = [carbs, protein, fat].every((value) => typeof value === 'number' && Number.isFinite(value));
  const other = hasMainMacroInfo ? Math.max(0, servingWeight - macroTotal) : 0;
  const otherPctExact = hasMainMacroInfo ? Math.max(0, 100 - usedPct) : 0;
  const totalLabel = servingWeight > 0 ? `${round1(servingWeight).toLocaleString()}${servingUnit || 'g'}` : '-';
  const knownCarb = sugarValue + fiberValue + alluloseValue + sugarAlcoholValue;
  const knownCarbScale = knownCarb > carbsValue && knownCarb > 0 ? carbsValue / knownCarb : 1;
  const chartValue = (value) => value * knownCarbScale;
  const outerRows = [
    { key: 'carbs', label: '탄수화물', value: carbs, chartValue: carbsValue, color: NUTRIENT_COLORS.carbs.main },
    { key: 'protein', label: '단백질', value: protein, chartValue: proteinValue, color: NUTRIENT_COLORS.protein.main },
    { key: 'fat', label: '지방', value: fat, chartValue: fatValue, color: NUTRIENT_COLORS.fat.main },
    hasMainMacroInfo ? { key: 'other', label: '기타', value: other, chartValue: other, color: NUTRIENT_COLORS.neutral.main, muted: true } : null,
  ];
  const carbRows = [
    { key: 'sugar', label: '당류', value: sugar, chartValue: chartValue(sugarValue), color: NUTRIENT_COLORS.carbs.sugar, child: true },
    { key: 'fiber', label: '식이섬유', value: fiber, chartValue: chartValue(fiberValue), color: NUTRIENT_COLORS.carbs.fiber, child: true },
    { key: 'allulose', label: '알룰로스', value: allulose, chartValue: chartValue(alluloseValue), color: NUTRIENT_COLORS.carbs.allulose, child: true },
    { key: 'sugar-alcohol', label: '당알코올', value: sugarAlcohol, chartValue: chartValue(sugarAlcoholValue), color: NUTRIENT_COLORS.carbs.sugarAlcohol, child: true },
  ].filter((row) => row.value > 0);
  const rows = [outerRows[0], ...carbRows, outerRows[1], outerRows[2], outerRows[3]].filter(Boolean);
  const outerSegments = outerRows
    .filter(Boolean)
    .map((row) => ({ key: row.key, label: row.label, percent: row.key === 'other' ? otherPctExact : pctExact(row.chartValue), color: row.color }))
    .filter((row) => row.percent > 0);
  const innerSegments = carbRows
    .map((row) => ({ key: row.key, label: row.label, percent: pctExact(row.chartValue), color: row.color }))
    .filter((row) => row.percent > 0);

  return (
    <div className="d-analysis-quality-panel d-analysis-shake-pie-panel" aria-label="1회 제공량 기준 탄단지 비율">
      <div className="d-analysis-quality-panel-title">
        <strong>탄단지 구성</strong>
      </div>
      <div className="d-analysis-quality-chart" aria-hidden="true">
        <svg viewBox="0 0 128 128" role="img">
          <ProteinCompositionRing
            segments={outerSegments.length > 0 ? outerSegments : [{ key: 'unknown', label: '정보 없음', percent: 100, color: NUTRIENT_COLORS.neutral.pale }]}
            radius={58}
            width={18}
          />
          {innerSegments.length > 0 && <ProteinCompositionRing segments={innerSegments} radius={34} width={14} />}
        </svg>
        <div className="d-analysis-quality-center">
          <strong>{totalLabel}</strong>
        </div>
      </div>
      <div className="d-analysis-quality-list">
        {rows.map((row) => (
          <div className={`d-analysis-quality-item${row.child ? ' is-child' : ''}${row.muted ? ' is-muted' : ''}`} key={row.key}>
            <span className="d-analysis-quality-dot" style={{ backgroundColor: row.color }} />
            <div className="d-analysis-quality-copy">
              <div className="d-analysis-quality-row">
                <strong>{row.label}</strong>
                <span>{formatMacroRowValue(row.value, servingWeight)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShakeDetailRow({ label, value, note }) {
  return (
    <div className="d-analysis-shake-row">
      <div className="d-analysis-shake-row-head">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      {note && <p>{note}</p>}
    </div>
  );
}

function uniqueProteinNotes(proteinNotes) {
  const seen = new Set();
  return proteinNotes.filter((note) => {
    const key = note.abbreviation || note.name;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function ShakeHero({ nutrition, foodNutrients, servingSize, servingUnit, preparation }) {
  const displayKcal = formatKcal(nutrition?.calories);
  const mixedKcal = preparation?.extraCaloriesLabel
    ? `${displayKcal} · ${preparation.extraCaloriesLabel}`
    : displayKcal;

  return (
    <div className="d-analysis-shake-hero">
      <div className="d-analysis-shake-visual">
        <ShakeMacroPie
          nutrition={nutrition}
          foodNutrients={foodNutrients}
          servingSize={servingSize}
          servingUnit={servingUnit}
        />
      </div>
      <div className="d-analysis-shake-basis">
        <ShakeDetailRow
          label="표시 열량"
          value={displayKcal}
          note="제품 영양성분표에 표시된 기준량의 열량입니다."
        />
        <ShakeDetailRow
          label="조제 후 열량"
          value={mixedKcal}
          note={preparation?.calorieText || '물·우유·두유 등 조제 방식 정보가 있으면 추가 열량을 함께 표시합니다.'}
        />
        <ShakeDetailRow
          label="권장 용법"
          value={preparation?.body || '정보 없음'}
          note="제품에 표시된 섭취 방식 또는 추가 정보 기준입니다."
        />
      </div>
    </div>
  );
}

function servingPrice(food) {
  const unitPrice = cheapestUnitPrice(food);
  const servings = Number(food?.servingsPerUnit);
  if (!(unitPrice > 0)) return null;
  return servings > 0 ? unitPrice / servings : unitPrice;
}

function proteinPer100Kcal(food) {
  const protein = food?.nutrition?.protein;
  const calories = food?.nutrition?.calories;
  if (!(protein > 0) || !(calories > 0)) return null;
  return (protein / calories) * 100;
}

function proteinPer1000Won(food) {
  const protein = food?.nutrition?.protein;
  const price = servingPrice(food);
  if (!(protein > 0) || !(price > 0)) return null;
  return (protein / price) * 1000;
}

function caloriesPer1000Won(food) {
  const calories = food?.nutrition?.calories;
  const price = servingPrice(food);
  if (!(calories > 0) || !(price > 0)) return null;
  return (calories / price) * 1000;
}

const SHAKE_RANK_BASES = [
  {
    key: 'calories',
    label: '열량',
    unit: 'kcal',
    getValue: (food, mode) => {
      if (mode === 'total') return food?.nutrition?.calories;
      if (mode === 'price') return caloriesPer1000Won(food);
      return null;
    },
    direction: { total: 'asc', price: 'desc' },
  },
  {
    key: 'carbs',
    label: '탄수화물',
    unit: 'g',
    getValue: (food, mode) => {
      if (mode === 'total') return food?.nutrition?.carbs;
      if (mode === 'price') {
        const carbs = food?.nutrition?.carbs;
        const price = servingPrice(food);
        return carbs > 0 && price > 0 ? (carbs / price) * 1000 : null;
      }
      return null;
    },
    direction: { total: 'asc', price: 'desc' },
  },
  {
    key: 'sugar',
    label: '당류',
    unit: 'g',
    getValue: (food, mode) => mode === 'total' ? food?.nutrition?.sugar : null,
    direction: { total: 'asc' },
  },
  {
    key: 'protein',
    label: '단백질',
    unit: 'g',
    getValue: (food, mode) => {
      if (mode === 'total') return food?.nutrition?.protein;
      if (mode === 'kcal') return proteinPer100Kcal(food);
      if (mode === 'price') return proteinPer1000Won(food);
      return null;
    },
    direction: { total: 'desc', kcal: 'desc', price: 'desc' },
  },
];

function sameShakeCategory(product, categoryCode, category) {
  if (!product) return false;
  return product.categoryCode === categoryCode || product.categoryCode === 'shake' || product.category === category || product.category === '셰이크';
}

function buildShakePositions(current, products, categoryCode, category) {
  if (!current?.id || !Array.isArray(products)) return {};
  const peers = products
    .filter((p) => sameShakeCategory(p, categoryCode, category))
    .map(getAdapted);

  if (!peers.some((p) => String(p.id) === String(current.id))) {
    peers.push(current);
  }

  const ranks = {};
  for (const base of SHAKE_RANK_BASES) {
    ranks[base.key] = {};
    for (const mode of RANK_MODES) {
      const direction = base.direction?.[mode.key] ?? 'desc';
      const rows = peers
        .map((food) => ({ food, value: base.getValue(food, mode.key) }))
        .filter((row) => typeof row.value === 'number' && Number.isFinite(row.value) && row.value > 0)
        .sort((a, b) => direction === 'asc' ? a.value - b.value : b.value - a.value);
      const index = rows.findIndex((row) => String(row.food.id) === String(current.id));
      ranks[base.key][mode.key] = index >= 0 ? {
        rank: index + 1,
        total: rows.length,
        value: rows[index].value,
        unit: base.unit,
      } : null;
    }
  }
  return ranks;
}

function ShakeCoreMetrics({ nutrition, proteinNotes, preparation }) {
  const sugar = nutrition?.sugar ?? 0;
  const fiber = nutrition?.fiber ?? 0;
  const saturatedFat = nutrition?.saturatedFat;
  const uniqueNotes = uniqueProteinNotes(proteinNotes);
  const proteinSources = uniqueNotes.length > 0
    ? uniqueNotes.map((p) => p.abbreviation || p.name).join(' · ')
    : '정보 없음';

  return (
    <AnalysisSection title="핵심 수치" icon={<IconInfo size={16} />}>
      <div className="d-analysis-shake-metric-grid">
        <ShakeDetailRow
          label="열량"
          value={formatKcal(nutrition?.calories)}
          note={preparation?.extraCaloriesLabel ? `조제 방식에 따라 ${preparation.extraCaloriesLabel}가 함께 표시됩니다.` : '제품 표시 기준 열량입니다.'}
        />
        <ShakeDetailRow
          label="탄수화물"
          value={formatG0(nutrition?.carbs)}
          note={`당류 ${formatG0(sugar)} · 식이섬유 ${formatG0(fiber)}`}
        />
        <ShakeDetailRow
          label="단백질"
          value={formatG0(nutrition?.protein)}
          note={`단백질원: ${proteinSources}`}
        />
        <ShakeDetailRow
          label="지방"
          value={formatG0(nutrition?.fat)}
          note={typeof saturatedFat === 'number' ? `포화지방 ${formatG0(saturatedFat)}` : '포화지방 표시값은 영양성분표에서 확인합니다.'}
        />
      </div>
    </AnalysisSection>
  );
}

function sugarCriterion(sugar) {
  if (typeof sugar !== 'number' || !Number.isFinite(sugar)) {
    return {
      tone: 'neutral',
      label: '정보 없음',
      text: '당류 수치가 없어 저당 여부 판단은 제외했어요.',
      help: '제품 영양성분표의 당류 표시값이 있으면 판단할 수 있어요.',
    };
  }
  if (sugar <= 1) {
    return {
      tone: 'strong',
      label: '매우 낮음',
      text: '당류가 거의 없어 혈당 부담이 낮은 편이에요.',
      help: '1회 제공량 기준 당류 1g 이하를 매우 낮은 구간으로 봅니다.',
    };
  }
  if (sugar <= 5) {
    return {
      tone: 'solid',
      label: '낮은 편',
      text: '셰이크 제품 중 당류 부담이 낮은 쪽에 가까워요.',
      help: '1회 제공량 기준 당류 5g 이하를 낮은 구간으로 봅니다.',
    };
  }
  if (sugar <= 10) {
    return {
      tone: 'near',
      label: '보통',
      text: '당류가 아주 낮지는 않으니 하루 총 섭취량과 함께 보세요.',
      help: '간식이나 식사대용으로 마실 때 다른 음료·간식의 당류까지 같이 보는 게 좋아요.',
    };
  }
  return {
    tone: 'caution',
    label: '확인 필요',
    text: '당류가 높은 편이라 혈당 관리 중이라면 섭취 빈도를 조절하는 게 좋아요.',
    help: '당류 10g 초과 제품은 조제 음료나 추가 토핑과 함께 먹을 때 부담이 커질 수 있어요.',
  };
}

const CARB_CALORIE_HELP = '제품 표시 열량 중 탄수화물이 차지하는 비율입니다. 식사대용은 대략 45~65% 구간을 기본으로 봅니다.';

function carbMealCriterion(carbShare) {
  if (typeof carbShare !== 'number' || !Number.isFinite(carbShare)) {
    return {
      tone: 'neutral',
      label: '정보 없음',
      text: '표시 열량과 탄수화물 수치가 있어야 식사대용 적합도를 판단할 수 있어요.',
      help: CARB_CALORIE_HELP,
    };
  }
  if (carbShare < 35) {
    return {
      tone: 'light',
      label: '보충형에 가까움',
      text: '열량 대비 탄수화물이 낮아 단백질 보충형에 가까워요.',
      help: CARB_CALORIE_HELP,
    };
  }
  if (carbShare < 45) {
    return {
      tone: 'near',
      label: '낮은 편',
      text: '식사대용 기준보다는 탄수화물 비중이 낮은 편이에요.',
      help: CARB_CALORIE_HELP,
    };
  }
  if (carbShare <= 65) {
    return {
      tone: 'solid',
      label: '식사대용 기본 구간',
      text: '식사대용으로 보기 무난한 탄수화물 비중이에요.',
      help: CARB_CALORIE_HELP,
    };
  }
  return {
    tone: 'caution',
    label: '탄수화물 높음',
    text: '열량 대비 탄수화물이 높은 편이라 목적에 맞는지 확인해 보세요.',
    help: CARB_CALORIE_HELP,
  };
}

function shakeCalorieJudgment(preparation, nutrition) {
  const hasExtra = Boolean(preparation?.extraCaloriesLabel);
  return {
    value: formatKcal(nutrition?.calories),
    valueExtra: hasExtra ? preparation.extraCaloriesLabel : null,
    tone: 'shake-calorie',
    text: hasExtra
      ? (preparation.calorieText || '조제 방식에 따라 표시 열량보다 높아질 수 있어요.')
      : '제품 표시 기준 열량입니다.',
    help: preparation?.calorieHelp || '제품 영양성분표의 1회 제공량 기준 열량과 조제 방식에 따른 추가 열량을 함께 봅니다.',
  };
}

function ShakeKeyJudgmentSection({ nutrition, foodNutrients, proteinAmount, proteinVerdict, preparation }) {
  const calories = nutrientValueIfShown(nutrition, foodNutrients, 'calories', /energy_kcal|열량/i);
  const carbAmount = nutrientValueIfShown(nutrition, foodNutrients, 'carbs', /carbohydrate_g|탄수화물/i);
  const carbShare = carbCaloriePercent(carbAmount, calories);
  const calorie = {
    ...shakeCalorieJudgment(preparation, { ...nutrition, calories: calories ?? undefined }),
    value: formatKcalOrUnknown(calories),
  };
  const carbs = carbMealCriterion(carbShare);
  const calorieText = preparation?.body ? (
    <>
      <span className="d-analysis-judgment-line">{calorie.text}</span>
      <span className="d-analysis-judgment-line is-method">권장용법: {preparation.body}</span>
    </>
  ) : calorie.text;

  return (
    <div className="d-analysis-judgment-grid" aria-label="핵심 판단">
      <JudgmentCard
        title="열량"
        value={calorie.value}
        valueExtra={calorie.valueExtra}
        tone={calorie.tone}
        text={calorieText}
        help={calorie.help}
        hideLabel
      />
      <JudgmentCard
        title="탄수화물"
        value={formatCarbCaloriePercent(carbShare)}
        label={carbs.label}
        tone={carbs.tone}
        text={carbs.text}
        help={carbs.help}
      />
      <JudgmentCard
        title="단백질"
        value={formatGOrUnknown(proteinAmount)}
        label={proteinVerdict.label}
        tone={proteinVerdict.tone}
        text={proteinQuickText(proteinVerdict.tone)}
        help={`${proteinVerdict.basis}. ${proteinVerdict.summary}`}
      />
    </div>
  );
}

function ShakeCategoryRankSection({ positions }) {
  const shakeRankModes = RANK_MODES.map((mode) => (
    mode.key === 'total' ? { ...mode, label: '1회분당' } : mode
  ));

  return (
    <AnalysisSection title="동일 카테고리 위치" icon={<IconInfo size={16} />}>
      <div className="d-analysis-rank-table" role="table" aria-label="셰이크 카테고리 내 단백질 상대 순위">
        <div className="d-analysis-rank-row is-head" role="row">
          <span role="columnheader" className="d-analysis-rank-head-label">성분</span>
          {shakeRankModes.map((mode) => (
            <span key={mode.key} role="columnheader" className="d-analysis-rank-head-cell">
              <span className="d-analysis-rank-head-text">{mode.label}</span>
            </span>
          ))}
        </div>
        {SHAKE_RANK_BASES.map((base) => (
          <div className="d-analysis-rank-row" role="row" key={base.key}>
            <span className="d-analysis-rank-label" role="rowheader">{base.label}</span>
            {shakeRankModes.map((mode) => (
              <RankCell key={mode.key} rank={positions?.[base.key]?.[mode.key]} />
            ))}
          </div>
        ))}
      </div>
      <p className="d-analysis-rank-note">
        위치는 현재 등록된 셰이크 제품 중 해당 수치가 있는 제품만 대상으로 계산합니다. 1,000원당 값은 1회분당 최저가 기준입니다.
      </p>
    </AnalysisSection>
  );
}

function CarbAnalysisSection({ nutrition, foodNutrients }) {
  const sugar = nutrientValueIfShown(nutrition, foodNutrients, 'sugar', /sugars_g|당류/i);
  const fiber = nutrientValueIfShown(nutrition, foodNutrients, 'fiber', /dietary_fiber|식이섬유/i);
  const sugarAlcohol = nutrientAmountInfo(foodNutrients, /에리스리톨|말티톨|자일리톨|소르비톨|당알코올|erythritol|maltitol|xylitol|sorbitol|polyol/i);
  const sugarJudge = sugarCriterion(sugar);
  const cards = [
    {
      key: 'sugar',
      title: '당류',
      value: formatGOrUnknown(sugar),
      label: sugarJudge.label,
      tone: sugarJudge.tone,
      text: sugarJudge.text,
      help: sugarJudge.help,
    },
    {
      key: 'sugarAlcohol',
      title: '당알코올',
      value: formatGOrUnknown(sugarAlcohol),
      tone: 'neutral',
      text: carbComponentText('당알코올', sugarAlcohol),
      help: '에리스리톨·말티톨·자일리톨·소르비톨 등 표시값을 합산합니다.',
    },
    {
      key: 'fiber',
      title: '식이섬유',
      value: formatGOrUnknown(fiber),
      tone: 'neutral',
      text: carbComponentText('식이섬유', fiber),
      help: '제품 영양성분표의 식이섬유 표시값 기준입니다.',
    },
  ];

  return (
    <AnalysisSection title="탄수화물 구성" icon={<IconInfo size={16} />}>
      <div className="d-analysis-judgment-grid d-analysis-carb-card-grid">
        {cards.map((card) => (
          <JudgmentCard
            key={card.key}
            title={card.title}
            value={card.value}
            valueExtra={card.valueExtra}
            label={card.label}
            tone={card.tone}
            text={card.text}
            help={card.help}
          />
        ))}
      </div>
    </AnalysisSection>
  );
}

function proteinSourceType(name) {
  if (/WPI|분리유청|분리 유청/i.test(name)) return '분리유청';
  if (/WPC|농축유청|농축 유청/i.test(name)) return '농축유청';
  if (/WPH|가수분해/i.test(name)) return '가수분해유청';
  if (/카제인/i.test(name)) return '카제인';
  if (/대두|소이|soy/i.test(name)) return '대두';
  if (/완두|pea/i.test(name)) return '완두';
  return '단백질원';
}

function sweetenerType(name) {
  if (/말티톨|에리스리톨|자일리톨|소르비톨/i.test(name)) return '당알코올';
  if (/알룰로/i.test(name)) return '희소당';
  if (/수크랄로스|아스파탐|아세설팜/i.test(name)) return '고감미도 감미료';
  if (/스테비아/i.test(name)) return '스테비아계';
  return '대체당';
}

function ShakeIngredientSection({ proteinNotes, sweetenerNotes }) {
  const uniqueNotes = uniqueProteinNotes(proteinNotes);
  return (
    <AnalysisSection title="원료·대체당" icon={<IconInfo size={16} />}>
      <div className="d-analysis-shake-ingredient-grid">
        <div>
          <h4 className="d-analysis-shake-subtitle">단백질원</h4>
          {uniqueNotes.length > 0 ? (
            <div className="d-analysis-shake-chip-list">
              {uniqueNotes.map((note) => (
                <span key={note.name}>
                  <strong>{note.abbreviation || note.name}</strong>
                  {proteinSourceType(note.name) !== (note.abbreviation || note.name) ? proteinSourceType(note.name) : null}
                </span>
              ))}
            </div>
          ) : (
            <p className="d-analysis-empty-note">추출된 단백질원 정보가 아직 없어요.</p>
          )}
        </div>
        <div>
          <h4 className="d-analysis-shake-subtitle">대체당</h4>
          {sweetenerNotes.length > 0 ? (
            <div className="d-analysis-shake-chip-list">
              {sweetenerNotes.map((note) => (
                <span key={note.name}>
                  <strong>{note.name}</strong>
                  {sweetenerType(note.name)}
                </span>
              ))}
            </div>
          ) : (
            <p className="d-analysis-empty-note">추출된 대체당 정보가 아직 없어요.</p>
          )}
        </div>
      </div>
    </AnalysisSection>
  );
}

function ShakeSweetenerSection({ sweetenerNotes }) {
  return (
    <AnalysisSection title="대체당" icon={<IconAlert size={16} />}>
      {sweetenerNotes.length > 0 ? (
        <div className="d-analysis-ingredients">
          {sweetenerNotes.map((note) => (
            <div key={note.name} className="d-analysis-ingr-card is-neutral">
              <div className="d-analysis-ingr-head">
                <span className="d-analysis-ingr-name">{note.name}</span>
              </div>
              <p className="d-analysis-ingr-text">{note.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="d-analysis-empty-note">추출된 대체당 정보가 아직 없어요.</p>
      )}
    </AnalysisSection>
  );
}

function ShakeReport({ product, products, nutrition, ingredients, category, categoryCode, proteinNotes, sweetenerNotes, foodNutrients, additionalContent, servingSize, servingUnit, rawText, annotations }) {
  const preparation = getShakePreparation(additionalContent);
  const proteinAmount = nutrientValueIfShown(nutrition, foodNutrients, 'protein', /protein_g|단백질/i);
  const proteinVerdict = proteinCriterion(proteinAmount);
  const positions = useMemo(
    () => buildShakePositions(product, products, categoryCode, category),
    [product, products, categoryCode, category],
  );

  return (
    <section className="d-detail-card d-detail-report">
      <header className="d-detail-card-head">
        <h2 className="d-detail-card-title">분석 리포트</h2>
        <span className="d-detail-card-sub">{category}</span>
      </header>

      <ShakeMacroPie
        nutrition={nutrition}
        foodNutrients={foodNutrients}
        servingSize={servingSize}
        servingUnit={servingUnit}
      />
      <ShakeKeyJudgmentSection
        nutrition={nutrition}
        foodNutrients={foodNutrients}
        proteinAmount={proteinAmount}
        proteinVerdict={proteinVerdict}
        preparation={preparation}
      />
      <CarbAnalysisSection nutrition={nutrition} foodNutrients={foodNutrients} />
      <ShakeCategoryRankSection positions={positions} />
      <ProteinSourceSection proteinNotes={proteinNotes} />
      <ShakeSweetenerSection sweetenerNotes={sweetenerNotes} />
      <OtherNutrientsSection foodNutrients={foodNutrients} />
      <IngredientRawSection ingredients={ingredients} rawText={rawText} annotations={annotations} />
    </section>
  );
}

export function AnalysisReport({ product, products, nutrition, ingredients, category, categoryCode, foodNutrients, additionalContent, servingSize, servingUnit, rawText, annotations }) {
  const n = nutrition ?? {};
  const ing = ingredients ?? {};
  const isProteinDrink = categoryCode === 'protein_drink' || category === '단백질 음료';
  const isShake = categoryCode === 'shake' || category === '셰이크';

  const { strengths, cautions } = useMemo(
    () => generateInsights(n, ing),
    [n, ing],
  );

  const resolvedProteinSources = useResolvedProteinSources(ing.proteinSources ?? []);
  const resolvedSweeteners = useResolvedSweeteners(ing.sweeteners ?? []);
  const sweetenerNotes = useMemo(() => {
    return resolvedSweeteners.map((sweetener) => ({
      name: sweetener.nameKo,
      type: sweetener.sweetenerType,
      ...(SWEETENER_INFO[sweetener.nameKo] ?? { verdict: 'neutral', text: '추후 정보가 추가될 예정입니다.' }),
    }));
  }, [resolvedSweeteners]);

  const proteinNotes = useMemo(() => resolvedProteinSources.map((ingr) => {
    return {
      name: ingr.nameKo,
      abbreviation: ingr?.abbreviation ?? null,
      grade: ingr ? proteinGradeMeta(ingr.qualityGrade) : null,
      displayDescription: ingr?.displayDescription ?? null,
    };
  }), [resolvedProteinSources]);

  if (isProteinDrink) {
    return (
      <ProteinDrinkReport
        product={product}
        products={products}
        nutrition={n}
        ingredients={ing}
        category={category}
        categoryCode={categoryCode}
        proteinNotes={proteinNotes}
        foodNutrients={foodNutrients}
        rawText={rawText}
        annotations={annotations}
      />
    );
  }

  if (isShake) {
    return (
      <ShakeReport
        product={product}
        products={products}
        nutrition={n}
        ingredients={ing}
        category={category}
        categoryCode={categoryCode}
        proteinNotes={proteinNotes}
        sweetenerNotes={sweetenerNotes}
        foodNutrients={foodNutrients}
        additionalContent={additionalContent}
        servingSize={servingSize}
        servingUnit={servingUnit}
        rawText={rawText}
        annotations={annotations}
      />
    );
  }

  return (
    <section className="d-detail-card d-detail-report">
      <header className="d-detail-card-head">
        <h2 className="d-detail-card-title">분석 리포트</h2>
        <span className="d-detail-card-sub">{category}</span>
      </header>

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

      {sweetenerNotes.length > 0 && (
        <AnalysisSection title="감미료 분석" icon={<IconAlert size={16} />}>
          <div className="d-analysis-ingredients">
            {sweetenerNotes.map((s) => (
              <div key={s.name} className="d-analysis-ingr-card is-neutral">
                <div className="d-analysis-ingr-head">
                  <span className="d-analysis-ingr-name">{s.name}</span>
                </div>
                <p className="d-analysis-ingr-text">{s.text}</p>
              </div>
            ))}
          </div>
        </AnalysisSection>
      )}

      {proteinNotes.length > 0 && (
        <AnalysisSection title="단백질원 분석" icon={<IconInfo size={16} />}>
          <div className="d-analysis-ingredients">
            {proteinNotes.map((p) => (
              <ProteinNoteCard key={p.name} note={p} />
            ))}
          </div>
        </AnalysisSection>
      )}
      <IngredientRawSection ingredients={ing} rawText={rawText} annotations={annotations} />
    </section>
  );
}
