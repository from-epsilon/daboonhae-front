import { ArrowRight } from "lucide-react";
import "./MainBanner.css";

/**
 * 다분해 메인 히어로 배너 (1240 × 400)
 *
 * 데이터는 모두 props 로 받습니다. 운영툴/CMS 연결 시 부담 없음.
 *
 * 사용 예:
 *   <MainBanner
 *     ctaHref="/products"
 *     onCtaClick={() => navigate("/products")}
 *   />
 */
export default function MainBanner({
  headlineLines = [
    "성분표 뒤집어 볼 필요 없이,",
    { before: "", em: "한눈에 비교", after: "하세요" },
  ],
  subline = "단백질·당류·칼로리부터 전성분까지, 한 번에 정리해서 보여드려요.",
  ctaLabel = "제품 둘러보기",
  ctaHref = "#",
  onCtaClick,
  products = DEFAULT_PRODUCTS,
  rows = DEFAULT_ROWS,
  tags = DEFAULT_TAGS,
}) {
  const [productA, productB] = products;

  return (
    <section className="mb" aria-label="다분해 메인 배너">
      {/* ============== LEFT ============== */}
      <div className="mb__left">
        <span className="mb__brand" aria-label="다분해">
          <BrandMark />
          <span>다분해</span>
        </span>

        <h1 className="mb__headline">
          {headlineLines.map((line, i) =>
            typeof line === "string" ? (
              <span key={i} className="mb__headline-line">{line}</span>
            ) : (
              <span key={i} className="mb__headline-line">
                {line.before}
                <span className="mb__em">{line.em}</span>
                {line.after}
              </span>
            )
          )}
        </h1>

        <p className="mb__sub">{subline}</p>

        <a
          className="mb__cta"
          href={ctaHref}
          onClick={onCtaClick}
        >
          <span>{ctaLabel}</span>
          <span className="mb__cta-arrow" aria-hidden="true">
            <ArrowRight size={12} strokeWidth={2.5} />
          </span>
        </a>
      </div>

      {/* ============== RIGHT ============== */}
      <div className="mb__right" aria-hidden="true">
        <div className="mb__stage">
          <ProductCard product={productA} variant="a" />
          <ProductCard product={productB} variant="b" />

          {tags.good && <span className="mb-tag mb-tag--good">✓ {tags.good}</span>}
          {tags.warn && <span className="mb-tag mb-tag--warn">⚠ {tags.warn}</span>}

          <CompareCard rows={rows} />
        </div>
      </div>
    </section>
  );
}

/* ====================== 서브 컴포넌트 ====================== */

function ProductCard({ product, variant }) {
  return (
    <div className={`mb-floating mb-product mb-product--${variant}`}>
      <div
        className="mb-thumb"
        style={{ backgroundImage: `url(${product.image})` }}
      >
        {product.badge && (
          <span className="mb-thumb__badge">{product.badge}</span>
        )}
      </div>
      <div>
        <p className="mb-product__name">{product.name}</p>
        <p className="mb-product__macro">
          <b>{product.kcal}</b>kcal · 단백질 <b>{product.protein}</b>g
        </p>
      </div>
    </div>
  );
}

function CompareCard({ rows }) {
  return (
    <div className="mb-floating mb-compare">
      <div className="mb-compare__head">
        <span className="mb-compare__title">성분 비교</span>
        <span className="mb-compare__count">{rows.length > 0 ? "2개" : "0개"}</span>
      </div>

      <div className="mb-row mb-row--head">
        <div />
        <div className="mb-row__v"><span className="mb-row__swatch mb-row__swatch--a" />A</div>
        <div className="mb-row__v"><span className="mb-row__swatch mb-row__swatch--b" />B</div>
      </div>

      {rows.map((r) => (
        <div className="mb-row" key={r.label}>
          <div className="mb-row__label">{r.label}</div>
          <Cell value={r.a} state={r.winner === "a" ? "win" : null} />
          <Cell value={r.b} state={r.winner === "b" ? "win" : r.warnB ? "warn" : null} />
        </div>
      ))}
    </div>
  );
}

function Cell({ value, state }) {
  // value: "22g" → split number + unit
  const match = String(value).match(/^([\d.]+)(.*)$/);
  const num = match?.[1] ?? value;
  const unit = match?.[2] ?? "";
  const cls =
    "mb-row__v" +
    (state === "win" ? " mb-row__v--win" : "") +
    (state === "warn" ? " mb-row__v--warn" : "");
  return (
    <div className={cls}>
      {num}
      {unit && <small>{unit}</small>}
    </div>
  );
}

function BrandMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden="true">
      <path d="M 32 8 A 24 24 0 1 0 56 32" fill="none" stroke="currentColor" strokeWidth="7.5" strokeLinecap="round" />
      <circle cx="49.5" cy="14.5" r="3.6" fill="currentColor" />
      <circle cx="41" cy="6.5" r="2.4" fill="currentColor" opacity="0.75" />
      <circle cx="57" cy="22" r="2" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

/* ====================== 기본 데이터 ====================== */

const DEFAULT_PRODUCTS = [
  {
    image: "/assets/banner/choco-protein-shake.png",
    name: "초코 프로틴 쉐이크",
    badge: "공식 영양정보",
    kcal: 120,
    protein: 20,
  },
  {
    image: "/assets/banner/grain-protein.png",
    name: "마시는 곡물 단백질",
    badge: "공식 영양정보",
    kcal: 155,
    protein: 20,
  },
];

const DEFAULT_ROWS = [
  { label: "단백질",   a: "22g",      b: "20g",      winner: "a" },
  { label: "열량",     a: "120kcal",  b: "155kcal",  winner: "a" },
  { label: "당류",     a: "1g",       b: "12g",      winner: "a" },
  { label: "당알코올", a: "0g",       b: "4g",       winner: null, warnB: true },
  { label: "BCAA",     a: "5.0g",     b: "4.0g",     winner: "a" },
];

const DEFAULT_TAGS = {
  good: "고단백",
  warn: "당류 12g",
};
