// 데스크탑 메인 — 신뢰 수치 섹션 (4개 카드)
// - "공식 영양정보 기반"이라는 카피가 강해 수치도 실데이터에 가능한 한 맞춤
//   · 분석 식품 수      : PRODUCTS.length (실값)
//   · 카테고리 다양성   : 유니크 category 수 (실값)
//   · 평균 분해 영양소  : nutrition 키 평균 개수 (실값)
//   · 식단 목적 종류    : PURPOSES + 전체 (실값)
// - "BETA" 배지를 헤더에 노출 → mock 단계임을 투명하게 알림 (신뢰 손상 방지)
import { useMemo } from 'react';
import { useProducts } from '../../../store/ProductsContext.jsx';
import { PURPOSES, ALL_PURPOSE } from '../../../data/purposes.jsx';
import { IconCheck } from '../../ds/Icons.jsx';

// 통계 카드 — 단일 책임
function StatCard({ value, unit, label, hint }) {
  return (
    <div className="d-home-stat">
      <div className="d-home-stat-value">
        {value}
        {unit && <span className="d-home-stat-unit">{unit}</span>}
      </div>
      <div className="d-home-stat-label">{label}</div>
      {hint && <div className="d-home-stat-hint">{hint}</div>}
    </div>
  );
}

// 한 제품의 nutrition 객체에서 값이 0이 아니고 null/undefined가 아닌 키 수
function countValidNutritionKeys(product) {
  const n = product?.nutrition ?? {};
  return Object.values(n).filter((v) => typeof v === 'number' && !Number.isNaN(v))
    .length;
}

export default function TrustStats() {
  const { products: PRODUCTS } = useProducts();
  const stats = useMemo(() => {
    const productCount = PRODUCTS.length;
    const categories = new Set(PRODUCTS.map((p) => p.category).filter(Boolean));
    const avgNutritionKeys =
      PRODUCTS.length > 0
        ? Math.round(
            PRODUCTS.reduce((sum, p) => sum + countValidNutritionKeys(p), 0) /
              PRODUCTS.length,
          )
        : 0;
    const purposeCount = PURPOSES.length + (ALL_PURPOSE ? 1 : 0);
    return { productCount, categoryCount: categories.size, avgNutritionKeys, purposeCount };
  }, [PRODUCTS]);

  return (
    <section className="d-home-trust" aria-label="다분해 신뢰 지표">
      <div className="d-home-trust-head">
        <span className="d-home-trust-badge">
          <IconCheck size={14} stroke={2.5} />
          공식 영양정보 기반 분해
          <span className="d-home-trust-beta">BETA</span>
        </span>
        <h2 className="d-home-trust-title">숫자로 보여드리는 다분해</h2>
        <p className="d-home-trust-sub">
          제조사 공시 영양성분표를 분해해 직접 비교 가능한 데이터로 정리합니다.
        </p>
      </div>
      <div className="d-home-trust-grid">
        <StatCard
          value={stats.productCount}
          unit="개"
          label="분석된 식품"
          hint="매주 업데이트"
        />
        <StatCard
          value={stats.categoryCount}
          unit="종"
          label="식품 카테고리"
          hint="음료·간식·식사대용 외"
        />
        <StatCard
          value={stats.avgNutritionKeys}
          unit="개"
          label="제품당 분해 항목"
          hint="칼로리·단백질·당류 외"
        />
        <StatCard
          value={stats.purposeCount}
          unit="종"
          label="식단 목적"
          hint="전체·체중감량·근성장 외"
        />
      </div>
    </section>
  );
}
