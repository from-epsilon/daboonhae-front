// 모바일 디테일 페이지 (Round 3)
// 구조: AppBar(서브) → Hero → MacroRow → 자동 태그 → 영양표 → 분석 리포트 → 원료 → 후기 → sticky CTA bar
// - 모바일 셸은 디테일에서 BottomNav 숨김 (App.jsx 처리). 본문 하단은 sticky CTA용 padding 확보
// - AppBar/CTA는 페이지가 직접 렌더
import { useParams, useNavigate } from 'react-router-dom';
import { useProductById, useProducts } from '../../store/ProductsContext.jsx';
import { getAdapted } from '../../data/adapters.js';
import { useCompare } from '../../store/CompareContext.jsx';
import { usePurpose } from '../../store/PurposeContext.jsx';
import { AppBar } from '../../components/ds/AppBar.jsx';
import { Button } from '../../components/ds/Button.jsx';
import { Badge } from '../../components/ds/Badge.jsx';
import { MacroRow } from '../../components/ds/MacroRow.jsx';
import { HeroSection } from '../../components/mobile/detail/HeroSection.jsx';
import { NutritionTable } from '../../components/mobile/detail/NutritionTable.jsx';
import { AnalysisCard } from '../../components/mobile/detail/AnalysisCard.jsx';
import { IngredientList } from '../../components/mobile/detail/IngredientList.jsx';
import { ReviewSection } from '../../components/mobile/detail/ReviewSection.jsx';
import { StickyCTA } from '../../components/mobile/detail/StickyCTA.jsx';
import './DetailPage.css';

// 자동 태그 가로 스크롤 라인 — 없으면 노출 안 함
function TagsRow({ tags }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div className="m-detail-tags" aria-label="제품 태그">
      {tags.map((t, i) => (
        <Badge key={i} variant={t.v}>{t.label}</Badge>
      ))}
    </div>
  );
}

// 매크로 분포 카드 — 풀 MacroRow + kcal 별도 노출
function MacroSection({ macros }) {
  return (
    <section className="m-detail-card m-detail-macro">
      <header className="m-detail-card-head">
        <h2 className="m-detail-card-title">매크로 분포</h2>
        <span className="m-detail-card-sub">
          <b>{macros.kcal}</b>kcal
        </span>
      </header>
      <MacroRow
        protein={macros.protein}
        carbs={macros.carbs}
        fat={macros.fat}
        kcal={macros.kcal}
      />
    </section>
  );
}

// 제품 없음 안내 — 홈으로 가는 버튼
function EmptyState({ onHome }) {
  return (
    <div className="m-detail-empty">
      <p className="m-detail-empty-msg">존재하지 않는 제품이에요.</p>
      <Button variant="brand" onClick={onHome}>메인으로 가기</Button>
    </div>
  );
}

export default function DetailPageMobile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { has, toggle, isFull, max } = useCompare();
  const { purpose, purposeId } = usePurpose();

  // raw 제품 → DS 형식 변환 (adapter는 raw도 들고 있어 분석에 그대로 활용 가능)
  const { loading } = useProducts();
  const raw = useProductById(id);
  const product = raw ? getAdapted(raw) : null;

  if (loading) return (
    <>
      <AppBar onBack={() => navigate(-1)} title="불러오는 중..." />
      <div className="m-detail" style={{ gap: 16, padding: '16px 16px 92px' }}>
        <div style={{ width: '100%', aspectRatio: '4/3', background: 'var(--gray-100)', borderRadius: 12 }} className="d-skeleton" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="d-skeleton" style={{ width: '30%', height: 12, borderRadius: 4, display: 'inline-block' }} />
          <span className="d-skeleton" style={{ width: '80%', height: 22, borderRadius: 4, display: 'inline-block' }} />
          <span className="d-skeleton" style={{ width: '50%', height: 12, borderRadius: 4, display: 'inline-block' }} />
        </div>
        <span className="d-skeleton" style={{ width: '100%', height: 80, borderRadius: 12, display: 'inline-block' }} />
        <span className="d-skeleton" style={{ width: '100%', height: 200, borderRadius: 12, display: 'inline-block' }} />
      </div>
    </>
  );
  if (!product) {
    return (
      <>
        <AppBar onBack={() => navigate('/')} title="제품 정보" />
        <EmptyState onHome={() => navigate('/')} />
      </>
    );
  }

  const inCart = has(product.id);

  // 비교함 토글 — 가득 차고 새로 담으려 하면 안내
  const handleToggleCompare = () => {
    if (!inCart && isFull) {
      window.alert(`비교함은 최대 ${max}개까지 담을 수 있어요.`);
      return;
    }
    toggle(product.id);
  };

  // 공유 — 실제 공유 API 없이 콘솔만 (요구사항대로)
  const handleShare = () => {
    console.log('[share]', product.id, product.name);
  };

  return (
    <>
      <AppBar
        onBack={() => navigate(-1)}
        title={product.name}
        onCompare={handleShare}
      />

      <div className="m-detail">
        {/* 1. 히어로: 이미지 + 점수 게이지 (시그니처) */}
        <HeroSection product={product} />

        {/* 2. 매크로 분포 */}
        <MacroSection macros={product.macros} />

        {/* 3. 자동 태그 (가로 스크롤) */}
        <TagsRow tags={product.tags} />

        {/* 4. 영양성분표 */}
        <NutritionTable nutrition={product.nutrition} serving={product.serving} foodNutrients={raw?._raw?.foodNutrients} />

        {/* 5. 분석 리포트 (목적별 룰 기반) */}
        <AnalysisCard rawProduct={raw} purpose={purpose} purposeId={purposeId} />

        {/* 6. 원료 · 성분 */}
        <IngredientList ingredients={product.ingredients} />

        {/* 7. 후기 */}
        <ReviewSection productId={product.id} />
      </div>

      {/* 8. 하단 sticky CTA */}
      <StickyCTA
        inCart={inCart}
        onToggleCompare={handleToggleCompare}
        purchaseUrl={raw?.purchaseUrl}
      />
    </>
  );
}
