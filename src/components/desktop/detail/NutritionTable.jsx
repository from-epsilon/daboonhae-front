import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { NUTRIENT_GROUP, isNutrientGroup } from '../../../data/nutrientGroups.js';

// 접힘 기본 표시 영양소 — 열·탄·당·지
const BASE_CODES = ['energy_kcal', 'carbohydrate_g', 'sugars_g', 'fat_g'];

const NUTRIENT_ORDER = [
  { code: 'energy_kcal',     indent: false },
  { code: 'carbohydrate_g',  indent: false },
  { code: 'sugars_g',        indent: true },
  { code: 'dietary_fiber',   indent: true },
  { code: 'src_알룰로오스_g', indent: true },
  { code: 'protein_g',       indent: false },
  { code: 'fat_g',           indent: false },
  { code: 'saturated_fat_g', indent: true },
  { code: 'trans_fat_g',     indent: true },
  { code: 'cholesterol_mg',  indent: false },
  { code: 'sodium_mg',       indent: false },
];

const KNOWN_CODES = new Set(NUTRIENT_ORDER.map(r => r.code));

// EAA·BCAA·개별 아미노산은 별도 집계 행(aminoRows)으로 표기 →
// extras(전체 보기)에서는 제외해 중복 노출 방지
const AMINO_CODES = new Set([
  'src_eaa_mg', 'src_bcaa_mg', 'eaa', 'bcaa',
  'leucine', 'isoleucine', 'valine', 'lysine', 'methionine',
  'phenylalanine', 'threonine', 'tryptophan', 'histidine',
]);
// 비필수/조건부필수 아미노산 한글명 — group_name이 비어있을 때의 폴백 판별용
const NON_ESSENTIAL_AMINO_NAMES = new Set([
  '아르기닌', '글루타민', '글루탐산', '글루타민산', '알라닌',
  '아스파르트산', '아스파라긴산', '아스파라긴', '시스테인', '시스틴',
  '글리신', '프롤린', '세린', '티로신', '타이로신', '타우린',
  '오르니틴', '시트룰린',
]);

// 아미노산(필수·비필수·집계) 판별 — 우측 열에 모으고 좌측 extras에서는 제외
// 1) 알려진 코드/라벨, 2) nutrients.group_name='아미노산', 3) 한글명 폴백
function isAminoNutrient(fn) {
  if (AMINO_CODES.has(fn.nutrient_code)) return true;
  const name = (fn.nutrients?.name_ko || '').trim();
  const upper = name.toUpperCase();
  if (upper === 'EAA' || upper === 'BCAA') return true;
  if (isNutrientGroup(fn, NUTRIENT_GROUP.AMINO_ACID)) return true;
  return NON_ESSENTIAL_AMINO_NAMES.has(name);
}

// ── 아미노산 계층 템플릿
// EAA(필수아미노산) > BCAA(3종) + 비BCAA 필수아미노산(6종)
// BCAA 3종(류신·이소류신·발린)
const BCAA_KEYS = [
  { code: 'leucine', label: '류신' },
  { code: 'isoleucine', label: '이소류신' },
  { code: 'valine', label: '발린' },
];
// BCAA가 아닌 필수아미노산 6종
const NON_BCAA_EAA_KEYS = [
  { code: 'histidine', label: '히스티딘' },
  { code: 'lysine', label: '라이신' },
  { code: 'methionine', label: '메티오닌' },
  { code: 'phenylalanine', label: '페닐알라닌' },
  { code: 'threonine', label: '트레오닌' },
  { code: 'tryptophan', label: '트립토판' },
];
const EAA_KEYS = [...BCAA_KEYS, ...NON_BCAA_EAA_KEYS];
// EAA/BCAA 집계 컬럼 후보 코드 — DB에 집계값이 별도로 있을 수 있음(없으면 개별값 합산)
const EAA_AGG_CODES = ['src_eaa_mg', 'eaa'];
const BCAA_AGG_CODES = ['src_bcaa_mg', 'bcaa'];

