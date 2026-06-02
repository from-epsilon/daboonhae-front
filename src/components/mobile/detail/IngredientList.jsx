// 모바일 디테일 — 원료/성분 카드
// - 단백질 원료, 대체당, 알레르겐, 유당 free 여부
// - 각 항목은 Badge 컬럼으로 표시 (없으면 '-' 또는 '없음')
// - 말티톨 사용 시 가벼운 info 박스로 안내 (analyzers의 sugar_warning 로직과 톤 일치)
import { useState } from 'react';
import { Badge } from '../../ds/Badge.jsx';
import { IconAlert, IconCheck } from '../../ds/Icons.jsx';
import { ChevronDown } from 'lucide-react';
import { buildIngredientSegments } from '../../../utils/ingredientHighlight.js';

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

// 말티톨 사용 시 가벼운 안내 박스
function SweetenerNotice({ sweeteners }) {
  if (!sweeteners || sweeteners.length === 0) return null;
  const hasMaltitol = sweeteners.includes('말티톨');
  if (!hasMaltitol) return null;
  return (
    <div className="m-detail-ingr-notice">
      <IconAlert size={14} />
      <span>말티톨은 다른 대체당보다 혈당 영향이 큰 편이에요.</span>
    </div>
  );
}

export function IngredientList({ ingredients, rawText, annotations }) {
  const ing = ingredients ?? {};
  return (
    <section className="m-detail-card m-detail-ingr">
      <header className="m-detail-card-head">
        <h2 className="m-detail-card-title">원료 · 성분</h2>
      </header>
      <div className="m-detail-ingr-list">
        <ChipRow
          label="단백질 원료"
          items={ing.proteinSources}
          variant="outline"
        />
        <ChipRow
          label="대체당"
          items={ing.sweeteners}
          emptyLabel="사용 안 함"
          variant="outline"
        />
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
