import { useMemo } from 'react';
import { Badge } from '../../ds/Badge.jsx';
import { IconCheck, IconAlert, IconInfo } from '../../ds/Icons.jsx';
import { getAdapted } from '../../../data/adapters.js';
import { EAA_KEYS, BCAA_KEYS } from '../../../data/aminoAcids.js';
import { cheapestUnitPrice } from '../../../data/categoryCardMetrics.js';
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

const RANK_BASES = [
  { key: 'protein', label: '단백질', unit: 'g' },
  { key: 'eaa', label: 'EAA', unit: 'mg' },
  { key: 'bcaa', label: 'BCAA', unit: 'mg' },
];

const RANK_MODES = [
  { key: 'total', label: '총량' },
  { key: 'kcal', label: '100kcal당' },
  { key: 'price', label: '1,000원당' },
];

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

function formatMg(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return null;
  return `${Math.round(value).toLocaleString()}mg`;
}

function formatRankValue(value, unit) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return null;
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
      label: '기본 충족',
      summary: `단백질 ${formatG(protein)}입니다. 운동용 단백질 제품에서 자주 보는 20g 기준을 충족해요.`,
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
    tone: 'high',
    label: '매우 높음',
    summary: `단백질 ${formatG(protein)}입니다. 1회 기준 상단으로 자주 보는 40g을 넘으니 하루 총 섭취량과 함께 보세요.`,
    basis: '운동용 1회 단백질 20-40g',
  };
}

