const IGNORED_ALLERGEN_LABELS = new Set(['', '함유', '및']);

const EGG_ALLERGEN_PATTERN = /^(?:(?:알류|난류)(?:\((?:계란|달걀|가금류)\))?|계란|달걀)$/;

const ALLERGEN_ALIASES = {
  // 식품 알레르기 표시에서는 이산화황을 아황산류 항목으로 묶는다.
  이산화황: '아황산류',
};

export function normalizeAllergenLabel(value) {
  const label = String(value ?? '')
    .trim()
    .replace(/\s*함유$/u, '')
    .trim();
  if (IGNORED_ALLERGEN_LABELS.has(label)) return null;

  const compact = label.replace(/\s+/g, '');
  if (EGG_ALLERGEN_PATTERN.test(compact)) return '난류(계란)';
  return ALLERGEN_ALIASES[compact] ?? label;
}

export function normalizeAllergenList(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(normalizeAllergenLabel).filter(Boolean))];
}

export function parseAllergensText(text) {
  if (text == null) return null;
  return normalizeAllergenList(String(text).split(/[,，、\s]+/));
}
