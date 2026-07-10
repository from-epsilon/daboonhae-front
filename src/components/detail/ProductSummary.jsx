import ProductThumb from '../global/ProductThumb.jsx';

// 제품 요약 섹션
// - 썸네일·브랜드·제품명·용량 + 영양·원료·알레르기 등 카드에 못 담은 정보까지 표시
// - 영양 키 라벨·단위는 일단 하드코딩, 추후 메타로 분리 가능
const NUTRITION_FIELDS = [
  { key: 'calories', label: '칼로리', unit: 'kcal' },
  { key: 'protein', label: '단백질', unit: 'g' },
  { key: 'carbs', label: '탄수화물', unit: 'g' },
  { key: 'sugar', label: '당류', unit: 'g' },
  { key: 'fat', label: '지방', unit: 'g' },
  { key: 'fiber', label: '식이섬유', unit: 'g' },
  { key: 'bcaa', label: 'BCAA', unit: 'g' },
];

export default function ProductSummary({ product }) {
  return (
    <section className="product-summary">
      <div className="product-summary-head">
        <ProductThumb product={product} size="card" />
        <div className="product-summary-meta">
          <div className="summary-brand">{product.brand}</div>
          <h1 className="summary-name">{product.name}</h1>
          <div className="summary-volume">{product.volume}</div>
          <p className="summary-description">{product.description}</p>
        </div>
      </div>

      <div className="summary-section">
        <h3 className="summary-section-title">영양 정보 ({product.volume} 기준)</h3>
        <ul className="nutrition-list">
          {NUTRITION_FIELDS.map((f) => (
            <li key={f.key} className="nutrition-item">
              <span className="nutrition-label">{f.label}</span>
              <span className="nutrition-value">{product.nutrition?.[f.key] ?? '-'}{f.unit}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="summary-section">
        <h3 className="summary-section-title">원료 / 성분</h3>
        <ul className="ingredient-list">
          <IngredientRow label="단백질 원료" items={product.ingredients?.proteinSources} fallback="해당 없음" />
          <IngredientRow label="대체당" items={product.ingredients?.sweeteners} fallback="사용 안 함" />
          <IngredientRow
            label="알레르겐"
            items={product.ingredients?.allergens}
            fallback={product.ingredients?.allergensKnown === false ? '정보 없음' : '없음'}
          />
          <li className="ingredient-row">
            <span className="ingredient-label">유당</span>
            <span className="ingredient-value">{formatLactose(product.ingredients?.lactoseFree)}</span>
          </li>
        </ul>
      </div>
    </section>
  );
}

// 원료 행 (배열 → 콤마 조인, 없으면 fallback)
function IngredientRow({ label, items, fallback }) {
  const value = items && items.length > 0 ? items.join(', ') : fallback;
  return (
    <li className="ingredient-row">
      <span className="ingredient-label">{label}</span>
      <span className="ingredient-value">{value}</span>
    </li>
  );
}

function formatLactose(lactoseFree) {
  if (lactoseFree === true) return 'Free';
  if (lactoseFree === false) return '포함 가능';
  return '정보 없음';
}