function proteinQuickText(tone) {
  if (tone === 'poor') return '보충용 메인으로는 낮아요.';
  if (tone === 'light') return '가볍게 더하는 정도예요.';
  if (tone === 'near') return '기본선에 가까워요.';
  if (tone === 'solid') return '운동용 기본선은 넘어요.';
  if (tone === 'strong') return '한 번에 채우기 넉넉해요.';
  if (tone === 'high') return '고함량 제품이에요.';
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
      basis: '필수아미노산 4,000 / 7,000 / 9,000mg 기준',
    };
  }
  if (eaa < 7000) {
    return {
      tone: 'near',
      label: '보통',
      summary: '기본 구간에는 들어오지만 넉넉하진 않아요.',
      basis: '필수아미노산 4,000 / 7,000 / 9,000mg 기준',
    };
  }
  if (eaa < 9000) {
    return {
      tone: 'solid',
      label: '충분',
      summary: '운동용 단백질 제품으로 보기 좋은 구간이에요.',
      basis: '필수아미노산 4,000 / 7,000 / 9,000mg 기준',
    };
  }
  return {
    tone: 'high',
    label: '높음',
    summary: '상위 구간에 가까운 높은 함량이에요.',
    basis: '필수아미노산 4,000 / 7,000 / 9,000mg 기준',
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
      basis: 'BCAA 2,000 / 3,500 / 4,500mg 기준',
    };
  }
  if (bcaa < 3500) {
    return {
      tone: 'near',
      label: '보통',
      summary: '기본 구간에는 들어오지만 넉넉하진 않아요.',
      basis: 'BCAA 2,000 / 3,500 / 4,500mg 기준',
    };
  }
  if (bcaa < 4500) {
    return {
      tone: 'solid',
      label: '충분',
      summary: '운동 목적에서 보기 좋은 구간이에요.',
      basis: 'BCAA 2,000 / 3,500 / 4,500mg 기준',
    };
  }
  return {
    tone: 'high',
    label: '높음',
    summary: '상위 구간에 가까운 높은 함량이에요.',
    basis: 'BCAA 2,000 / 3,500 / 4,500mg 기준',
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
      outerSegments: [{ key: 'unknown', label: '단백질 정보 없음', percent: 100, color: '#e5e7eb' }],
      innerSegments: [],
      rows: [{
        key: 'unknown',
        label: '단백질 정보 없음',
        displayValue: '-',
        color: '#e5e7eb',
      }],
    };
  }

  const eaaG = Math.min(Math.max((nutrition?.eaa ?? 0) / 1000, 0), protein);
  const bcaaG = Math.min(Math.max((nutrition?.bcaa ?? 0) / 1000, 0), protein);
  const hasEaa = eaaG > 0;
  const hasBcaa = bcaaG > 0;
  const knownEaa = hasEaa ? eaaG : 0;
  const knownBcaa = hasEaa && hasBcaa ? Math.min(bcaaG, knownEaa) : 0;
  const otherEaa = Math.max(knownEaa - knownBcaa, 0);
  const otherProtein = Math.max(protein - knownEaa, 0);
  const eaaPercentOfProtein = (knownEaa / protein) * 100;
  const bcaaPercentOfProtein = (knownBcaa / protein) * 100;
  const bcaaPercentOfEaa = knownEaa > 0 ? (knownBcaa / knownEaa) * 100 : 0;

  const outerSegments = hasEaa
    ? [
      { key: 'eaa', label: '필수아미노산', percent: eaaPercentOfProtein, color: '#2563eb' },
      { key: 'other-amino', label: '기타 아미노산', percent: 100 - eaaPercentOfProtein, color: '#16a34a' },
    ].filter((item) => item.percent > 0)
    : [{ key: 'eaa-missing', label: '필수아미노산 정보 없음', percent: 100, color: '#e5e7eb' }];

  const innerSegments = hasEaa
    ? [
      { key: 'bcaa', label: 'BCAA', percent: bcaaPercentOfProtein, color: '#f59e0b' },
      { key: 'other-eaa', label: '필수아미노산(BCAA 제외)', percent: (otherEaa / protein) * 100, color: '#93c5fd' },
    ].filter((item) => item.percent > 0)
    : [];

  const rows = [
    hasEaa ? {
      key: 'eaa',
      label: '필수아미노산',
      displayValue: `${formatG(knownEaa)} · 전체의 ${formatPercent(eaaPercentOfProtein)}`,
      color: '#2563eb',
    } : {
      key: 'eaa-missing',
      label: '필수아미노산',
      displayValue: '정보 없음',
      color: '#cbd5e1',
    },
    hasEaa && knownBcaa > 0 ? {
      key: 'bcaa',
      label: 'BCAA',
      displayValue: `${formatG(knownBcaa)} · 필수아미노산의 ${formatPercent(bcaaPercentOfEaa)}`,
      subValue: `전체의 ${formatPercent(bcaaPercentOfProtein)}`,
      color: '#f59e0b',
      child: true,
    } : !hasEaa && hasBcaa ? {
      key: 'bcaa-orphan',
      label: 'BCAA',
      displayValue: `${formatG(bcaaG)}`,
      subValue: '필수아미노산 총량이 없어 구성 비율은 계산하지 않아요.',
      color: '#f59e0b',
      child: true,
    } : {
      key: 'bcaa-missing',
      label: 'BCAA',
      displayValue: '정보 없음',
      color: '#cbd5e1',
      child: true,
    },
    hasEaa && otherProtein > 0 ? {
      key: 'other-amino',
      label: '기타 아미노산',
      displayValue: `${formatG(otherProtein)} · 전체의 ${formatPercent((otherProtein / protein) * 100)}`,
      help: '비필수 아미노산과 조건부 필수 아미노산을 포함해 표시합니다.',
      color: '#16a34a',
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
      <div className="d-analysis-quality-chart" aria-hidden="true">
        <svg viewBox="0 0 128 128" role="img">
          <ProteinCompositionRing segments={outerSegments} radius={58} width={18} />
          {innerSegments.length > 0 && <ProteinCompositionRing segments={innerSegments} radius={34} width={14} />}
        </svg>
        <div className="d-analysis-quality-center">
          <span>총량</span>
          <strong>{formatG(total) ?? '-'}</strong>
        </div>
      </div>
      <div className="d-analysis-quality-list">
        <div className="d-analysis-quality-title">
          <strong>단백질 구성</strong>
        </div>
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

function dataLimitIssues(n) {
  const eaaCount = countPositive(n, EAA_KEYS);
  const bcaaCount = countPositive(n, BCAA_KEYS);
  const eaaDirect = allPositive(n, EAA_KEYS);
  const bcaaDirect = allPositive(n, BCAA_KEYS);
  const issues = [];

  if (!eaaDirect) {
    issues.push({
      label: 'EAA',
      value: n.eaa > 0 ? formatMg(n.eaa) : '데이터 없음',
      tone: n.eaa > 0 ? 'neutral' : 'caution',
      text: n.eaa > 0
        ? `EAA 총량은 있지만 필수아미노산 9종 중 ${eaaCount}종만 개별 수치가 있어요. 어떤 아미노산이 부족한지까지는 판단이 제한됩니다.`
        : `EAA 총량이 없어 필수아미노산 비교는 제외했어요.`,
    });
  }

  if (!bcaaDirect) {
    issues.push({
      label: 'BCAA',
      value: n.bcaa > 0 ? formatMg(n.bcaa) : '데이터 없음',
      tone: n.bcaa > 0 ? 'neutral' : 'caution',
      text: n.bcaa > 0
        ? `BCAA 총량은 있지만 류신·이소류신·발린 중 ${bcaaCount}종만 개별 수치가 있어요. 세부 구성 해석은 제한됩니다.`
        : `BCAA 총량이 없어 BCAA 비교는 제외했어요.`,
    });
  }

  if (!(n.leucine > 0)) {
    issues.push({
      label: '류신',
      value: '데이터 없음',
      tone: 'caution',
      text: '류신 수치가 없어 700mg 기준 판단은 제외했어요.',
    });
  }

  return issues;
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

function proteinCardClass(isPrimary) {
  return `d-analysis-ingr-card is-neutral d-analysis-protein-card${isPrimary ? ' is-primary-source' : ''}`;
}

function ProteinNoteCard({ note, isPrimary = false }) {
  return (
    <div className={proteinCardClass(isPrimary)}>
      {isPrimary && <span className="d-analysis-source-main">주원료</span>}
      <div className="d-analysis-ingr-head d-analysis-protein-head">
        <span className="d-analysis-ingr-name">{note.name}</span>
        {note.abbreviation && <span className="d-analysis-ingr-abbr">{note.abbreviation}</span>}
        {note.grade && <span className={`d-analysis-ingr-grade ${note.grade.cls}`}>{note.grade.label}</span>}
      </div>
      <p className="d-analysis-ingr-text">{sourceInfo(note)}</p>
    </div>
  );
}

function JudgmentCard({ title, value, label, tone, text, help }) {
  return (
    <div className={`d-analysis-judgment-card is-${tone}`}>
      <div className="d-analysis-judgment-head">
        <span className="d-analysis-judgment-title">{title}</span>
        <div className="d-analysis-judgment-actions">
          <span className={`d-analysis-row-tag is-${tone}`}>{label}</span>
          {help && (
            <span className="d-analysis-help" tabIndex="0" aria-label={help}>
              ?
              <span className="d-analysis-help-bubble" role="tooltip">{help}</span>
            </span>
          )}
        </div>
      </div>
      <strong className="d-analysis-judgment-value">{value ?? '데이터 없음'}</strong>
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
        ? `${tier.basis}. 필수아미노산 9종을 모두 확인했습니다.`
        : `${tier.basis}. 필수아미노산 총량은 있지만 9종 중 ${eaaCount}종만 개별 수치가 있어요. 세부 구성 비교는 제한됩니다.`,
    };
  }

  const tier = eaaAmountCriterion(nutrition?.eaa);
  return {
    value: null,
    label: tier.label,
    tone: tier.tone,
    text: tier.summary,
    help: 'EAA 총량 또는 필수아미노산 9종 수치가 있어야 이 항목을 판단할 수 있어요.',
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
    const leucineText = nutrition?.leucine > 0 ? ` 류신 ${formatMg(nutrition.leucine)} 포함.` : '';
    return {
      value: formatMg(nutrition.bcaa),
      label: tier.label,
      tone: tier.tone,
      text: `${tier.summary}${leucineText}`,
      help: bcaaComplete
        ? `${tier.basis}. BCAA는 류신, 이소류신, 발린 3종입니다. ${breakdown}.`
        : `${tier.basis}. BCAA 총량은 있지만 3종 중 ${bcaaCount}종만 개별 수치가 있어요.${ratio != null ? ` 단백질 대비 약 ${ratio}%입니다.` : ''}`,
    };
  }

  const tier = bcaaAmountCriterion(nutrition?.bcaa);
  return {
    value: null,
    label: tier.label,
    tone: tier.tone,
    text: tier.summary,
    help: 'BCAA 총량 또는 류신, 이소류신, 발린 수치가 있어야 이 항목을 판단할 수 있어요.',
  };
}

function primarySourceJudgment(primaryNote) {
  if (!primaryNote) {
    return {
      value: '정보 없음',
      label: '원료 미등록',
      tone: 'neutral',
      text: '등록된 단백질 원료 정보가 아직 없어요.',
    };
  }
  return {
    value: primaryNote.abbreviation || primaryNote.name,
    label: '주원료',
    tone: 'high',
    text: `${primaryNote.name} 중심 제품이에요.`,
    help: sourceInfo(primaryNote),
  };
}

function KeyJudgmentSection({ nutrition, proteinVerdict, primaryNote }) {
  const eaa = eaaJudgment(nutrition);
  const bcaa = bcaaJudgment(nutrition);
  const source = primarySourceJudgment(primaryNote);

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
        title="BCAA"
        value={bcaa.value}
        label={bcaa.label}
        tone={bcaa.tone}
        text={bcaa.text}
        help={bcaa.help}
      />
      <JudgmentCard
        title="단백질 원료"
        value={source.value}
        label={source.label}
        tone={source.tone}
        text={source.text}
        help={source.help}
      />
    </div>
  );
}

function RankCell({ rank }) {
  if (!rank) {
    return (
      <div className="d-analysis-rank-cell is-empty">
        <span>계산 불가</span>
      </div>
    );
  }
  return (
    <div className="d-analysis-rank-cell">
      <span className="d-analysis-rank-main">{rank.rank}위</span>
      <span className="d-analysis-rank-total">/ {rank.total}개</span>
      <span className="d-analysis-rank-value">{formatRankValue(rank.value, rank.unit)}</span>
    </div>
  );
}

function CategoryRankSection({ ranks }) {
  return (
    <AnalysisSection title="동일 카테고리 위치" icon={<IconInfo size={16} />}>
      <div className="d-analysis-rank-table" role="table" aria-label="단백질 음료 카테고리 내 상대 순위">
        <div className="d-analysis-rank-row is-head" role="row">
          <span role="columnheader">성분</span>
          {RANK_MODES.map((mode) => <span key={mode.key} role="columnheader">{mode.label}</span>)}
        </div>
        {RANK_BASES.map((base) => (
          <div className="d-analysis-rank-row" role="row" key={base.key}>
            <span className="d-analysis-rank-label" role="rowheader">{base.label}</span>
            {RANK_MODES.map((mode) => (
              <RankCell key={mode.key} rank={ranks?.[base.key]?.[mode.key]} />
            ))}
          </div>
        ))}
      </div>
      <p className="d-analysis-rank-note">
        1,000원당 값은 등록된 구매링크의 개당 최저가로 계산합니다. 실제 판매가와 다를 수 있어요.
      </p>
    </AnalysisSection>
  );
}

function DataLimitSection({ items }) {
  if (items.length === 0) return null;
  return (
    <AnalysisSection title="데이터 제한" icon={<IconInfo size={16} />} compact>
      <div className="d-analysis-data-grid">
        {items.map((item) => (
          <div key={item.label} className={`d-analysis-data-card is-${item.tone}`}>
            <div className="d-analysis-data-head">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
            <p>{item.text}</p>
          </div>
        ))}
      </div>
    </AnalysisSection>
  );
}

function ProteinSourceSection({ proteinNotes }) {
  return (
    <AnalysisSection title="단백질 원료" icon={<IconInfo size={16} />}>
      {proteinNotes.length > 0 ? (
        <div className="d-analysis-ingredients">
          {proteinNotes.map((p, index) => (
            <ProteinNoteCard key={p.name} note={p} isPrimary={index === 0} />
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
        <p className="d-analysis-empty-note">칼슘·카르니틴·아르기닌 등 추가 영양성분 정보가 아직 없어요.</p>
      )}
    </AnalysisSection>
  );
}

function ProteinDrinkReport({ product, products, nutrition, category, categoryCode, proteinNotes, foodNutrients }) {
  const proteinVerdict = proteinCriterion(nutrition?.protein ?? 0);
  const dataIssues = dataLimitIssues(nutrition);
  const primaryNote = proteinNotes[0] ?? null;
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
        primaryNote={primaryNote}
      />
      <CategoryRankSection ranks={ranks} />
      <DataLimitSection items={dataIssues} />
      <ProteinSourceSection proteinNotes={proteinNotes} />
      <OtherNutrientsSection foodNutrients={foodNutrients} />
    </section>
  );
}

export function AnalysisReport({ product, products, nutrition, ingredients, category, categoryCode, foodNutrients }) {
  const n = nutrition ?? {};
  const ing = ingredients ?? {};
  const isProteinDrink = categoryCode === 'protein_drink' || category === '단백질 음료';

  const { strengths, cautions } = useMemo(
    () => generateInsights(n, ing),
    [n, ing],
  );

  const sweetenerNotes = useMemo(() => {
    if (!ing.sweeteners?.length) return [];
    return ing.sweeteners.map((s) => ({
      name: s,
      ...(SWEETENER_INFO[s] ?? { verdict: 'neutral', text: '추후 정보가 추가될 예정입니다.' }),
    }));
  }, [ing.sweeteners]);

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
      displayDescription: ingr?.displayDescription ?? null,
    };
  }), [proteinLabels, resolveProtein]);

  if (isProteinDrink) {
    return (
      <ProteinDrinkReport
        product={product}
        products={products}
        nutrition={n}
        category={category}
        categoryCode={categoryCode}
        proteinNotes={proteinNotes}
        foodNutrients={foodNutrients}
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
