import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProductById, useProducts } from '../store/ProductsContext.jsx';
import { getAdapted } from '../data/adapters.js';
import { useCompare } from '../store/CompareContext.jsx';
import { Button } from '../components/ds/Button.jsx';
import { IconBack } from '../components/ds/Icons.jsx';

import { Check } from 'lucide-react';
import ProductThumb from '../components/global/ProductThumb.jsx';
import { NutritionTable } from '../components/desktop/detail/NutritionTable.jsx';
import { AnalysisReport } from '../components/desktop/detail/AnalysisReport.jsx';
import { IngredientList } from '../components/desktop/detail/IngredientList.jsx';
import { CategoryGuide } from '../components/desktop/detail/CategoryGuide.jsx';
import { ReviewSection } from '../components/desktop/detail/ReviewSection.jsx';
import { RelatedProducts } from '../components/desktop/detail/RelatedProducts.jsx';
import './DetailPage.css';

function EmptyState() {
  return (
    <div className="page d-detail-empty">
      <p className="d-detail-empty-msg">존재하지 않는 제품이에요.</p>
      <Link className="d-detail-empty-link" to="/">메인으로 가기</Link>
    </div>
  );
}

// #9 풀 breadcrumb
function Breadcrumb({ category, productName, onBack }) {
  return (
    <nav className="d-detail-breadcrumb" aria-label="경로">
      <Link to="/" className="d-detail-breadcrumb-link">홈</Link>
      <span className="d-detail-breadcrumb-sep">/</span>
      <Link to="/list" className="d-detail-breadcrumb-link">제품 목록</Link>
      {category && (
        <>
          <span className="d-detail-breadcrumb-sep">/</span>
          <Link to={`/list?category=${encodeURIComponent(category)}`} className="d-detail-breadcrumb-link">{category}</Link>
        </>
      )}
      <span className="d-detail-breadcrumb-sep">/</span>
      <span className="d-detail-breadcrumb-current">{productName}</span>
    </nav>
  );
}

// #2 Quick Glance 수치
function QuickGlance({ nutrition }) {
  const items = [
    { label: '칼로리', value: nutrition?.calories, unit: 'kcal' },
    { label: '단백질', value: nutrition?.protein, unit: 'g' },
    { label: '당류', value: nutrition?.sugar, unit: 'g' },
  ];
  return (
    <div className="d-detail-quick">
      {items.map((item) => (
        <div key={item.label} className="d-detail-quick-item">
          <span className="d-detail-quick-label">{item.label}</span>
          <span className="d-detail-quick-value">
            {item.value ?? '-'}<span className="d-detail-quick-unit">{item.unit}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

// #8 매크로 비율 바 + 퍼센트 라벨
function MacroStrip({ protein = 0, carbs = 0, fat = 0, calories = 0 }) {
  const total = protein + carbs + fat;
  const pct = (v) => total > 0 ? Math.round((v / total) * 100) : 0;
  const segments = [
    { label: '탄수화물', value: carbs, color: 'var(--orange-400)', pct: pct(carbs) },
    { label: '단백질', value: protein, color: 'var(--green-500)', pct: pct(protein) },
    { label: '지방', value: fat, color: 'var(--blue-400)', pct: pct(fat) },
  ];
  return (
    <div className="d-detail-macro">
      <div className="d-detail-macro-head">
        <span className="d-detail-macro-title">탄단지 비율</span>
        <span className="d-detail-macro-kcal"><b>{calories}</b> kcal</span>
      </div>
      <div className="d-detail-macro-bar">
        {segments.map((s) => (
          <div key={s.label} className="d-detail-macro-seg" style={{ width: `${s.pct}%`, background: s.color }}>
            {s.pct >= 15 && <span className="d-detail-macro-seg-pct">{s.pct}%</span>}
          </div>
        ))}
      </div>
      <div className="d-detail-macro-legend">
        {segments.map((s) => (
          <div key={s.label} className="d-detail-macro-legend-item">
            <span className="d-detail-macro-dot" style={{ background: s.color }} />
            <span className="d-detail-macro-legend-label">{s.label}</span>
            <b>{s.value}g</b>
            <span className="d-detail-macro-legend-pct">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// #3 섹션 앵커 탭
const SECTIONS = [
  { id: 'guide', label: '선택 가이드' },
  { id: 'nutrition', label: '영양성분' },
  { id: 'ingredients', label: '원재료' },
  { id: 'analysis', label: '분석 리포트' },
  { id: 'reviews', label: '후기' },
];

function SectionNav({ activeId, navRef }) {
  const handleClick = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    const nav = navRef?.current;
    if (!el) return;
    const navH = nav ? nav.offsetHeight : 0;
    const headerH = 64;
    const offset = headerH + navH + 12;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <nav className="d-detail-section-nav" ref={navRef} aria-label="섹션 이동">
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          onClick={(e) => handleClick(e, s.id)}
          className={`d-detail-section-nav-item${activeId === s.id ? ' is-active' : ''}`}
        >
          {s.label}
        </a>
      ))}
    </nav>
  );
}

function useActiveSection(productId) {
  const [activeId, setActiveId] = useState('nutrition');
  useEffect(() => {
    setActiveId('nutrition');
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          if (visible.length > 0) {
            setActiveId(visible[0].target.id);
          }
        },
        { rootMargin: '-140px 0px -60% 0px' },
      );
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el) observer.observe(el);
      }
      return () => observer.disconnect();
    }, 100);
    return () => clearTimeout(timer);
  }, [productId]);
  return activeId;
}

