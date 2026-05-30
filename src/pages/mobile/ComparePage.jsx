// 모바일 비교 페이지 (Round 3 Compare 에이전트)
// 구조:
//   AppBar(Back + title + Clear)
//   → (빈 상태) EmptyCompare
//   또는
//   → 비교 그리드 (sticky 좌측 라벨 컬럼 110px + 가로 스크롤 데이터 컬럼들 150px)
//      • 행: 헤더(썸네일/브랜드/이름/X) / Score / 칼로리 / 단백질 / 탄수화물 / 지방 / 당류 / 식이섬유 / 태그
//      • 각 행에서 우수값은 그린 + IconCheck로 강조 (Compare, don't rank — 1위/2위 X)
//   → AddSlot (max 미만일 때 가로 스크롤 마지막)
//   → CompareSummary (자동 비교 한 줄)
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../store/ProductsContext.jsx';
import { getAdapted } from '../../data/adapters.js';
import { useCompare } from '../../store/CompareContext.jsx';
import { AppBar } from '../../components/ds/AppBar.jsx';
import { CompareColumnHeader } from '../../components/mobile/compare/CompareColumnHeader.jsx';
import { CompareCell } from '../../components/mobile/compare/CompareCell.jsx';
import { CompareTagsCell } from '../../components/mobile/compare/CompareTagsCell.jsx';
import { AddSlot } from '../../components/mobile/compare/AddSlot.jsx';
import { EmptyCompare } from '../../components/mobile/compare/EmptyCompare.jsx';
import { CompareSummary } from '../../components/mobile/compare/CompareSummary.jsx';
import {
  COMPARE_METRICS,
  getBestIndices,
  buildCompareSummary,
} from '../../components/mobile/compare/compareUtils.js';
import './ComparePage.css';

// 비교 그리드 본문 — 좌측 라벨 컬럼 없이, 각 셀이 자체 라벨을 표기
// (가로 스크롤 데이터 컬럼들 + AddSlot)
function CompareGrid({ products, bestByKey, onRemove, onOpen, onAdd, canAdd, remaining }) {
  return (
    <div className="m-compare-grid">
      <div className="m-compare-data-scroll">
        <div className="m-compare-data-track">
          {products.map((p, idx) => (
            <div key={p.id} className="m-compare-data-col">
              {/* 헤더 셀 (썸네일/브랜드/이름/X) */}
              <CompareColumnHeader product={p} onRemove={onRemove} onOpen={onOpen} />

              {/* 영양소 셀들 — 라벨 + 값 */}
              {COMPARE_METRICS.map((m) => {
                const value = p?.nutrition?.[m.key];
                const isBest = bestByKey[m.key]?.has(idx) ?? false;
                return (
                  <CompareCell
                    key={m.key}
                    label={m.label}
                    value={value}
                    unit={m.unit}
                    isBest={isBest}
                  />
                );
              })}

              {/* 자동 태그 셀 */}
              <CompareTagsCell tags={p.tags} />
            </div>
          ))}

          {/* AddSlot — max 미만일 때만 마지막 컬럼으로 노출 */}
          {canAdd && (
            <div className="m-compare-data-col m-compare-data-col--add">
              <AddSlot onClick={onAdd} remaining={remaining} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ComparePageMobile() {
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
  const handleBack = () => navigate('/');
  const handleRemove = (id) => remove(id);
  const handleClear = () => clear();
  const handleOpenDetail = (id) => navigate(`/product/${id}`);
  const handleAdd = () => navigate('/list');

  const isEmpty = products.length === 0;
  const canAdd = products.length < max;
  const remaining = max - products.length;
  const titleText = isEmpty
    ? '제품 비교'
    : `제품 비교 (${products.length}/${max})`;

  return (
    <>
      <AppBar
        title={titleText}
        onBack={handleBack}
        // AppBar 우측은 비교함 아이콘 자리 — 이 페이지에선 onCompare 비워 두면 클릭해도 동작 X
        // 대신 '전체 지우기'를 본문 상단 액션바로 노출 (DS Top bar action 자리는 1개만 허용)
      />

      {isEmpty ? (
        <div className="m-compare m-compare--empty-wrap">
          <EmptyCompare max={max} onBrowse={() => navigate('/list')} />
        </div>
      ) : (
        <div className="m-compare">
          {/* 액션바: 카운트 + 전체 지우기 (AppBar 우측 슬롯 대안) */}
          <div className="m-compare-actionbar">
            <span className="m-compare-actionbar-count">
              <b>{products.length}</b> / {max} 선택됨
            </span>
            <button
              type="button"
              className="m-compare-clear-btn"
              onClick={handleClear}
            >
              전체 지우기
            </button>
          </div>

          {/* 본문 그리드 */}
          <CompareGrid
            products={products}
            bestByKey={bestByKey}
            onRemove={handleRemove}
            onOpen={handleOpenDetail}
            onAdd={handleAdd}
            canAdd={canAdd}
            remaining={remaining}
          />

          {/* 하단 자동 요약 */}
          <CompareSummary sentences={summary} />
        </div>
      )}
    </>
  );
}
