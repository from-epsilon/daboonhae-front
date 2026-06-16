// 데스크탑 비교 페이지 (Round 4)
// 구조:
//   1) 페이지 헤더 (제목 + 카운트 + "전체 지우기")
//   2) 비교 테이블 (가로 그리드 = 좌측 라벨 컬럼 + 데이터 컬럼들)
//      - 헤더 행: 썸네일/브랜드/이름/X + ScoreGauge
//      - 다분해 점수 행
//      - 영양소 행들 (COMPARE_METRICS)
//      - 자동 태그 행
//      - Trust 배지 행 (공식 영양정보)
//      - max 미만일 때 마지막 컬럼 = AddSlot (점선 박스)
//   3) 자동 비교 요약 (Compare, don't rank 톤)
//   빈 상태 → 일러스트 없이 텍스트 + CTA
//
// 모바일 폴더의 compareUtils.js는 순수 utility라 데스크탑에서도 그대로 import (수정 금지)
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../store/ProductsContext.jsx';
import { getAdapted } from '../data/adapters.js';
import { useCompare } from '../store/CompareContext.jsx';
import { CompareTable } from '../components/desktop/compare/CompareTable.jsx';
import { CompareSummary } from '../components/desktop/compare/CompareSummary.jsx';
import { EmptyCompare } from '../components/desktop/compare/EmptyCompare.jsx';
import Seo from '../components/global/Seo.jsx';
import {
  COMPARE_METRICS,
  getBestIndices,
  buildCompareSummary,
} from '../components/mobile/compare/compareUtils.js';
import './ComparePage.css';

// 페이지 헤더 (SRP)
// - count === max 일 때 카운트 칩 톤을 강조하고 안내문도 함께 변경 → 슬롯이 사라진 이유를 텍스트로 보완
function PageHeader({ count, max, onClear }) {
  const isFull = count >= max;
  return (
    <header className="d-compare-page-header">
      <div className="d-compare-page-titlewrap">
        <h1 className="d-compare-page-title">
          제품 비교
          <span className={`d-compare-page-count${isFull ? ' is-full' : ''}`}>
            ({count}/{max} 선택됨)
          </span>
        </h1>
        <p className="d-compare-page-sub">
          {isFull
            ? '최대 인원이 모두 채워졌어요. 다른 제품을 보려면 먼저 하나를 제거해 주세요.'
            : '순위가 아닌 차이를 보여드려요. 각 지표의 우수값은 그린으로 강조됩니다.'}
        </p>
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
  const { ids, remove, clear, max } = useCompare();
  const { products: allProducts } = useProducts();

  const products = useMemo(
    () => ids.map(id => allProducts.find(p => String(p.id) === String(id))).filter(Boolean).map(getAdapted),
    [ids, allProducts],
  );

  // 각 지표별 우수값 인덱스 Set 사전 계산 (렌더마다 N*M 반복 방지)
  const bestByKey = useMemo(() => {
    const out = {};
    for (const m of COMPARE_METRICS) {
      if (m.direction === null) {
        out[m.key] = new Set(); // 중립 지표는 강조 없음
        continue;
      }
      out[m.key] = new Set(getBestIndices(products, m.key, m.direction));
    }
    return out;
  }, [products]);

  // 자동 요약 문장
  const summary = useMemo(() => buildCompareSummary(products), [products]);

  // ───────── 핸들러 (SRP)
  const handleRemove = (id) => remove(id);
  const handleClear = () => clear();
  const handleOpenDetail = (id) => navigate(`/product/${id}`);
  const handleAdd = () => navigate('/list');
  const handleBrowse = () => navigate('/list');

  const isEmpty = products.length === 0;
  const canAdd = products.length < max;
  const remaining = max - products.length;

  return (
    <div className="page d-compare">
      <Seo title="제품 비교" noindex />
      <PageHeader count={products.length} max={max} onClear={handleClear} />

      {isEmpty ? (
        <EmptyCompare max={max} onBrowse={handleBrowse} />
      ) : (
        <>
          <CompareTable
            products={products}
            bestByKey={bestByKey}
            metrics={COMPARE_METRICS}
            onRemove={handleRemove}
            onOpen={handleOpenDetail}
            onAdd={handleAdd}
            canAdd={canAdd}
            remaining={remaining}
          />
          <CompareSummary sentences={summary} />
        </>
      )}
    </div>
  );
}
