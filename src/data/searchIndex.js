// 검색 인덱스
// - alias 사전: 영어 ↔ 한국어 매칭, 띄어쓰기 무시
// - 매칭 규칙은 이 파일에서만 관리 (추후 필드 추가/스코어링 변경 용이)

import { PRODUCTS } from './mockProducts.js';

// 검색어 ↔ 표준 토큰 매핑 사전 (양방향)
// 키: 소문자·공백제거된 입력, 값: 매칭에 사용할 한국어 정규화 토큰들
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

// 입력 정규화: 소문자 + 공백 제거
function normalize(text) {
  return String(text ?? '').toLowerCase().replace(/\s+/g, '');
}

// 입력어를 alias 사전을 이용해 확장 (자기자신 + alias 토큰들)
function expandQueryTokens(query) {
  const norm = normalize(query);
  if (!norm) return [];
  const tokens = new Set([norm]);
  if (ALIAS[norm]) {
    for (const alias of ALIAS[norm]) tokens.add(normalize(alias));
  }
  return [...tokens];
}

// 제품을 검색 가능한 단일 문자열로 (제품명 + 브랜드 + 카테고리 + 원료 + 대체당)
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

// 검색 실행: 매칭된 제품 배열 반환
export function searchProducts(query) {
  const tokens = expandQueryTokens(query);
  if (tokens.length === 0) return [];
  return PRODUCTS.filter((product) => {
    const haystack = buildSearchableText(product);
    return tokens.some((t) => haystack.includes(t));
  });
}

// 자동완성 후보 (제품명·브랜드 기준, 최대 N개)
export function getSuggestions(query, limit = 8) {
  const results = searchProducts(query);
  return results.slice(0, limit).map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
  }));
}
