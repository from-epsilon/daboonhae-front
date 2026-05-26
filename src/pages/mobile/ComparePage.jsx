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
import { getProductById } from '../../data/mockProducts.js';
import { getAdapted } from '../../data/adapters.js';
import { useCompare } from '../../store/CompareContext.jsx';
import { AppBar } from '../../components/ds/AppBar.jsx';
import { CompareColumnHeader } from '../../components/mobile/compare/CompareColumnHeader.jsx';
import { CompareCell } from '../../components/mobile/compare/CompareCell.jsx';
import { CompareScoreCell } from '../../components/mobile/compare/CompareScoreCell.jsx';
import { CompareTagsCell } from '../../components/mobile/compare/CompareTagsCell.jsx';
import { AddSlot } from '../../components/mobile/compare/AddSlot.jsx';
import { EmptyCompare } from '../../components/mobile/compare/EmptyCompare.jsx';
import { CompareSummary } from '../../components/mobile/compare/CompareSummary.jsx';
import {
  COMPARE_METRICS,
  getBestIndices,
  getBestScoreIndices,
  buildCompareSummary,
} from '../../components/mobile/compare/compareUtils.js';
import './ComparePage.css';

// 좌측 sticky 라벨 셀 (행 제목)
function LabelCell({ label, size = 'md' }) {
  const cls = size === 'lg'
    ? 'm-compare-label-cell m-compare-label-cell--lg'
    : 'm-compare-label-cell';
  return <div className={cls}>{label}</div>;
}

// 비교 그리드 본문 (SRP로 분리 — 라벨 컬럼 + 데이터 컬럼들 + AddSlot)
function CompareGrid({ products, bestByKey, bestScoreSet, onRemove, onOpen, onAdd, canAdd, remaining }) {
  return (
    <div className="m-compare-grid">
      {/* 좌측 sticky 라벨 컬럼 */}
      <div className="m-compare-label-col">
        <LabelCell label="" size="lg" />
        <LabelCell label="다분해 점수" size="lg" />
        {COMPARE_METRICS.map((m) => (
          <LabelCell key={m.key} label={m.label} />
        ))}
        <LabelCell label="자동 태그" size="lg" />
      </div>

      {/* 우측 가로 스크롤 데이터 컬럼 영역 */}
      <div className="m-compare-data-scroll">
        <div className="m-compare-data-track">
          {products.map((p, idx) => (
            <div key={p.id} className="m-compare-data-col">
              {/* 헤더 셀 (썸네일/브랜드/이름/X) */}
              <CompareColumnHeader product={p} onRemove={onRemove} onOpen={onOpen} />

              {/* 점수 셀 */}
              <CompareScoreCell value={p.score} isBest={bestScoreSet.has(idx)} />

              {/* 영양소 셀들 */}
              {COMPARE_METRICS.map((m) => {
                const value = p?.nutrition?.[m.key];
                const isBest = bestByKey[m.key]?.has(idx) ?? false;
                return (
                  <CompareCell
                    key={m.key}
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

  // raw → DS 형식 변환 (id 변동 시만 재계산)
  const products = useMemo(
    () => ids.map(getProductById).filter(Boolean).map(getAdapted),
    [ids],
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

  // 점수 best 인덱스
  const bestScoreSet = useMemo(
    () => new Set(getBestScoreIndices(products)),
    [products],
  );

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
            bestScoreSet={bestScoreSet}
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
