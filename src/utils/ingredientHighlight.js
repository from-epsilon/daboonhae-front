// 원재료명 텍스트를 ingredient_annotations 구간으로 분해 (마킹용 세그먼트 생성)
// - start/end는 ingredients_text 기준 문자 index, end는 선택 구간의 마지막 다음 index
// - 범위를 벗어나거나 앞 구간과 겹치는 annotation은 건너뜀
// - 플랫폼 비종속: 색/클래스는 호출 측에서 type을 보고 렌더
export function buildIngredientSegments(text, annotations) {
  if (!text) return [];
  const len = text.length;

  const valid = (Array.isArray(annotations) ? annotations : [])
    .filter(
      (a) =>
        a &&
        Number.isInteger(a.start) &&
        Number.isInteger(a.end) &&
        a.start >= 0 &&
        a.end <= len &&
        a.start < a.end,
    )
    .sort((a, b) => a.start - b.start);

  const segments = [];
  let cursor = 0;

  for (const ann of valid) {
    if (ann.start < cursor) continue; // 앞 구간과 겹치면 무시
    if (ann.start > cursor) {
      segments.push({ text: text.slice(cursor, ann.start), type: null });
    }
    segments.push({ text: text.slice(ann.start, ann.end), type: ann.type, label: ann.label });
    cursor = ann.end;
  }
  if (cursor < len) {
    segments.push({ text: text.slice(cursor), type: null });
  }
  return segments;
}