const MANDATORY_CODES = new Set([
  'energy_kcal',
  'carbohydrate_g',
  'sugars_g',
  'dietary_fiber',
  'src_알룰로오스_g',
  'protein_g',
  'fat_g',
  'saturated_fat_g',
  'trans_fat_g',
  'cholesterol_mg',
  'sodium_mg',
]);

const VITAMIN_NAME_PATTERN = /비타민|엽산|나이아신|비오틴|판토텐산/i;
const MINERAL_NAME_PATTERN = /칼슘|철|아연|마그네슘|칼륨|셀레늄|구리|망간|요오드|크롬|몰리브덴/i;

function micronutrientType(fn) {
  const name = fn.nutrients?.name_ko || '';
  if (isNutrientGroup(fn, NUTRIENT_GROUP.VITAMIN) || VITAMIN_NAME_PATTERN.test(name)) {
    return 'vitamin';
  }
  if (isNutrientGroup(fn, NUTRIENT_GROUP.MINERAL) || fn.nutrients?.group_name === '무기질' || MINERAL_NAME_PATTERN.test(name)) {
    return 'mineral';
  }
  return null;
}

function formatValue(fn, ratio) {
  if (ratio === 1) {
    if (fn.amount_text) return fn.amount_text;
    const unit = fn.unit || fn.nutrients?.default_unit || '';
    return fn.amount != null ? `${fn.amount}${unit}` : '-';
  }
  if (fn.amount == null) return '-';
  const converted = Math.round(fn.amount * ratio * 10) / 10;
  const unit = fn.unit || fn.nutrients?.default_unit || '';
  return `${converted}${unit}`;
}

function nutrientInfo(fn) {
  const benefits = fn?.nutrients?.benefits_text;
  const cautions = fn?.nutrients?.cautions_text;
  return [benefits, cautions].filter(Boolean).join(' ') || null;
}

function splitDisplayValue(display) {
  const text = String(display ?? '').trim();
  const match = text.match(/^(-?\d[\d,]*(?:\.\d+)?)(.*)$/);
  if (!match) return { num: text, unit: '' };
  return {
    num: match[1],
    unit: match[2].trim(),
  };
}

function NutritionCell({ label, display, info, depth = 0, muted = false, extra = false }) {
  const cls = [
    'd-detail-nutri-cell',
    depth >= 1 ? 'is-indent' : '',
    depth >= 2 ? 'is-indent-2' : '',
    depth >= 3 ? 'is-indent-3' : '',
    muted ? 'is-muted' : '',
    extra ? 'is-extra' : '',
  ].filter(Boolean).join(' ');
  const value = splitDisplayValue(display);
  return (
    <li className={cls} title={info || undefined}>
      <div className="d-detail-nutri-cell-label">
        <span>{label}</span>
      </div>
      <div className="d-detail-nutri-cell-value">
        <span className="d-detail-nutri-cell-num">{value.num}</span>
        {value.unit && <span className="d-detail-nutri-cell-unit">{value.unit}</span>}
      </div>
    </li>
  );
}

