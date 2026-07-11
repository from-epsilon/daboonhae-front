import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { categoryPath } from "../../../data/categoryTabs.js";
import "./MainBanner.css";

const ROTATE_MS = 4200;

const DEFAULT_CATEGORIES = [
  {
    label: "단백질 음료",
    code: "protein_drink",
    image: "/images/categories/protein-drink-pow-transparent.png",
  },
  {
    label: "쉐이크",
    code: "shake",
    image: "/images/categories/shake-pouch-transparent.png",
  },
  {
    label: "닭가슴살",
    code: "chicken_breast",
    image: "/images/categories/chicken-breast-pack-transparent.png",
  },
  {
    label: "아이스크림",
    code: "ice_cream",
    image: "/images/categories/ice-cream-bar-transparent.png",
  },
  {
    label: "과자/초콜릿/젤리",
    code: "snack_sweets",
    image: "/images/categories/snack-cookie-tilted-transparent.png",
  },
];

function getInitialIndex(count) {
  if (count <= 0) return 0;
  return Math.floor(Date.now() / ROTATE_MS) % count;
}

export default function MainBanner({
  categories = DEFAULT_CATEGORIES,
  ctaLabel = "비교하러 가기",
  onCtaClick,
}) {
  const safeCategories = categories.length > 0 ? categories : DEFAULT_CATEGORIES;
  const [activeIndex, setActiveIndex] = useState(() =>
    getInitialIndex(safeCategories.length),
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % safeCategories.length);
    }, ROTATE_MS);

    return () => window.clearInterval(timer);
  }, [safeCategories.length]);

  const activeCategory = safeCategories[activeIndex % safeCategories.length];
  const activeHref = useMemo(
    () => categoryPath(activeCategory.code),
    [activeCategory.code],
  );

  const handleCtaClick = (event) => {
    onCtaClick?.(event, { ...activeCategory, href: activeHref });
  };

  return (
    <section className="mb" aria-label="다분해 메인 배너">
      <div className="mb__left">
        <h1 className="mb__headline" aria-live="polite">
          <span key={activeCategory.code} className="mb__category">
            {activeCategory.label},
          </span>
          <span className="mb__headline-action">비교해보세요</span>
        </h1>

        <p className="mb__sub">
          영양성분, 가격, 원재료를 카테고리별로 한눈에 확인하세요.
        </p>

        <a className="mb__cta" href={activeHref} onClick={handleCtaClick}>
          <span>{ctaLabel}</span>
          <span className="mb__cta-arrow" aria-hidden="true">
            <ArrowRight size={12} strokeWidth={2.5} />
          </span>
        </a>
      </div>

      <div className="mb__right" aria-hidden="true">
        <div
          key={activeCategory.code}
          className={`mb__visual mb__visual--${activeCategory.code}`}
        >
          <img
            className="mb__visual-img"
            src={activeCategory.image}
            alt=""
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
}