// #5 비교함 버튼 + 애니메이션 피드백
function CompareButton({ inCart, onClick }) {
  const [flash, setFlash] = useState(false);
  const handleClick = () => {
    onClick();
    setFlash(true);
    setTimeout(() => setFlash(false), 600);
  };
  return (
    <button
      type="button"
      className={`d-detail-compare-btn${inCart ? ' is-active' : ''}${flash ? ' is-flash' : ''}`}
      onClick={handleClick}
    >
      {inCart && <Check size={16} />}
      <span>{inCart ? '비교함 빼기' : '비교함 담기'}</span>
    </button>
  );
}

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { has, toggle, isFull, max } = useCompare();
  const { loading } = useProducts();
  const activeSection = useActiveSection(id);
  const navRef = useRef(null);

  const raw = useProductById(id);
  const product = raw ? getAdapted(raw) : null;

  if (loading) return <div className="page" style={{ textAlign: 'center', padding: '4rem' }}>불러오는 중...</div>;
  if (!product) return <EmptyState />;

  const inCart = has(product.id);
  const n = product.nutrition ?? {};

  const handleToggleCompare = () => {
    if (!inCart && isFull) {
      window.alert(`비교함은 최대 ${max}개까지 담을 수 있어요.`);
      return;
    }
    toggle(product.id);
  };

  return (
    <div className="page d-detail">
      <Breadcrumb category={raw?.category} productName={product.name} />

      {/* 제품 헤더 — 컴팩트 한 줄 + Quick Glance */}
      <div className="d-detail-header">
        <div className="d-detail-header-top">
          <div className="d-detail-header-thumb">
            <ProductThumb product={product} size="compact" />
          </div>
          <div className="d-detail-header-info">
            <span className="d-detail-header-brand">{product.brand}</span>
            <h1 className="d-detail-header-name">{product.name}</h1>
            <span className="d-detail-header-serving">{product.serving}</span>
          </div>
          <QuickGlance nutrition={n} />
          <div className="d-detail-header-actions">
            <CompareButton inCart={inCart} onClick={handleToggleCompare} />
            <span className="d-detail-header-buy is-disabled">구매하러 가기 (준비 중)</span>
          </div>
        </div>
      </div>

      <MacroStrip protein={n.protein} carbs={n.carbs} fat={n.fat} calories={n.calories} />

      {/* 섹션 앵커 탭 */}
      <SectionNav activeId={activeSection} navRef={navRef} />

      <div className="d-detail-sections">
        <div id="guide">
          <CategoryGuide category={raw?.category} />
        </div>
        <div id="nutrition">
          <NutritionTable
            nutrition={n}
            serving={product.serving}
            foodNutrients={raw?._raw?.foodNutrients}
            servingSize={raw?._raw?.servingSize}
            servingUnit={raw?._raw?.servingUnit}
          />
        </div>
        <div id="ingredients">
          <IngredientList ingredients={product.ingredients} rawText={raw?._raw?.ingredientsText} />
        </div>
        <div id="analysis">
          <AnalysisReport nutrition={n} ingredients={product.ingredients} category={raw?.category} />
        </div>
        <div id="reviews">
          <ReviewSection productId={product.id} />
        </div>
        <RelatedProducts
          currentProduct={raw}
          onNavigate={(nextId) => navigate(`/product/${nextId}`)}
          limit={4}
        />
      </div>
    </div>
  );
}
