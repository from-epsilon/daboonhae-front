// 모바일 디테일 — 원료/성분 카드
// - 단백질 원료, 대체당, 알레르겐, 유당 free 여부
// - 각 항목은 Badge 컬럼으로 표시 (없으면 '-' 또는 '없음')
import { useState } from 'react';
import { Badge } from '../../ds/Badge.jsx';
import { IconAlert, IconCheck } from '../../ds/Icons.jsx';
import { ChevronDown } from 'lucide-react';
import { buildIngredientSegments } from '../../../utils/ingredientHighlight.js';
import { useResolvedProteinSources, useResolvedSweeteners, proteinGradeMeta } from '../../../data/proteinQuality.js';

// 원재료명 구간 마킹 색상 클래스 (type → 클래스)
const MARK_CLASS = {
  protein_source: 'm-detail-ingr-mark m-detail-ingr-mark--protein',
  alternative_sweetener: 'm-detail-ingr-mark m-detail-ingr-mark--sweetener',
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

// 마킹 색상 범례 (annotation이 있을 때만)
function HighlightLegend({ annotations }) {
  const types = new Set((Array.isArray(annotations) ? annotations : []).map((a) => a?.type));
  const legend = [];
  if (types.has('protein_source')) legend.push({ cls: 'm-detail-ingr-mark--protein', label: '단백질원료' });
  if (types.has('alternative_sweetener')) legend.push({ cls: 'm-detail-ingr-mark--sweetener', label: '대체당' });
  if (legend.length === 0) return null;
  return (
    <div className="m-detail-ingr-raw-legend">
      {legend.map((l) => (
        <span key={l.cls} className="m-detail-ingr-raw-legend-item">
          <span className={`m-detail-ingr-raw-legend-dot ${l.cls}`} />
          {l.label}
        </span>
      ))}
    </div>
  );
}

// 원재료명 전문 토글
function RawTextToggle({ rawText, annotations }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="m-detail-ingr-raw">
      <button
        type="button"
        className="m-detail-ingr-raw-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>원재료명 전체 보기</span>
        <ChevronDown size={14} className={`m-detail-ingr-raw-chevron${open ? ' is-open' : ''}`} />
      </button>
      {open && (
        rawText ? (
          <>
            <p className="m-detail-ingr-raw-text">
              <HighlightedText text={rawText} annotations={annotations} />
            </p>
            <HighlightLegend annotations={annotations} />
          </>
        ) : (
          <p className="m-detail-ingr-raw-text m-detail-ingr-raw-empty">원재료명 정보가 아직 등록되지 않았습니다.</p>
        )
      )}
    </div>
  );
}

// 라벨 + 칩 리스트 (없으면 '없음' 텍스트)
function ChipRow({ label, items, emptyLabel = '없음', variant = 'outline' }) {
  const hasItems = Array.isArray(items) && items.length > 0;
  return (
    <div className="m-detail-ingr-row">
      <span className="m-detail-ingr-label">{label}</span>
      <div className="m-detail-ingr-values">
        {hasItems ? (
          items.map((it, i) => (
            <Badge key={i} variant={variant}>{it}</Badge>
          ))
        ) : (
          <span className="m-detail-ingr-empty">{emptyLabel}</span>
        )}
      </div>
    </div>
  );
}

// 단백질 원료 — 원문을 정규 원료로 해석해 약자·품질 등급 배지 표시
function ProteinChipRow({ items, emptyLabel = '없음' }) {
  const sources = useResolvedProteinSources(items);
  return (
    <div className="m-detail-ingr-row">
      <span className="m-detail-ingr-label">단백질 원료</span>
      <div className="m-detail-ingr-values">
        {sources.length > 0 ? (
          sources.map((source) => {
            const grade = proteinGradeMeta(source.qualityGrade);
            const name = source.abbreviation ? `${source.nameKo} (${source.abbreviation})` : source.nameKo;
            return (
              <span key={source.code} className="m-detail-protein-chip">
                <span className="m-detail-protein-name">{name}</span>
                {grade && <span className={`m-detail-protein-grade ${grade.cls}`}>{grade.label}</span>}
              </span>
            );
          })
        ) : (
          <span className="m-detail-ingr-empty">{emptyLabel}</span>
        )}
      </div>
    </div>
  );
}

function SweetenerChipRow({ items, emptyLabel = '사용 안 함' }) {
  const sweeteners = useResolvedSweeteners(items);
  return (
    <div className="m-detail-ingr-row">
      <span className="m-detail-ingr-label">대체당</span>
      <div className="m-detail-ingr-values">
        {sweeteners.length > 0 ? (
          sweeteners.map((sweetener) => (
            <Badge key={sweetener.code} variant="outline">{sweetener.nameKo}</Badge>
          ))
        ) : (
          <span className="m-detail-ingr-empty">{emptyLabel}</span>
        )}
      </div>
    </div>
  );
}

// 유당 free 여부 — 라벨 + Yes/No 칩
function LactoseRow({ lactoseFree }) {
  const isFree = lactoseFree === true;
  return (
    <div className="m-detail-ingr-row">
      <span className="m-detail-ingr-label">유당</span>
      <div className="m-detail-ingr-values">
        {isFree ? (
          <Badge variant="softGreen">유당 free</Badge>
        ) : (
          <Badge variant="outline">유당 포함 가능</Badge>
        )}
      </div>
    </div>
  );
}

function SweetenerNotice({ sweeteners }) {
  const resolvedSweeteners = useResolvedSweeteners(sweeteners);
  const cautions = resolvedSweeteners
    .map((sweetener) => sweetener.cautionsText)
    .filter(Boolean);
  if (cautions.length === 0) return null;
  return (
    <div className="m-detail-ingr-notice">
      <IconAlert size={14} />
      <span>{cautions.join(' ')}</span>
    </div>
  );
}

export function IngredientList({ ingredients, rawText, annotations, embedded = false, rawOnly = false, title = '원료 · 성분' }) {
  const ing = ingredients ?? {};
  const className = `${embedded ? 'm-detail-embedded-section ' : 'm-detail-card '}m-detail-ingr`;

  if (rawOnly) {
    return (
      <section className={className}>
        <header className="m-detail-card-head">
          <h2 className="m-detail-card-title">{title}</h2>
        </header>
        <RawTextToggle rawText={rawText} annotations={annotations} />
      </section>
    );
  }

  return (
    <section className={className}>
      <header className="m-detail-card-head">
        <h2 className="m-detail-card-title">{title}</h2>
      </header>
      <div className="m-detail-ingr-list">
        <ProteinChipRow items={ing.proteinSources} />
        <SweetenerChipRow items={ing.sweeteners} />
        <ChipRow
          label="알레르겐"
          items={ing.allergens}
          variant="outline"
        />
        <LactoseRow lactoseFree={ing.lactoseFree} />
      </div>
      <SweetenerNotice sweeteners={ing.sweeteners} />
      <RawTextToggle rawText={rawText} annotations={annotations} />
    </section>
  );
}
