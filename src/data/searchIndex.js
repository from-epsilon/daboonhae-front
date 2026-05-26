// 검색 인덱스
// - alias 사전: 영어 ↔ 한국어 매칭, 띄어쓰기 무시
// - 매칭 규칙은 이 파일에서만 관리 (추후 필드 추가/스코어링 변경 용이)

const ALIAS = {
  protein: ['단백질', '프로틴'],
  프로틴: ['단백질', 'protein'],
  단백질: ['프로틴', 'protein'],
  whey: ['웨이', '유청'],
  웨이: ['whey', '유청'],
  wpi: ['아이솔레이트', 'isolate', '분리유청'],
  isolate: ['wpi', '아이솔레이트', '분리유청'],
  bcaa: ['아미노산'],
  zero: ['제로'],
  제로: ['zero'],
  chicken: ['닭', '닭가슴살'],
  닭: ['chicken', '닭가슴살'],
  shake: ['쉐이크'],
  쉐이크: ['shake'],
  bar: ['바'],
  바: ['bar'],
  곤약: ['konjac'],
  konjac: ['곤약'],
};

function normalize(text) {
  return String(text ?? '').toLowerCase().replace(/\s+/g, '');
}

function expandQueryTokens(query) {
  const norm = normalize(query);
  if (!norm) return [];
  const tokens = new Set([norm]);
  if (ALIAS[norm]) {
    for (const alias of ALIAS[norm]) tokens.add(normalize(alias));
  }
  return [...tokens];
}

function buildSearchableText(product) {
  const parts = [
    product.name,
    product.brand,
    product.category,
    ...(product.ingredients?.proteinSources ?? []),
    ...(product.ingredients?.sweeteners ?? []),
  ];
  return normalize(parts.join(' '));
}

export function searchProducts(query, products) {
  const tokens = expandQueryTokens(query);
  if (tokens.length === 0) return [];
  return products.filter((product) => {
    const haystack = buildSearchableText(product);
    return tokens.some((t) => haystack.includes(t));
  });
}

export function getSuggestions(query, products, limit = 8) {
  const results = searchProducts(query, products);
  return results.slice(0, limit).map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
  }));
}
