// 다분해 DS FoodCard (제품 카드 — grid/list 두 가지 레이아웃)
// props:
//   - food: adapters.getAdapted(product) 결과 객체
//       { id, brand, name, thumb(URL), score(0~10), macros, tags, trustBadges, ... }
//   - onClick: 카드 전체 클릭 핸들러 (디테일 진입)
//   - layout: 'grid' (홈/리스트 그리드) | 'list' (리스트 페이지)
//   - onCompare: 비교함 담기 콜백 (미지정 시 + 버튼 미표시)
import { Badge } from './Badge.jsx';
import { MacroRow } from './MacroRow.jsx';
import { IconPlus, IconCheck } from './Icons.jsx';

// 썸네일 이미지 (URL → img, 빈값 → 회색 placeholder)
// - 원본 DS는 thumb 가 CSS gradient 문자열이라 background 로 적용했지만
//   우리 데이터의 thumb 은 실제 이미지 URL → <img>로 처리 + object-fit cover
function ThumbImage({ src, alt }) {
  if (!src) {
    // 빈 URL 폴백: 회색 placeholder
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'var(--gray-100)',
          borderRadius: 'inherit',
        }}
      />
    );
  }
  return (
    <img
      src={src}
      alt={alt ?? ''}
      loading="lazy"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: 'inherit',
        display: 'block',
      }}
    />
  );
}

// 비교함 추가 버튼 (썸네일 우하단)
// - 시각 크기 26x26, 의사요소로 hit-area 44x44 확장
function CompareButton({ food, onCompare, inCompare }) {
  if (!onCompare) return null;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onCompare(food);
      }}
      aria-label={inCompare ? `${food.name} 비교함에서 빼기` : `${food.name} 비교함에 담기`}
      title={inCompare ? '비교함에서 빼기' : '비교함에 담기'}
      className={`d-foodcard-compare${inCompare ? ' is-in-compare' : ''}`}
    >
      {inCompare ? <IconCheck size={14} /> : <IconPlus size={14} />}
    </button>
  );
}

// 신뢰 배지(체크 아이콘 + 라벨) 한 줄 — trustBadges 첫 1개만
function TrustBadgeRow({ trustBadges }) {
  if (!trustBadges || trustBadges.length === 0) return null;
  const t = trustBadges[0];
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        fontSize: 10,
        color: 'var(--blue-700)',
      }}
    >
      <IconCheck size={11} stroke={2} />
      <span>{t.label}</span>
    </div>
  );
}

// list 레이아웃: 가로 88x88 썸네일 + 텍스트 영역
function FoodCardList({ food, onClick, onCompare, inCompare }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        gap: 12,
        padding: '14px 0',
        borderBottom: '1px solid var(--border-tertiary)',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          width: 88,
          height: 88,
          borderRadius: 'var(--radius-sm)',
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--gray-100)',
        }}
      >
        <ThumbImage src={food.thumb} alt={food.name} />
        <CompareButton food={food} onCompare={onCompare} inCompare={inCompare} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{food.brand}</div>
        <div
          style={{
            fontSize: 14,
            color: 'var(--text-primary)',
            fontWeight: 500,
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {food.name}
        </div>
        {food.serving && (
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{food.serving}</div>
        )}
        <MacroRow {...food.macros} compact />
        {/* list 레이아웃: tags 전부 + trust 1개 */}
        <div
          style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}
        >
          {food.tags && food.tags.map((t, i) => (
            <Badge key={i} variant={t.v}>
              {t.label}
            </Badge>
          ))}
          <TrustBadgeRow trustBadges={food.trustBadges} />
        </div>
      </div>
    </div>
  );
}

// grid 레이아웃: 1:1 썸네일 + 하단 텍스트
function FoodCardGrid({ food, onClick, onCompare, inCompare, sortKey }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'white',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          aspectRatio: '1/1',
          position: 'relative',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          background: 'var(--gray-100)',
        }}
      >
        <ThumbImage src={food.thumb} alt={food.name} />
        <CompareButton food={food} onCompare={onCompare} inCompare={inCompare} />
      </div>
      <div style={{ padding: '10px 4px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 'var(--font-size-xxs)', color: 'var(--text-secondary)' }}>{food.brand}</div>
        <div
          style={{
            fontSize: 'var(--font-size-s)',
            color: 'var(--text-primary)',
            fontWeight: 500,
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: 36,
          }}
        >
          {food.name}
        </div>
        {food.serving && (
          <div style={{ fontSize: 'var(--font-size-xxs)', color: 'var(--text-tertiary)' }}>{food.serving}</div>
        )}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 6,
            marginTop: 4,
            fontFamily: 'var(--font-numeric)',
          }}
        >
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
            {food.macros.kcal}
          </span>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>kcal</span>
          <span style={{ marginLeft: 'auto', display: 'flex', gap: 8, fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
            {getMetrics(food).map((m) => (
              <span key={m.label}>
                {m.label} <b style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{m.value ?? '-'}{m.unit}</b>
              </span>
            ))}
          </span>
        </div>
        {/* grid 레이아웃: tags 2개 + trust 1개 */}
        <div
          style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}
        >
          {food.tags &&
            food.tags.slice(0, 2).map((t, i) => (
              <Badge key={i} variant={t.v}>
                {t.label}
              </Badge>
            ))}
          <TrustBadgeRow trustBadges={food.trustBadges} />
        </div>
        {/* 후기 N건 — 카드 trust 신호 */}
      </div>
    </div>
  );
}

// 정렬 기준 → metric 매핑
const SORT_METRIC = {
  protein_desc: (f) => ({ label: '단백질', value: f.macros?.protein, unit: 'g' }),
  sugar_asc: (f) => ({ label: '당류', value: f.nutrition?.sugar, unit: 'g' }),
  carbs_asc: (f) => ({ label: '탄수화물', value: f.macros?.carbs, unit: 'g' }),
};

// 카테고리별 기본 metric
function getMetrics(food) {
  const m = food.macros ?? {};
  return [
    { label: '탄', value: m.carbs, unit: 'g' },
    { label: '단', value: m.protein, unit: 'g' },
    { label: '지', value: m.fat, unit: 'g' },
  ];
}

// 카드 하단 trust 신호 — "후기 24건"
// - reviewCount 가 없으면 "후기 수집 중" 라벨
function ReviewMeta({ reviewCount }) {
  const hasReviews = typeof reviewCount === 'number' && reviewCount > 0;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
        fontSize: 'var(--font-size-xxs)',
        color: 'var(--text-secondary)',
        lineHeight: 1.3,
      }}
    >
      <span>{hasReviews ? `후기 ${reviewCount}건` : '후기 수집 중'}</span>
    </div>
  );
}

export function FoodCard({ food, onClick, layout = 'grid', onCompare, inCompare, sortKey }) {
  if (!food) return null;
  if (layout === 'list') {
    return <FoodCardList food={food} onClick={onClick} onCompare={onCompare} inCompare={inCompare} />;
  }
  return <FoodCardGrid food={food} onClick={onClick} onCompare={onCompare} inCompare={inCompare} sortKey={sortKey} />;
}
