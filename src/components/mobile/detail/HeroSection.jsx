// 모바일 디테일 — 히어로 섹션
// - 좌측: 정사각 이미지 (1:1)
// - 우측: 브랜드/이름/용량 + 큰 ScoreGauge (다분해 점수) + Trust 배지
// - 점수가 페이지 시그니처라 ScoreGauge를 132px로 크게 노출
import { Badge } from '../../ds/Badge.jsx';
import { IconCheck } from '../../ds/Icons.jsx';
import { MacroRow } from '../../ds/MacroRow.jsx';
import { formatProteinSourceLabel, formatSweetenerLabel } from '../../../data/listFilters.js';
import { useProteinResolver, useSweetenerResolver } from '../../../data/proteinQuality.js';
import ProductNameText from '../../global/ProductNameText.jsx';

// 이미지 영역 — 정사각 흰 배경 + 1px 보더
function HeroImage({ src, alt }) {
  return (
    <div className="m-detail-hero-img">
      {src ? (
        // 폴드 위 LCP 이미지 — eager + fetchpriority로 우선 로드
        <img src={src} alt={alt} loading="eager" fetchpriority="high" />
      ) : (
        <div className="m-detail-hero-img-placeholder" aria-hidden="true">
          이미지 없음
        </div>
      )}
    </div>
  );
}

// 자동 태그 가로 스크롤 행 — 제품 정체성(고단백/저당 등). 없으면 미노출
function TagsRow({ tags }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div className="m-detail-hero-tags" aria-label="제품 태그">
      {tags.map((t, i) => (
        <Badge key={i} variant={t.v}>{t.label}</Badge>
      ))}
    </div>
  );
}

// 신뢰 배지 행 — IconCheck + 라벨 (작게)
function TrustRow({ trustBadges }) {
  if (!trustBadges || trustBadges.length === 0) return null;
  return (
    <div className="m-detail-hero-trust">
      {trustBadges.map((t, i) => (
        <span key={i} className="m-detail-hero-trust-item">
          <IconCheck size={12} stroke={2} />
          {t.label}
        </span>
      ))}
    </div>
  );
}

function formatHeaderNumber(value) {
  if (value === undefined || value === null || Number.isNaN(value)) return null;
  return value >= 100 ? Math.round(value).toLocaleString() : (Math.round(value * 10) / 10).toLocaleString();
}

function ServingMeta({ product, config }) {
  const parts = [];
  const explicit = config?.servingMetaVariant === 'explicit';
  if (product?.serving) parts.push(explicit ? `1회 제공량 ${product.serving}` : product.serving);
  const calories = formatHeaderNumber(product?.nutrition?.calories);
  if (calories !== null) parts.push(`${calories}kcal`);
  if (parts.length === 0) return null;
  return <div className="m-detail-hero-serving">{parts.join(' · ')}</div>;
}

function IngredientFacts({ product, config }) {
  const sources = config?.showProteinSource ? (product?.ingredients?.proteinSources ?? []) : [];
  const sweeteners = config?.showSweetenerMeta ? (product?.ingredients?.sweeteners ?? product?.sweeteners ?? []) : [];
  const proteinResolver = useProteinResolver(sources);
  const sweetenerResolver = useSweetenerResolver(sweeteners);
  const rows = [];

  if (sources.length > 0) {
    rows.push({
      key: 'protein',
      label: '단백질원',
      value: [...new Set(sources.map((source) => formatProteinSourceLabel(source, proteinResolver)))].join(' · '),
    });
  }
  if (config?.showSweetenerMeta) {
    rows.push({
      key: 'sweetener',
      label: '대체당',
      value: sweeteners.length > 0
        ? [...new Set(sweeteners.map((sweetener) => formatSweetenerLabel(sweetener, sweetenerResolver)))].join(' · ')
        : '없음',
    });
  }
  if (rows.length === 0) return null;

  return (
    <div className="m-detail-hero-facts-meta">
      {rows.map((row) => (
        <div className="m-detail-hero-facts-meta-row" key={row.key}>
          <span className="m-detail-hero-facts-meta-label">{row.label}</span>
          <span className="m-detail-hero-facts-meta-value">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

function SummaryFacts({ product, config }) {
  const hasMacro = config?.macroBarVariant && product?.macros && (
    Number(product.macros.carbs) > 0 ||
    Number(product.macros.protein) > 0 ||
    Number(product.macros.fat) > 0
  );

  return (
    <div className="m-detail-hero-facts">
      <ServingMeta product={product} config={config} />
      {hasMacro && <MacroRow {...product.macros} variant={config.macroBarVariant} />}
      <IngredientFacts product={product} config={config} />
    </div>
  );
}

export function HeroSection({ product, config }) {
  // safety: product null 가드는 상위에서 처리하므로 여기선 필드만 안전 접근
  const brand = product?.brand ?? '';
  const name = product?.name ?? '';
  const titleVariant = config?.titleVariant === 'size' ? product?.sizeVariantLabel : '';

  return (
    <section className="m-detail-hero">
      <HeroImage src={product?.thumb} alt={name} />
      <div className="m-detail-hero-body">
        <div className="m-detail-hero-meta">
          <div className="m-detail-hero-brand">{brand}</div>
          <h1 className="m-detail-hero-name">
            <ProductNameText product={product} />
            {titleVariant && <span className="m-detail-hero-variant">{titleVariant}</span>}
          </h1>
        </div>
        <SummaryFacts product={product} config={config} />
        <TagsRow tags={product?.tags} />
        <TrustRow trustBadges={product?.trustBadges} />
      </div>
    </section>
  );
}
