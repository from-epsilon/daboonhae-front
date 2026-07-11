import { Fragment, useMemo } from 'react';
import { IconCheck, IconAlert, IconInfo } from '../../ds/Icons.jsx';
import { getAdapted } from '../../../data/adapters.js';
import { EAA_KEYS, BCAA_KEYS } from '../../../data/aminoAcids.js';
import { cheapestUnitPrice } from '../../../data/categoryCardMetrics.js';
import { useResolvedProteinSources, useResolvedSweeteners, proteinGradeMeta } from '../../../data/proteinQuality.js';
import {
  AMINO_QUALITY_GRADE_ROWS,
  CALORIE_EFFICIENCY_GRADE_ROWS,
  PRICE_EFFICIENCY_GRADE_ROWS,
  PROTEIN_GRADE_ROWS,
  formatEfficiencyValue,
  getProteinDrinkScoreModel,
} from '../../../data/proteinDrinkScore.js';
import { IngredientList } from './IngredientList.jsx';

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

const FAO_EAA_PATTERN = [
  { key: 'leucine', label: '류신', standard: 61, keys: ['leucine'], scoreKeys: ['leucine'] },
  { key: 'isoleucine', label: '이소류신', standard: 30, keys: ['isoleucine'], scoreKeys: ['isoleucine'] },
  { key: 'valine', label: '발린', standard: 40, keys: ['valine'], scoreKeys: ['valine'] },
  { key: 'histidine', label: '히스티딘', standard: 16, keys: ['histidine'], scoreKeys: ['histidine'] },
  { key: 'lysine', label: '라이신', standard: 48, keys: ['lysine'], scoreKeys: ['lysine'] },
  { key: 'sulfur', label: 'SAA', description: '메티오닌 + 시스테인', standard: 23, keys: ['methionine', 'cysteine'], scoreKeys: ['sulfur_amino_acids', 'sulfur'] },
  { key: 'aromatic', label: 'AAA', description: '페닐알라닌 + 티로신', standard: 41, keys: ['phenylalanine', 'tyrosine'], scoreKeys: ['aromatic_amino_acids', 'aromatic'] },
  { key: 'threonine', label: '트레오닌', standard: 25, keys: ['threonine'], scoreKeys: ['threonine'] },
  { key: 'tryptophan', label: '트립토판', standard: 6.6, keys: ['tryptophan'], scoreKeys: ['tryptophan'] },
];

const AMINO_PATTERN_SCALE_MAX = 180;
const AMINO_PATTERN_TRACK_HEIGHT = 136;
const AMINO_PATTERN_VALUE_HEIGHT = 18;
const AMINO_PATTERN_ROW_GAP = 5;
const AMINO_PATTERN_BASELINE_TOP =
  AMINO_PATTERN_VALUE_HEIGHT +
  AMINO_PATTERN_ROW_GAP +
  AMINO_PATTERN_TRACK_HEIGHT * (1 - 100 / AMINO_PATTERN_SCALE_MAX);

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

function formatGAllowZero(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return `${round1(value).toLocaleString()}g`;
}

