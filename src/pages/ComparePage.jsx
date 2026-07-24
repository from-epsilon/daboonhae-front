// 데스크탑 비교 페이지 (Round 4)
// 구조:
//   1) 페이지 헤더 (제목 + 카운트 + "전체 지우기")
//   2) 비교 테이블 (가로 그리드 = 좌측 라벨 컬럼 + 데이터 컬럼들)
//      - 헤더 행: 썸네일/브랜드/이름/X + ScoreGauge
//      - 카테고리별 KPI 행들
//      - max 미만일 때 마지막 컬럼 = AddSlot (점선 박스)
//   빈 상태 → 일러스트 없이 텍스트 + CTA
//
// 모바일 폴더의 compareUtils.js는 순수 utility라 데스크탑에서도 그대로 사용
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductsByIds } from '../store/ProductsContext.jsx';
import { getAdapted } from '../data/adapters.js';
import { useCompare } from '../store/CompareContext.jsx';
import { CompareTable } from '../components/desktop/compare/CompareTable.jsx';
import { EmptyCompare } from '../components/desktop/compare/EmptyCompare.jsx';
import Seo from '../components/global/Seo.jsx';
import { productPath } from '../data/productUrl.js';
import {
  LOWEST_UNIT_PRICE_COMPARE_METRIC,
  getCompareMetricsForProducts,
} from '../data/compareKpis.js';
import { getBestIndices } from '../components/mobile/compare/compareUtils.js';
import './ComparePage.css';

// 페이지 헤더 (SRP)
// - count === max 일 때 카운트 칩 톤을 강조 → 슬롯이 사라진 이유를 색으로 보완
function PageHeader({ count, max, onClear }) {
  const isFull = count >= max;
  return (
    <header className="d-compare-page-header">
      <div className="d-compare-page-titlewrap">
        <h1 className="d-compare-page-title">
          제품 비교
          <span className={`d-compare-page-count${isFull ? ' is-full' : ''}`}>
            ({count}/{max})
          </span>
        </h1>
      </div>
      {count > 0 && (
        <button
          type="button"
          className="d-compare-clear-btn"
          onClick={onClear}
        >
          전체 지우기
        </button>
      )}
    </header>
  );
}

export default function ComparePage() {
  const navigate = useNavigate();
  const { ids, remove, clear, reorder, max } = useCompare();
  const { products: storedProducts, loading } = useProductsByIds(ids);

  const products = useMemo(
    () => storedProducts.map(getAdapted),
    [storedProducts],
  );
  const metrics = useMemo(() => getCompareMetricsForProducts(products), [products]);

  // 각 지표별 우수값 인덱스 Set 사전 계산 (렌더마다 N*M 반복 방지)
  const bestByKey = useMemo(() => {
    const out = {};
    for (const m of metrics) {
      if (m.direction === null) {
        out[m.key] = new Set(); // 중립 지표는 강조 없음
        continue;
      }
      out[m.key] = new Set(getBestIndices(products, m, m.direction));
    }
    return out;
  }, [products, metrics]);
  const purchaseBestSet = useMemo(
    () => new Set(getBestIndices(
      products,
      LOWEST_UNIT_PRICE_COMPARE_METRIC,
      LOWEST_UNIT_PRICE_COMPARE_METRIC.direction,
    )),
    [products],
  );

  // ───────── 핸들러 (SRP)
  const handleRemove = (id) => remove(id);
  const handleClear = () => clear();
  const handleOpenDetail = (id) => {
    const p = products.find((x) => String(x.id) === String(id));
    navigate(p ? productPath(p) : `/product/${id}`);
  };
  const handleAdd = () => navigate('/list');
  const handleBrowse = () => navigate('/list');

  const isLoading = loading && ids.length > 0;
  const isEmpty = !isLoading && products.length === 0;
  const canAdd = products.length < max;
  const remaining = max - products.length;

  return (
    <div className="page d-compare">
      <Seo title="제품 비교" noindex />
      <PageHeader count={isLoading ? ids.length : products.length} max={max} onClear={handleClear} />

      {isLoading ? (
        <div className="d-compare-loading" aria-busy="true" />
      ) : isEmpty ? (
        <EmptyCompare max={max} onBrowse={handleBrowse} />
      ) : (
        <>
          <CompareTable
            products={products}
            bestByKey={bestByKey}
            purchaseBestSet={purchaseBestSet}
            metrics={metrics}
            onRemove={handleRemove}
            onOpen={handleOpenDetail}
            onAdd={handleAdd}
            onReorder={reorder}
            canAdd={canAdd}
            remaining={remaining}
          />
        </>
      )}
    </div>
  );
}
