// 제품 상세 URL — 슬러그 + ID 하이브리드 (/product/하림-닭가슴살-블랙페퍼-5)
// - 슬러그는 가독성·키워드용, 끝의 ID로 안정적 조회(슬러그가 바뀌어도 안 깨짐)
// - 한글은 SEO상 그대로 두는 게 키워드 매칭에 유리(구글이 한글 URL을 잘 처리)

// 슬러그 생성 — 한글/영숫자 보존, 그 외(공백·특수문자)는 하이픈, 연속 하이픈 축약
export function slugify(text) {
  return String(text ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-') // 허용 문자 외 → 하이픈
    .replace(/-{2,}/g, '-')           // 연속 하이픈 축약
    .replace(/^-+|-+$/g, '');         // 양끝 하이픈 제거
}

// product: { id, brand, name } (adapted/raw 공통)
export function productPath(product) {
  if (!product || product.id == null) return '/product';
  const name = product.name ?? '';
  const brand = product.brand ?? '';
  // 제품명에 이미 브랜드가 들어있으면 중복 방지 (예: brand '하림' + name '하림 닭가슴살')
  const label = brand && !name.includes(brand) ? `${brand} ${name}` : name;
  const slug = slugify(label);
  return slug ? `/product/${slug}-${product.id}` : `/product/${product.id}`;
}

// 라우트 파라미터에서 ID 추출 — 항상 마지막 숫자 run이 ID (슬러그-ID / 순수 ID 모두 처리)
// productPath가 항상 '-{id}'로 끝나므로 끝의 숫자 = ID
export function parseProductId(param) {
  if (param == null) return null;
  const m = String(param).match(/(\d+)$/);
  return m ? m[1] : String(param);
}