function formatMgAllowZero(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
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

function aminoPatternAmount(nutrition, keys) {
  const values = keys
    .map((key) => nutrition?.[key])
    .filter((value) => typeof value === 'number' && Number.isFinite(value) && value > 0);
  if (values.length === 0) return null;
  return {
    amount: values.reduce((sum, value) => sum + value, 0),
    presentCount: values.length,
  };
}

function normalizeAminoScoreKey(key) {
  return String(key ?? '').trim().toLowerCase();
}

function scoreItemForPattern(scoreItems, item) {
  const index = new Map(
    (Array.isArray(scoreItems) ? scoreItems : [])
      .map((scoreItem) => [normalizeAminoScoreKey(scoreItem?.key), scoreItem])
      .filter(([key]) => key),
  );
  return (item.scoreKeys ?? [item.key])
    .map((key) => index.get(normalizeAminoScoreKey(key)))
    .find(Boolean) ?? null;
}

function formatFallbackSources(sources) {
  return (Array.isArray(sources) ? sources : [])
    .map((source) => {
      const name = source?.name_ko ?? source?.nameKo ?? source?.raw_text ?? source?.code;
      const weight = Number(source?.normalized_weight ?? source?.normalizedWeight ?? source?.weight);
      if (!name) return null;
      return Number.isFinite(weight) && weight > 0 ? `${name} ${Math.round(weight * 100)}%` : name;
    })
    .filter(Boolean);
}

function aminoPatternTitle(row) {
  const label = row.description ? `${row.label}(${row.description})` : row.label;
  if (row.value == null) return `${label}: 계산 불가`;
  const basisText = row.basis === 'protein_source_top3_weighted'
    ? '원료 기준 추정'
    : row.basis === 'measured'
      ? '실측값 기준'
      : row.basis === 'frontend_measured'
        ? '제품 영양성분 기준'
        : '계산 근거 미상';
  const sources = row.fallbackSources?.length > 0 ? ` (${row.fallbackSources.join(', ')})` : '';
  return `${label}: FAO 기준 대비 ${Math.round(row.ratio)}%, ${basisText}${sources}`;
}

function buildAminoPatternRowsFromScores(scoreItems) {
  if (!Array.isArray(scoreItems) || scoreItems.length === 0) return [];

  return FAO_EAA_PATTERN.map((item) => {
    const scoreItem = scoreItemForPattern(scoreItems, item);
    const score = typeof scoreItem?.score === 'number' ? scoreItem.score : Number(scoreItem?.score);
    const basis = scoreItem?.basis ?? 'missing';
    const fallback = basis === 'protein_source_top3_weighted';
    const measured = basis === 'measured';
    const hasScore = Number.isFinite(score) && score >= 0 && basis !== 'missing';

    if (!hasScore) {
      return {
        ...item,
        value: null,
        ratio: null,
        delta: null,
        barPercent: 0,
        partial: false,
        fallback: false,
        measured: false,
        basis,
        fallbackSources: [],
        tone: 'missing',
      };
    }

    return {
      ...item,
      value: score,
      ratio: score,
      delta: score - 100,
      barPercent: Math.min((score / AMINO_PATTERN_SCALE_MAX) * 100, 100),
      partial: false,
      fallback,
      measured,
      basis,
      fallbackSources: formatFallbackSources(scoreItem?.fallback_sources ?? scoreItem?.fallbackSources),
      tone: score >= 100 ? 'enough' : 'low',
    };
  });
}

function buildAminoPatternRowsFromNutrition(nutrition) {
  const protein = nutrition?.protein;
  if (!(protein > 0)) return [];

  return FAO_EAA_PATTERN.map((item) => {
    const amountInfo = aminoPatternAmount(nutrition, item.keys);
    if (!amountInfo) {
      return {
        ...item,
        value: null,
        ratio: null,
        delta: null,
        barPercent: 0,
        partial: false,
        tone: 'missing',
      };
    }

    const value = amountInfo.amount / protein;
    const ratio = (value / item.standard) * 100;
    return {
      ...item,
      value,
      ratio,
      delta: ratio - 100,
      barPercent: Math.min((ratio / AMINO_PATTERN_SCALE_MAX) * 100, 100),
      partial: amountInfo.presentCount < item.keys.length,
      fallback: false,
      measured: true,
      basis: 'frontend_measured',
      fallbackSources: [],
      tone: ratio >= 100 ? 'enough' : 'low',
    };
  });
}

function buildAminoPatternRows(product, nutrition) {
  const scoreItems = product?.recommendationScores?.proteinDrinkDefault?.components?.amino_acids?.amino_acid_scores;
  const scoreRows = buildAminoPatternRowsFromScores(scoreItems);
  if (scoreRows.some((row) => row.value != null)) return scoreRows;
  return buildAminoPatternRowsFromNutrition(nutrition);
}

function AminoPatternSection({ product, nutrition }) {
  const rows = buildAminoPatternRows(product, nutrition);
  if (rows.length === 0) return null;

  const visibleRows = rows.filter((row) => row.value != null);
  if (visibleRows.length === 0) return null;

  const hasPartial = visibleRows.some((row) => row.partial);
  const hasFallback = visibleRows.some((row) => row.fallback);

  return (
    <AnalysisSection title="필수아미노산 구성" icon={<IconInfo size={16} />}>
      <div className="d-analysis-amino-pattern">
        <div
          className="d-analysis-amino-pattern-body"
          style={{ '--baseline-top': `${AMINO_PATTERN_BASELINE_TOP}px` }}
        >
          <div className="d-analysis-amino-pattern-rail">
            <span className="d-analysis-amino-pattern-legend d-analysis-amino-pattern-legend--fao">
              <i aria-hidden="true" />
              FAO 기준
            </span>
            <span className="d-analysis-amino-pattern-legend d-analysis-amino-pattern-legend--bcaa">
              <i aria-hidden="true" />
              BCAA
            </span>
            {hasFallback && (
              <span className="d-analysis-amino-pattern-legend d-analysis-amino-pattern-legend--fallback">
                <i aria-hidden="true" />
                원료 추정
              </span>
            )}
          </div>
          <div className="d-analysis-amino-pattern-chart">
            {rows.map((row) => (
              <div
                className={[
                  'd-analysis-amino-pattern-row',
                  `is-${row.tone}`,
                  ['leucine', 'isoleucine', 'valine'].includes(row.key) ? 'is-bcaa' : '',
                  row.partial ? 'is-partial' : '',
                  row.fallback ? 'is-fallback' : '',
                ].filter(Boolean).join(' ')}
                key={row.key}
                title={aminoPatternTitle(row)}
              >
                <span className="d-analysis-amino-pattern-label">
                  <span title={row.description ? `${row.label}: ${row.description}` : undefined}>
                    {row.label}
                  </span>
                </span>
                <div className="d-analysis-amino-pattern-track">
                  {row.value != null ? (
                    <span
                      className="d-analysis-amino-pattern-bar"
                      style={{ height: `${row.barPercent}%` }}
                    />
                  ) : (
                    <span className="d-analysis-amino-pattern-missing" />
                  )}
                </div>
                <span className="d-analysis-amino-pattern-value">
                  {row.value != null ? (
                    <>
                      <strong>{Math.round(row.ratio)}%</strong>
                      {row.fallback && <b>추정</b>}
                      {row.partial && <b>부분</b>}
                    </>
                  ) : (
                    '—'
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {hasPartial && (
          <p className="d-analysis-amino-pattern-note">
            부분 표시는 묶음 기준 중 일부 아미노산만 개별 수치가 있는 경우예요.
          </p>
        )}
        {hasFallback && (
          <p className="d-analysis-amino-pattern-note">
            추정 표시는 제품의 개별 아미노산 실측값이 없어, 단백질 원료 품질 점수를 가중 반영한 값이에요.
          </p>
        )}
      </div>
    </AnalysisSection>
  );
}

function allPositive(n, keys) {
  return keys.every((key) => typeof n?.[key] === 'number' && n[key] > 0);
}

function countPositive(n, keys) {
  return keys.filter((key) => typeof n?.[key] === 'number' && n[key] > 0).length;
}

function proteinCriterion(protein) {
  if (!Number.isFinite(protein)) {
    return {
      tone: 'neutral',
      grade: '-',
      label: '단백질 정보 없음',
      summary: '단백질 총량이 없어 1회 섭취량 판단은 제외했어요.',
      quickText: '단백질 총량 데이터가 필요해요.',
      basis: 'ISSN 운동 직후 1회 보충 컷 20~40g',
    };
  }
  if (protein < 5) {
    return {
      tone: 'poor',
      grade: 'D',
      label: '매우 낮음',
      summary: `단백질 ${formatG(protein)}입니다. 단백질 보충을 기대하기엔 부족한 함량입니다.`,
      quickText: '단백질 보충을 기대하기엔 부족한 함량입니다.',
      basis: '0~4.9g',
    };
  }
  if (protein < 10) {
    return {
      tone: 'light',
      grade: 'C',
      label: '낮음',
      summary: `단백질 ${formatG(protein)}입니다. 일반 식품보다는 보탬이 되지만, 단백질 보충용으로는 낮은 편입니다.`,
      quickText: '일반 식품보다는 보탬이 되지만, 단백질 보충용으로는 낮은 편입니다.',
      basis: '5~9.9g',
    };
  }
  if (protein < 16) {
    return {
      tone: 'near',
      grade: 'B',
      label: '보조 수준',
      summary: `단백질 ${formatG(protein)}입니다. 식사에 단백질을 가볍게 더하는 용도로 적합합니다.`,
      quickText: '식사에 단백질을 가볍게 더하는 용도로 적합합니다.',
      basis: '10~15.9g',
    };
  }
  if (protein < 20) {
    return {
      tone: 'solid',
      grade: 'B+',
      label: '기준 근접',
      summary: `단백질 ${formatG(protein)}입니다. 1회 보충 기준에 거의 근접한 함량입니다.`,
      quickText: '1회 보충 기준에 거의 근접한 함량입니다.',
      basis: '16~19.9g',
    };
  }
  if (protein < 24) {
    return {
      tone: 'strong',
      grade: 'A-',
      label: '기준 충족',
      summary: `단백질 ${formatG(protein)}입니다. 운동 후 1회 보충용으로 볼 수 있는 기본 함량을 충족합니다.`,
      quickText: '운동 후 1회 보충용으로 볼 수 있는 기본 함량을 충족합니다.',
      basis: '20~23.9g',
    };
  }
  if (protein < 28) {
    return {
      tone: 'high',
      grade: 'A',
      label: '충분함',
      summary: `단백질 ${formatG(protein)}입니다. 1회 단백질 보충용으로 충분한 함량입니다.`,
      quickText: '1회 단백질 보충용으로 충분한 함량입니다.',
      basis: '24~27.9g',
    };
  }
  if (protein < 32) {
    return {
      tone: 'very-high',
      grade: 'A+',
      label: '높은 편',
      summary: `단백질 ${formatG(protein)}입니다. 일반적인 1회 보충 기준에서 높은 편에 속합니다.`,
      quickText: '일반적인 1회 보충 기준에서 높은 편에 속합니다.',
      basis: '28~31.9g',
    };
  }
  if (protein < 40) {
    return {
      tone: 'very-high',
      grade: 'S',
      label: '매우 높음',
      summary: `단백질 ${formatG(protein)}입니다. 1회 섭취 기준으로 상당히 높은 단백질 함량입니다.`,
      quickText: '1회 섭취 기준으로 상당히 높은 단백질 함량입니다.',
      basis: '32~39.9g',
    };
  }
  return {
    tone: 'very-high',
    grade: 'S+',
    label: '초고함량',
    summary: `단백질 ${formatG(protein)}입니다. 운동 후 보충 권장 범위의 상단을 넘는 고용량입니다.`,
    quickText: '운동 후 보충 권장 범위의 상단을 넘는 고용량입니다.',
    basis: '40g 이상',
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

function formatAminoQualityScore(score) {
  if (typeof score !== 'number' || !Number.isFinite(score)) return null;
  return `${Math.round(score).toLocaleString()}점`;
}

function aminoQualitySummary(tier) {
  const summaries = {
    F: '필수아미노산 구성이 크게 부족해요.',
    D: '필수아미노산 구성이 부족한 편이에요.',
    C: '일부 필수아미노산이 기준에 많이 못 미쳐요.',
    B: '단백질 품질이 다소 아쉬운 편이에요.',
    'B+': '부족한 아미노산이 일부 남아 있어요.',
    'A-': '기준에 거의 근접한 아미노산 구성이에요.',
    A: '기준을 충족하는 아미노산 구성이에요.',
    'A+': '기준을 안정적으로 넘는 좋은 구성이에요.',
    S: '기준을 충분히 넘는 우수한 구성이에요.',
    'S+': '기준을 크게 넘는 매우 우수한 구성이에요.',
  };
  return summaries[tier] ?? '아미노산 구성 점수 데이터가 없어요.';
}

function aminoQualityJudgment(product) {
  const metric = getProteinDrinkScoreModel(product).aminoQuality;
  const limitingText = metric.limiting ? `제한 아미노산: ${metric.limiting}` : null;
  const helpDetail = '제품에 표시된 아미노산 정보를 우선 사용하고, 없는 값은 원료 정보를 바탕으로 추정했어요.';

  return {
    value: formatAminoQualityScore(metric.value),
    grade: metric.tier,
    tone: metric.tone,
    text: limitingText ? [aminoQualitySummary(metric.tier), limitingText] : aminoQualitySummary(metric.tier),
    help: helpDetail,
    helpDetail,
  };
}

function formatUnitPrice(value) {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return `개당 ${Math.round(n).toLocaleString()}원`;
}

function proteinAmountJudgment(product, nutrition, fallbackVerdict) {
  const metric = getProteinDrinkScoreModel(product).proteinAmount;
  return {
    grade: metric.tier,
    tone: metric.tone,
    text: fallbackVerdict.quickText ?? proteinQuickText(metric.tone),
  };
}

function calorieEfficiencyJudgment(product) {
  const metric = getProteinDrinkScoreModel(product).calorieEfficiency;
  if (metric.value == null) {
    return {
      value: null,
      grade: 'N/A',
      tone: 'caution',
      text: '칼로리 효율 티어 데이터가 없어요.',
      helpDetail: '비슷한 단백질 품질이라면 칼로리가 낮을수록 좋게 봐요.',
    };
  }
  return {
    value: formatEfficiencyValue(metric.value),
    grade: metric.tier,
    tone: metric.tone,
    text: '적은 칼로리로 단백질을 얼마나 잘 채워주는지 평가한 등급이에요.',
    helpDetail: '비슷한 단백질 품질이라면 칼로리가 낮을수록 좋게 봐요.',
  };
}

function priceEfficiencyJudgment(product) {
  const metric = getProteinDrinkScoreModel(product).priceEfficiency;
  const unitPrice = formatUnitPrice(cheapestUnitPrice(product));
  if (!metric.available) {
    return {
      value: null,
      grade: 'N/A',
      tone: 'caution',
      text: '가격 정보가 없습니다.',
      helpDetail: [
        '가격이 확인되면 단백질 품질 대비 가격이 괜찮은지 보여줄게요.',
        '가격 정보는 실제 판매처와 다를 수 있어요.',
      ],
    };
  }
  return {
    value: formatEfficiencyValue(metric.value),
    grade: metric.tier,
    tone: metric.tone,
    text: [
      '가격 대비 단백질 효율을 보여주는 등급이에요.',
      unitPrice ? `현재 최저가: ${unitPrice}` : '현재 최저가: 가격 정보 없음',
    ],
    helpDetail: [
      '비슷한 단백질 품질이라면 가격이 낮을수록 좋게 봐요.',
      '가격 정보는 실제 판매처와 다를 수 있어요.',
    ],
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

function gradeForTone(tone) {
  if (tone === 'very-high') return 'A+';
  if (tone === 'high') return 'A';
  if (tone === 'strong') return 'A-';
  if (tone === 'solid') return 'B+';
  if (tone === 'near') return 'B';
  if (tone === 'light') return 'C';
  if (tone === 'poor') return 'D';
  if (tone === 'caution') return 'N/A';
  if (tone === 'neutral') return '-';
  return '-';
}

function ProteinGradeTooltip() {
  return (
    <span className="d-analysis-protein-grade-table" role="table" aria-label="단백질 총량 등급 기준">
      <span className="d-analysis-protein-grade-row is-head" role="row">
        <span role="columnheader">함량</span>
        <span role="columnheader">등급</span>
        <span role="columnheader">라벨</span>
      </span>
      {PROTEIN_GRADE_ROWS.map((row) => (
        <span key={row.grade} className="d-analysis-protein-grade-row" role="row">
          <span role="cell">{row.range}</span>
          <strong role="cell">{row.grade}</strong>
          <span role="cell">{row.label}</span>
        </span>
      ))}
      <span className="d-analysis-protein-grade-note">
        ISSN(국제스포츠영양학회)은 운동 직후 1회 단백질 보충량으로 20~40g 범위를 제시합니다.
      </span>
    </span>
  );
}

function MultilineText({ value }) {
  if (Array.isArray(value)) {
    return value.map((line, index) => (
      <Fragment key={line}>
        {index > 0 && <br />}
        {line}
      </Fragment>
    ));
  }
  return value;
}

function EfficiencyGradeTooltip({ ariaLabel, valueHeader, rows, detail }) {
  return (
    <span className="d-analysis-protein-grade-table" role="table" aria-label={ariaLabel}>
      <span className="d-analysis-protein-grade-row is-head" role="row">
        <span role="columnheader">{valueHeader}</span>
        <span role="columnheader">등급</span>
        <span role="columnheader">의미</span>
      </span>
      {rows.map((row) => (
        <span key={row.grade} className="d-analysis-protein-grade-row" role="row">
          <span role="cell">{row.range}</span>
          <strong role="cell">{row.grade}</strong>
          <span role="cell">{row.label}</span>
        </span>
      ))}
      <span className="d-analysis-protein-grade-note">
        <MultilineText value={detail} />
      </span>
    </span>
  );
}

function AminoQualityGradeTooltip({ detail }) {
  return (
    <span className="d-analysis-protein-grade-table" role="table" aria-label="아미노산 구성 등급 기준">
      <span className="d-analysis-protein-grade-row is-head" role="row">
        <span role="columnheader">점수</span>
        <span role="columnheader">등급</span>
        <span role="columnheader">의미</span>
      </span>
      {AMINO_QUALITY_GRADE_ROWS.map((row) => (
        <span key={row.grade} className="d-analysis-protein-grade-row" role="row">
          <span role="cell">{row.range}</span>
          <strong role="cell">{row.grade}</strong>
          <span role="cell">{row.label}</span>
        </span>
      ))}
      <span className="d-analysis-protein-grade-note">
        <MultilineText value={detail} />
      </span>
    </span>
  );
}

function SummaryGradeRow({ title, value, tone, grade: gradeProp, text, help, helpLabel, helpContent }) {
  const isMissingValue = value === '정보 없음' || value === '데이터 없음' || value == null;
  const grade = gradeProp ?? gradeForTone(tone);
  const gradeClass = String(grade).toLowerCase().replace(/\+/g, 'plus').replace(/-/g, 'minus').replace(/[^a-z0-9]/g, '');
  const valueMatch = typeof value === 'string' ? value.match(/^(.+?)(g|mg)$/) : null;
  const tooltipLabel = helpLabel ?? help;

  return (
    <div className={`d-analysis-grade-row is-${tone} is-grade-${gradeClass}`}>
      <div className="d-analysis-grade-mark" aria-label={`${title} 등급 ${grade}`}>
        {grade}
      </div>
      <div className="d-analysis-grade-main">
        <div className="d-analysis-grade-head">
          <span className="d-analysis-grade-title">{title}</span>
          {(help || helpContent) && (
            <span className="d-analysis-help d-analysis-grade-help" tabIndex="0" aria-label={tooltipLabel}>
              ?
              <span className={`d-analysis-help-bubble${helpContent ? ' is-rich' : ''}`} role="tooltip">{helpContent ?? help}</span>
            </span>
          )}
        </div>
        <p className="d-analysis-grade-text">
          <MultilineText value={text} />
        </p>
      </div>
      <strong className={`d-analysis-grade-value${isMissingValue ? ' is-missing' : ''}`}>
        {valueMatch ? (
          <>
            {valueMatch[1]}
            <span className="d-analysis-grade-unit">{valueMatch[2]}</span>
          </>
        ) : (
          value ?? '정보 없음'
        )}
      </strong>
    </div>
  );
}

function KeyJudgmentSection({ product, nutrition, proteinVerdict }) {
  const proteinAmount = proteinAmountJudgment(product, nutrition, proteinVerdict);
  const aminoQuality = aminoQualityJudgment(product);
  const calorieEfficiency = calorieEfficiencyJudgment(product);
  const priceEfficiency = priceEfficiencyJudgment(product);

  return (
    <div className="d-analysis-grade-summary" aria-label="핵심 판단 요약">
      <SummaryGradeRow
        title="단백질 총량"
        value={formatG(nutrition?.protein)}
        tone={proteinAmount.tone}
        grade={proteinAmount.grade}
        text={proteinAmount.text}
        helpLabel="단백질 총량 등급 기준"
        helpContent={<ProteinGradeTooltip />}
      />
      <SummaryGradeRow
        title="아미노산 구성"
        value={aminoQuality.value}
        tone={aminoQuality.tone}
        grade={aminoQuality.grade}
        text={aminoQuality.text}
        helpLabel="아미노산 구성 등급 기준"
        helpContent={<AminoQualityGradeTooltip detail={aminoQuality.helpDetail} />}
      />
      <SummaryGradeRow
        title="칼로리 효율"
        value={calorieEfficiency.value}
        tone={calorieEfficiency.tone}
        grade={calorieEfficiency.grade}
        text={calorieEfficiency.text}
        helpLabel="칼로리 효율 등급 기준"
        helpContent={(
          <EfficiencyGradeTooltip
            ariaLabel="칼로리 효율 등급 기준"
            valueHeader="값"
            rows={CALORIE_EFFICIENCY_GRADE_ROWS}
            detail={calorieEfficiency.helpDetail}
          />
        )}
      />
      <SummaryGradeRow
        title="가성비"
        value={priceEfficiency.value}
        tone={priceEfficiency.tone}
        grade={priceEfficiency.grade}
        text={priceEfficiency.text}
        helpLabel="가성비 등급 기준"
        helpContent={(
          <EfficiencyGradeTooltip
            ariaLabel="가성비 등급 기준"
            valueHeader="값"
            rows={PRICE_EFFICIENCY_GRADE_ROWS}
            detail={priceEfficiency.helpDetail}
          />
        )}
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

const NEGATIVE_NUTRIENT_TIERS = {
  sugar: [
    { max: 1, label: '낮음', tone: 'low' },
    { max: 5, label: '보통', tone: 'low' },
    { max: 10, label: '조금 높음', tone: 'mid' },
    { max: 15, label: '높음', tone: 'mid' },
    { max: 20, label: '매우 높음', tone: 'high' },
    { max: Infinity, label: '과다', tone: 'high' },
  ],
  saturatedFat: [
    { max: 0.5, label: '낮음', tone: 'low' },
    { max: 1, label: '보통', tone: 'low' },
    { max: 1.5, label: '조금 높음', tone: 'mid' },
    { max: 2, label: '높음', tone: 'mid' },
    { max: 2.5, label: '매우 높음', tone: 'high' },
    { max: Infinity, label: '과다', tone: 'high' },
  ],
  sodium: [
    { max: 200, label: '낮음', tone: 'low' },
    { max: 300, label: '보통', tone: 'low' },
    { max: 400, label: '조금 높음', tone: 'mid' },
    { max: 500, label: '높음', tone: 'mid' },
    { max: 600, label: '매우 높음', tone: 'high' },
    { max: Infinity, label: '과다', tone: 'high' },
  ],
};

function negativeNutrientLevel(type, amount) {
  const n = typeof amount === 'number' ? amount : Number(amount);
  if (!Number.isFinite(n)) return { label: '정보 없음', tone: 'unknown' };
  return NEGATIVE_NUTRIENT_TIERS[type]?.find((tier) => n <= tier.max) ?? { label: '정보 없음', tone: 'unknown' };
}

function negativeNutrientText(type, amount) {
  const n = typeof amount === 'number' ? amount : Number(amount);
  if (!Number.isFinite(n)) return '표시된 수치가 없어 제품 상세 정보에서 확인이 필요합니다.';

  if (type === 'sugar') {
    if (n <= 0) return '당류가 없어 단백질 보충용으로 깔끔한 편입니다. 단맛은 감미료 구성으로 확인하세요.';
    if (n <= 1) return '당류가 거의 없어 단백질 보충용으로 깔끔한 편입니다. 단맛은 감미료 구성으로 확인하세요.';
    if (n <= 5) return '단백질 음료 기준으로 무난한 당류입니다. 저당 제품을 찾는다면 더 낮은 제품이 유리합니다.';
    if (n <= 10) return '당류가 어느 정도 있는 구간입니다. 저당 목적이라면 아쉬울 수 있습니다.';
    if (n <= 15) return '당류가 꽤 있는 편입니다. 단백질 보충용보다는 달달한 음료에 가까워집니다.';
    if (n <= 20) return '당류가 높은 편입니다. 매일 마시는 보충용으로는 부담이 커질 수 있습니다.';
    return '당류가 매우 높아 주의가 필요합니다.';
  }

  if (type === 'saturatedFat') {
    if (n <= 0) return '포화지방 부담이 없습니다.';
    if (n <= 0.5) return '포화지방 부담이 매우 낮습니다.';
    if (n <= 1) return '포화지방 부담이 낮은 편입니다.';
    if (n <= 1.5) return '포화지방이 조금 있는 편입니다.';
    if (n <= 2) return '포화지방이 높은 편입니다.';
    if (n <= 2.5) return '포화지방 부담이 큽니다.';
    return '포화지방 부담이 매우 큽니다.';
  }

  if (type === 'sodium') {
    if (n <= 0) return '나트륨 부담이 없습니다.';
    if (n <= 200) return '나트륨 부담이 낮은 편입니다.';
    if (n <= 300) return '나트륨 부담이 크지 않은 수준입니다.';
    if (n <= 400) return '나트륨이 조금 있는 편입니다.';
    if (n <= 500) return '나트륨이 높은 편입니다.';
    if (n <= 600) return '나트륨 부담이 큰 편입니다.';
    return '나트륨 부담이 매우 큰 편입니다.';
  }

  return '제품의 표시 수치를 기준으로 참고하세요.';
}

function NegativeNutrientRow({ label, amount, value, type }) {
  const level = negativeNutrientLevel(type, amount);
  return (
    <div className={`d-analysis-negative-row is-${level.tone}`}>
      <span className="d-analysis-negative-name">{label}</span>
      <strong className="d-analysis-negative-value">{value ?? '정보 없음'}</strong>
      <span className="d-analysis-negative-status">{level.label}</span>
      <p>{negativeNutrientText(type, amount)}</p>
    </div>
  );
}

function NegativeNutrientsSection({ nutrition }) {
  return (
    <AnalysisSection title="주의 영양성분" icon={<IconAlert size={16} />} compact>
      <div className="d-analysis-negative">
        <div className="d-analysis-negative-table">
          <NegativeNutrientRow
            label="당류"
            type="sugar"
            amount={nutrition?.sugar}
            value={formatGAllowZero(nutrition?.sugar)}
          />
          <NegativeNutrientRow
            label="포화지방"
            type="saturatedFat"
            amount={nutrition?.saturatedFat}
            value={formatGAllowZero(nutrition?.saturatedFat)}
          />
          <NegativeNutrientRow
            label="나트륨"
            type="sodium"
            amount={nutrition?.sodium}
            value={formatMgAllowZero(nutrition?.sodium)}
          />
        </div>
      </div>
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

function foodCategoryNutrientDescription(fn) {
  return fn?.food_category_description ?? fn?.foodCategoryDescription ?? null;
}

function supportNutrientName(fn) {
  const categoryDescription = foodCategoryNutrientDescription(fn);
  return categoryDescription?.display_label || fn?.nutrients?.name_ko || fn?.nutrient_code || '';
}

function formatNutrientAmount(fn) {
  if (fn.amount_text) return fn.amount_text;
  const unit = fn.unit || fn.nutrients?.default_unit || '';
  return fn.amount != null ? `${fn.amount}${unit}` : '-';
}

function SupportNutrientRow({ fn }) {
  const name = supportNutrientName(fn);
  const categoryDescription = foodCategoryNutrientDescription(fn);
  const info = categoryDescription?.description || '-';
  return (
    <div className="d-analysis-ingr-card is-neutral d-analysis-other-card">
      <div className="d-analysis-ingr-head">
        <span className="d-analysis-ingr-name">{name}</span>
        <strong className="d-analysis-other-amount">{formatNutrientAmount(fn)}</strong>
      </div>
      <p className="d-analysis-ingr-text">{info}</p>
    </div>
  );
}

function ProteinDrinkSupportNutrientsSection({ foodNutrients }) {
  const others = (foodNutrients ?? [])
    .filter((fn) => !OTHER_NUTRIENT_EXCLUDE.has(fn.nutrient_code) && !isAggAminoName(fn.nutrients?.name_ko))
    .sort((a, b) => (a.nutrients?.display_order ?? 999) - (b.nutrients?.display_order ?? 999));
  const scoredItems = others
    .filter((fn) => foodCategoryNutrientDescription(fn))
    .sort((a, b) => (
      (foodCategoryNutrientDescription(a)?.sort_order ?? 100)
      - (foodCategoryNutrientDescription(b)?.sort_order ?? 100)
    ));
  const referenceItems = others.filter((fn) => !scoredItems.includes(fn));

  return (
    <AnalysisSection title="보조 영양/기능 성분" icon={<IconInfo size={16} />} compact>
      {others.length > 0 ? (
        <div className="d-analysis-support">
          {scoredItems.length > 0 && (
            <div className="d-analysis-support-group">
              <h4 className="d-analysis-support-title">의미 있는 보조 성분</h4>
              <div className="d-analysis-ingredients is-subtle">
                {scoredItems.map((fn) => <SupportNutrientRow key={fn.nutrient_code} fn={fn} />)}
              </div>
            </div>
          )}
          {referenceItems.length > 0 && (
            <div className="d-analysis-support-group">
              <h4 className="d-analysis-support-title">참고 성분</h4>
              <div className="d-analysis-ingredients is-subtle">
                {referenceItems.map((fn) => <SupportNutrientRow key={fn.nutrient_code} fn={fn} />)}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="d-analysis-empty-note">추가 영양성분 정보가 없어요.</p>
      )}
    </AnalysisSection>
  );
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
            return (
              <div key={fn.nutrient_code} className="d-analysis-ingr-card is-neutral d-analysis-other-card">
                <div className="d-analysis-ingr-head">
                  <span className="d-analysis-ingr-name">{name}</span>
                  <strong className="d-analysis-other-amount">{formatNutrientAmount(fn)}</strong>
                </div>
                <p className="d-analysis-ingr-text">-</p>
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

function ProteinDrinkReport({ product, nutrition, ingredients, proteinNotes, foodNutrients, rawText, annotations }) {
  const proteinVerdict = proteinCriterion(nutrition?.protein ?? 0);

  return (
    <section className="d-detail-card d-detail-report">
      <header className="d-detail-card-head">
        <h2 className="d-detail-card-title">분석 리포트</h2>
      </header>
      <KeyJudgmentSection
        product={product}
        nutrition={nutrition}
        proteinVerdict={proteinVerdict}
      />
      <AminoPatternSection product={product} nutrition={nutrition} />
      <ProteinSourceSection proteinNotes={proteinNotes} />
      <NegativeNutrientsSection nutrition={nutrition} />
      <ProteinDrinkSupportNutrientsSection foodNutrients={foodNutrients} />
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
                  {note.type || '대체당'}
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
              {note.text && <p className="d-analysis-ingr-text">{note.text}</p>}
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
      benefitsText: sweetener.benefitsText,
      cautionsText: sweetener.cautionsText,
      text: [sweetener.benefitsText, sweetener.cautionsText].filter(Boolean).join(' '),
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
        nutrition={n}
        ingredients={ing}
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