function BasisToggle({ basis, onChangeBasis, servingSize, servingUnit }) {
  const unit = servingUnit?.includes('ml') ? 'ml' : 'g';
  const servingLabel = servingSize ? `${servingSize}${unit} 기준` : '1회 제공량';
  const options = [
    { key: 'serving', label: servingLabel },
    { key: 'per100', label: `100${unit} 기준` },
  ];
  return (
    <div className="d-detail-nutri-toggle">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          className={`d-detail-nutri-toggle-btn${basis === o.key ? ' is-active' : ''}`}
          onClick={() => onChangeBasis(o.key)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function NutritionTable({ nutrition, serving, foodNutrients, servingSize, servingUnit, categoryCode, expanded = false, onToggleExpand }) {
  const [basis, setBasis] = useState('serving');
  const isShake = categoryCode === 'shake';

  const ratio = useMemo(() => {
    if (basis === 'serving' || !servingSize || servingSize <= 0) return 1;
    return 100 / servingSize;
  }, [basis, servingSize]);

  const unit = servingUnit?.includes('ml') ? 'ml' : 'g';

  const { mandatoryRows, optionalRows, micronutrientRows, proteinRow } = useMemo(() => {
    if (!foodNutrients || foodNutrients.length === 0) {
      return { mandatoryRows: [], optionalRows: [], micronutrientRows: [], proteinRow: null };
    }

    const byCode = {};
    for (const fn of foodNutrients) {
      byCode[fn.nutrient_code] = fn;
    }

    const mandatory = [];
    const optional = [];
    const micronutrients = [];
    let protein = null;

    for (const spec of NUTRIENT_ORDER) {
      const fn = byCode[spec.code];
      if (!fn) continue;
      const row = {
        key: spec.code,
        label: fn.nutrients?.name_ko || spec.code,
        display: formatValue(fn, ratio),
        info: nutrientInfo(fn),
        indent: spec.indent,
      };
      if (spec.code === 'protein_g') {
        protein = { ...row, depth: 0 };
        continue;
      }
      if (MANDATORY_CODES.has(spec.code)) mandatory.push(row);
      else optional.push(row);
    }

    const extras = foodNutrients
      .filter(fn => !KNOWN_CODES.has(fn.nutrient_code) && !isAminoNutrient(fn))
      .sort((a, b) => (a.nutrients?.display_order ?? 999) - (b.nutrients?.display_order ?? 999));

    for (const fn of extras) {
      const row = {
        key: fn.nutrient_code,
        label: fn.nutrients?.name_ko || fn.nutrient_code,
        display: formatValue(fn, ratio),
        info: nutrientInfo(fn),
        indent: false,
      };
      const microType = micronutrientType(fn);
      if (isShake && microType) {
        micronutrients.push({ ...row, microType });
      } else {
        optional.push(row);
      }
    }

    return { mandatoryRows: mandatory, optionalRows: optional, micronutrientRows: micronutrients, proteinRow: protein };
  }, [foodNutrients, isShake, ratio]);

  // 아미노산 계층 트리 — EAA > (BCAA > 3종) + 비BCAA 필수아미노산 6종
  // - 집계값(EAA/BCAA)은 개별값이 전부 있으면 합산, 하나라도 비면 DB 집계 컬럼 폴백
  // - 개별 수치가 없으면 '-' 표시(muted)
  const aminoTree = useMemo(() => {
    const byCode = {};
    for (const fn of foodNutrients ?? []) byCode[fn.nutrient_code] = fn;

    // 코드의 원시 수치(mg) — 없으면 null
    const amountOf = (code) => {
      const fn = byCode[code];
      return fn && typeof fn.amount === 'number' ? fn.amount : null;
    };
    // 집계 후보 코드 중 먼저 존재하는 값
    const aggOf = (codes) => {
      for (const c of codes) { const v = amountOf(c); if (v != null) return v; }
      return null;
    };
    const infoOf = (codes) => {
      for (const c of codes) {
        const info = nutrientInfo(byCode[c]);
        if (info) return info;
      }
      return null;
    };
    // 개별값 합 — 하나라도 있으면 합, 전무하면 null
    const sumOf = (keys) => {
      const vals = keys.map((k) => amountOf(k.code)).filter((v) => v != null);
      return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) : null;
    };
    // 개별값이 전부(모든 키) 0보다 큰 실측값이면 합산, 하나라도 비거나 0이면 집계값(폴백)
    // (0은 '미측정'으로 간주 — computeEaa/computeBcaa의 n[k] > 0 기준과 동일하게 맞춤)
    const totalOf = (keys, aggCodes) => {
      const allHere = keys.every((k) => amountOf(k.code) > 0);
      return allHere ? sumOf(keys) : aggOf(aggCodes);
    };

    const bcaaTotal = totalOf(BCAA_KEYS, BCAA_AGG_CODES);
    const eaaTotal = totalOf(EAA_KEYS, EAA_AGG_CODES);

    // 비필수 아미노산(아르기닌·글루타민 등) — 필수 9종/집계가 아닌 아미노산
    const essentialCodes = new Set([
      ...EAA_KEYS.map((k) => k.code), ...EAA_AGG_CODES, ...BCAA_AGG_CODES,
    ]);
    const nonEssential = (foodNutrients ?? [])
      .filter((fn) => {
        if (!isAminoNutrient(fn) || essentialCodes.has(fn.nutrient_code)) return false;
        const up = (fn.nutrients?.name_ko || '').trim().toUpperCase();
        return up !== 'EAA' && up !== 'BCAA';
      })
      .sort((a, b) => (a.nutrients?.display_order ?? 999) - (b.nutrients?.display_order ?? 999));

    // 아미노산 데이터가 전무하면 트리 자체를 숨김(저당·식사대용 등)
    const hasAmino = eaaTotal != null || bcaaTotal != null
      || EAA_KEYS.some((k) => amountOf(k.code) != null)
      || nonEssential.length > 0;
    if (!hasAmino) return [];

    const fmtMg = (v) => {
      if (v == null) return '-';
      const scaled = v * ratio;
      return scaled >= 1000
        ? `${Math.round(scaled).toLocaleString()}mg`
        : `${Math.round(scaled * 10) / 10}mg`;
    };
    const aminoRow = (key, label, value, depth, info) => ({
      key, label, display: fmtMg(value), depth, info, muted: value == null,
    });

    const rows = [];
    // EAA (필수아미노산) — 단백질 하위
    rows.push(aminoRow('eaa', '필수 아미노산(EAA)', eaaTotal, 1, infoOf(EAA_AGG_CODES)));
    // BCAA — EAA 하위
    rows.push(aminoRow('bcaa', 'BCAA', bcaaTotal, 2, infoOf(BCAA_AGG_CODES)));
    // BCAA 3종 — BCAA 하위
    for (const k of BCAA_KEYS) rows.push(aminoRow(k.code, k.label, amountOf(k.code), 3, nutrientInfo(byCode[k.code])));
    // 비BCAA 필수아미노산 6종 — EAA 하위(BCAA와 동위)
    for (const k of NON_BCAA_EAA_KEYS) rows.push(aminoRow(k.code, k.label, amountOf(k.code), 2, nutrientInfo(byCode[k.code])));
    // 비필수 아미노산 — 단백질 하위(depth 1)
    for (const fn of nonEssential) {
      rows.push({
        key: fn.nutrient_code,
        label: fn.nutrients?.name_ko || fn.nutrient_code,
        display: formatValue(fn, ratio),
        depth: 1,
        info: nutrientInfo(fn),
        muted: fn.amount == null,
      });
    }
    return rows;
  }, [foodNutrients, ratio]);

  // 접힘 땐 부모만(좌: 열·탄·단·지 / 우: EAA·BCAA) 보이고,
  // 펼치면 자식·추가 영양소 행이 부모 아래로 슬라이드 오픈됨(아코디언)
  const isLeftExtra = (key) => !BASE_CODES.includes(key);
  const isProteinDrink = categoryCode === 'protein_drink';
  const isAminoExtra = (key) => key !== 'eaa' && key !== 'bcaa' && !(isProteinDrink && key === 'leucine');
  const vitaminRows = isShake ? micronutrientRows.filter((r) => r.microType === 'vitamin') : [];
  const mineralRows = isShake ? micronutrientRows.filter((r) => r.microType === 'mineral') : [];
  const rightRows = proteinRow ? [{ ...proteinRow, key: 'protein_g' }, ...aminoTree] : aminoTree;
  const showRightColumn = isShake
    ? micronutrientRows.length > 0 || rightRows.length > 0
    : rightRows.length > 0;

  return (
    <section className="d-detail-card d-detail-nutri">
      <header className="d-detail-card-head">
        <h2 className="d-detail-card-title">영양성분</h2>
        <div className="d-detail-nutri-head-actions">
          {servingSize > 0 && servingSize !== 100 && (
            <BasisToggle basis={basis} onChangeBasis={setBasis} servingSize={servingSize} servingUnit={servingUnit} />
          )}
          {servingSize === 100 && (
            <span className="d-detail-card-sub">100{unit} 기준</span>
          )}
          {onToggleExpand && (
            <button
              type="button"
              className="d-detail-nutri-expand"
              onClick={onToggleExpand}
              aria-expanded={expanded}
            >
              <span>{expanded ? '접기' : '전체 보기'}</span>
              <ChevronDown size={15} className={expanded ? 'is-open' : ''} />
            </button>
          )}
        </div>
      </header>

      <div className={`d-detail-nutri-columns${expanded ? ' is-open' : ''}${!showRightColumn ? ' has-single-column' : ''}`}>
        {/* 좌측: 필수 영양소 + 칼슘 등. 자식 행(당류·포화지방 등)은 펼칠 때 부모 아래로 슬라이드 */}
        <div className="d-detail-nutri-group">
          <ul className="d-detail-nutri-list">
            {[...mandatoryRows, ...optionalRows].map((r) => (
              <NutritionCell
                key={r.key}
                label={r.label}
                display={r.display}
                info={r.info}
                depth={r.depth ?? (r.indent ? 1 : 0)}
                muted={r.muted}
                extra={isLeftExtra(r.key)}
              />
            ))}
          </ul>
        </div>
        {/* 우측: 단백질음료는 아미노산, 쉐이크는 비타민·무기질 */}
        {showRightColumn && (
          <div className="d-detail-nutri-group d-detail-nutri-group--optional">
            {isShake ? (
              <ul className="d-detail-nutri-list">
                {vitaminRows.length > 0 && (
                  <>
                    <NutritionCell
                      label="비타민"
                      display={`${vitaminRows.length}종`}
                    />
                    {vitaminRows.map((r) => (
                      <NutritionCell
                        key={r.key}
                        label={r.label}
                        display={r.display}
                        info={r.info}
                        depth={1}
                        muted={r.muted}
                        extra
                      />
                    ))}
                  </>
                )}
                {mineralRows.length > 0 && (
                  <>
                    <NutritionCell
                      label="무기질"
                      display={`${mineralRows.length}종`}
                    />
                    {mineralRows.map((r) => (
                      <NutritionCell
                        key={r.key}
                        label={r.label}
                        display={r.display}
                        info={r.info}
                        depth={1}
                        muted={r.muted}
                        extra
                      />
                    ))}
                  </>
                )}
                {micronutrientRows.length === 0 && rightRows.map((r) => (
                  <NutritionCell
                    key={r.key}
                    label={r.label}
                    display={r.display}
                    info={r.info}
                    depth={r.depth}
                    muted={r.muted}
                    extra={r.key !== 'protein_g' && isAminoExtra(r.key)}
                  />
                ))}
                {micronutrientRows.length > 0 && rightRows.length > 0 && (
                  <>
                    {rightRows.map((r) => (
                      <NutritionCell
                        key={r.key}
                        label={r.label}
                        display={r.display}
                        info={r.info}
                        depth={r.depth}
                        muted={r.muted}
                        extra={r.key !== 'protein_g'}
                      />
                    ))}
                  </>
                )}
              </ul>
            ) : (
              <ul className="d-detail-nutri-list">
                {rightRows.map((r) => (
                  <NutritionCell
                    key={r.key}
                    label={r.label}
                    display={r.display}
                    info={r.info}
                    depth={r.depth}
                    muted={r.muted}
                    extra={r.key !== 'protein_g' && isAminoExtra(r.key)}
                  />
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
