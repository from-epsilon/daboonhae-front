// 검색 인덱스
// - 공백/구두점으로 나눈 모든 검색어 토큰이 제품 정보에 있으면 매칭(AND)
// - alias 사전은 각 토큰별로 영어 ↔ 한국어 확장
// - 완전 일치/연속 구문 일치를 우선 정렬

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
  shake: ['쉐이크', '셰이크'],
  쉐이크: ['shake', '셰이크'],
  셰이크: ['shake', '쉐이크'],
  bar: ['바'],
  바: ['bar'],
  곤약: ['konjac'],
  konjac: ['곤약'],
};

const TOKEN_SEPARATOR = /[\s_\-./()[\]{}%,·・:：]+/g;

function normalize(text) {
  return String(text ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(TOKEN_SEPARATOR, '');
}

export function tokenizeSearchQuery(query) {
  return String(query ?? '')
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .split(TOKEN_SEPARATOR)
    .map(normalize)
    .filter(Boolean);
}

function expandToken(token) {
  const variants = new Set([token]);
  for (const alias of ALIAS[token] ?? []) variants.add(normalize(alias));
  return [...variants].filter(Boolean);
}

function queryTokenGroups(query) {
  return tokenizeSearchQuery(query).map(expandToken);
}

function buildSearchableText(product) {
  const parts = [
    product.name,
    product.brand,
    product.category,
    product.categoryCode,
    product.flavorName,
    product.flavorCode,
    product.sizeVariantLabel,
    product.family?.name,
    ...(product._raw?.aliases ?? []),
    product._raw?.barcode,
    product._raw?.sourceFoodCode,
    ...(product.ingredients?.proteinSources ?? []),
    ...(product.ingredients?.sweeteners ?? []),
  ];
  return normalize(parts.join(' '));
}

function includesAny(text, variants) {
  return variants.some((variant) => text.includes(variant));
}

function matchScore(query, product, groups) {
  const phrase = normalize(query);
  const name = normalize(product.name);
  const brand = normalize(product.brand);
  const aliases = normalize((product._raw?.aliases ?? []).join(' '));
  let score = 0;

  if (name === phrase) score += 1000;
  else if (name.includes(phrase)) score += 700;
  else if (`${brand}${name}`.includes(phrase)) score += 650;
  else if (aliases.includes(phrase)) score += 600;

  for (const variants of groups) {
    if (includesAny(name, variants)) score += 40;
    else if (includesAny(brand, variants)) score += 30;
    else if (includesAny(aliases, variants)) score += 20;
    else score += 10;
  }
  return score;
}

export function searchProducts(query, products) {
  const groups = queryTokenGroups(query);
  if (groups.length === 0) return [];

  return products
    .map((product, index) => ({ product, index }))
    .filter(({ product }) => {
      const haystack = buildSearchableText(product);
      return groups.every((variants) => includesAny(haystack, variants));
    })
    .map(({ product, index }) => ({
      product,
      index,
      score: matchScore(query, product, groups),
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ product }) => product);
}

export function getSuggestions(query, products, limit = 8) {
  const results = searchProducts(query, products);
  return results.slice(0, limit).map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
  }));
}
