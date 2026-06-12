import { useState } from 'react';
import { Badge } from '../../ds/Badge.jsx';
import { IconAlert } from '../../ds/Icons.jsx';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { buildIngredientSegments } from '../../../utils/ingredientHighlight.js';
import { useProteinResolver, proteinGradeMeta, cleanProteinLabel } from '../../../data/proteinQuality.js';

// 원재료명 구간 마킹 색상 클래스 (type → 클래스)
const MARK_CLASS = {
  protein_source: 'd-detail-ingr-mark d-detail-ingr-mark--protein',
  alternative_sweetener: 'd-detail-ingr-mark d-detail-ingr-mark--sweetener',
};

// 원재료 전문 + annotation 구간 하이라이트 렌더
function HighlightedText({ text, annotations }) {
  const segments = buildIngredientSegments(text, annotations);
  if (segments.length === 0) return text;
  return segments.map((seg, i) =>
    seg.type && MARK_CLASS[seg.type] ? (
      <mark key={i} className={MARK_CLASS[seg.type]} title={seg.label || undefined}>
        {seg.text}
      </mark>
    ) : (
      <span key={i}>{seg.text}</span>
    ),
  );
}

// 하이라이트 색상 범례 (annotation이 있을 때만)
function HighlightLegend({ annotations }) {
  const types = new Set((Array.isArray(annotations) ? annotations : []).map((a) => a?.type));
  const legend = [];
  if (types.has('protein_source')) legend.push({ cls: 'd-detail-ingr-mark--protein', label: '단백질원료' });
  if (types.has('alternative_sweetener')) legend.push({ cls: 'd-detail-ingr-mark--sweetener', label: '대체당' });
  if (legend.length === 0) return null;
  return (
    <div className="d-detail-ingr-raw-legend">
      {legend.map((l) => (
        <span key={l.cls} className="d-detail-ingr-raw-legend-item">
          <span className={`d-detail-ingr-raw-legend-dot ${l.cls}`} />
          {l.label}
        </span>
      ))}
    </div>
  );
}

function ItemWithTooltip({ label, info }) {
  return (
    <span className="d-detail-ingr-item-wrap">
      <Badge variant="outline">
        {label}
        {info ? (
          <span className="d-detail-tooltip-wrap d-detail-tooltip-inline">
            <HelpCircle size={11} className="d-detail-tooltip-icon" />
            <span className="d-detail-tooltip">{info}</span>
          </span>
        ) : (
          <span className="d-detail-tooltip-wrap d-detail-tooltip-inline">
            <HelpCircle size={11} className="d-detail-tooltip-icon" />
            <span className="d-detail-tooltip">추후 정보가 추가될 예정입니다.</span>
          </span>
        )}
      </Badge>
    </span>
  );
}

// 단백질 원료 — 원문을 정규 원료로 해석해 약자(WPC 등)·품질 등급 배지 표시
function ProteinIngrSection({ items, emptyLabel = '정보 없음' }) {
  // 라벨 정리(분말/숫자 suffix 제거) 후 중복 제거
  const labels = [...new Set(
    (Array.isArray(items) ? items : [])
      .map((it) => cleanProteinLabel(typeof it === 'string' ? it : it.label))
      .filter(Boolean),
  )];
  const resolve = useProteinResolver(labels);
  return (
    <div className="d-detail-ingr-col d-detail-ingr-col--protein">
      <div className="d-detail-ingr-col-label">단백질 원료</div>
      <div className="d-detail-ingr-col-values">
        {labels.length > 0 ? (
          labels.map((label) => {
            const ing = resolve(label);
            const grade = ing ? proteinGradeMeta(ing.qualityGrade) : null;
            return (
              <span key={label} className="d-detail-protein-chip" title={ing?.qualityBasis || undefined}>
                <span className="d-detail-protein-name">{label}</span>
                {ing?.abbreviation && <span className="d-detail-protein-abbr">{ing.abbreviation}</span>}
                {grade && <span className={`d-detail-protein-grade ${grade.cls}`}>{grade.label}</span>}
              </span>
            );
          })
        ) : (
          <span className="d-detail-ingr-empty">{emptyLabel}</span>
        )}
      </div>
    </div>
  );
}

function IngrSection({ label, items, emptyLabel = '정보 없음' }) {
  const hasItems = Array.isArray(items) && items.length > 0;
  return (
    <div className="d-detail-ingr-col">
      <div className="d-detail-ingr-col-label">{label}</div>
      <div className="d-detail-ingr-col-values">
        {hasItems ? (
          items.map((it) => (
            <ItemWithTooltip key={typeof it === 'string' ? it : it.label} label={typeof it === 'string' ? it : it.label} info={typeof it === 'string' ? null : it.info} />
          ))
        ) : (
          <span className="d-detail-ingr-empty">{emptyLabel}</span>
        )}
      </div>
    </div>
  );
}

function SweetenerNotice({ sweeteners }) {
  if (!sweeteners || sweeteners.length === 0) return null;
  if (!sweeteners.some((s) => (typeof s === 'string' ? s : s.label) === '말티톨')) return null;
  return (
    <div className="d-detail-ingr-notice">
      <IconAlert size={14} />
      <span>말티톨은 다른 대체당보다 혈당 영향이 큰 편이에요.</span>
    </div>
  );
}

function RawTextToggle({ rawText, annotations }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="d-detail-ingr-raw">
      <button
        type="button"
        className="d-detail-ingr-raw-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>원재료명 전체 보기</span>
        <ChevronDown size={14} className={`d-detail-ingr-raw-chevron${open ? ' is-open' : ''}`} />
      </button>
      {open && (
        rawText ? (
          <>
            <p className="d-detail-ingr-raw-text">
              <HighlightedText text={rawText} annotations={annotations} />
            </p>
            <HighlightLegend annotations={annotations} />
          </>
        ) : (
          <p className="d-detail-ingr-raw-text d-detail-ingr-raw-empty">원재료명 정보가 아직 등록되지 않았습니다.</p>
        )
      )}
    </div>
  );
}

export function IngredientList({ ingredients, rawText, annotations }) {
  const ing = ingredients ?? {};

  const otherItems = [];
  if (ing.lactoseFree === true) {
    otherItems.push('유당 free');
  } else if (ing.lactoseFree === false) {
    otherItems.push('유당 포함 가능');
  }

  return (
    <section className="d-detail-card d-detail-ingr">
      <header className="d-detail-card-head">
        <h2 className="d-detail-card-title">원재료</h2>
      </header>
      <div className="d-detail-ingr-grid">
        <ProteinIngrSection items={ing.proteinSources} />
        <IngrSection label="대체당" items={ing.sweeteners} />
        <IngrSection label="알레르기 유발 성분" items={ing.allergens} />
        <IngrSection label="기타" items={otherItems.length > 0 ? otherItems : null} />
      </div>
      <SweetenerNotice sweeteners={ing.sweeteners} />
      <RawTextToggle rawText={rawText} annotations={annotations} />
    </section>
  );
}
