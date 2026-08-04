// Keep parsing behavior aligned with daboonhae_data_manage/lib/allergens.ts.
const IGNORED_ALLERGEN_LABELS = new Set(['', '함유', '및']);

const EGG_ALLERGEN_PATTERN = /^(?:(?:알류|난류)(?:\((?:계란|달걀|가금류|가금류만해당한다|가금류에한함)\))?|계란|달걀)$/u;
const SHELLFISH_ALLERGEN_PATTERN = /^조개류(?:\((.*)\))?$/u;
const TOP_LEVEL_DELIMITER_PATTERN = /[\s,，、\/·ㆍ;；]/u;

const ALLERGEN_ALIASES = {
  // 식품 알레르기 표시에서는 이산화황을 아황산류 항목으로 묶는다.
  이산화황: '아황산류',
  소고기: '쇠고기',
};

const LEGAL_ALLERGEN_LABELS = new Set([
  '알류(가금류)', '우유', '메밀', '땅콩', '대두', '밀', '고등어', '게', '새우',
  '돼지고기', '복숭아', '토마토', '아황산류', '호두', '닭고기', '쇠고기',
  '오징어', '조개류', '잣',
]);

function standardizeParentheses(value) {
  return value.replaceAll('（', '(').replaceAll('）', ')');
}

function normalizeShellfishLabel(label) {
  const match = label.match(SHELLFISH_ALLERGEN_PATTERN);
  if (!match) return null;

  const detail = String(match[1] || '')
    .trim()
    .replace(/[,，、\/ㆍ]/gu, '·')
    .replace(/\s*·\s*/gu, '·')
    .replace(/\s+/gu, ' ');
  return detail ? `조개류(${detail})` : '조개류';
}

export function normalizeAllergenLabel(value) {
  const label = standardizeParentheses(String(value ?? ''))
    .trim()
    .replace(/\s*함유$/u, '')
    .trim();
  if (IGNORED_ALLERGEN_LABELS.has(label)) return null;

  const compact = label.replace(/\s+/gu, '');
  if (EGG_ALLERGEN_PATTERN.test(compact)) return '알류(가금류)';

  const shellfish = normalizeShellfishLabel(label);
  if (shellfish) return shellfish;

  return ALLERGEN_ALIASES[compact] ?? label.replace(/\s+/gu, ' ');
}

export function normalizeAllergenList(value) {
  if (!Array.isArray(value)) return [];
  return normalizeAllergenTokenList(value).filter(isLegalAllergenLabel);
}

function normalizeAllergenTokenList(value) {
  return [...new Set(value.map(normalizeAllergenLabel).filter(Boolean))];
}

function tokenizeAllergensText(text) {
  const tokens = [];
  let current = '';
  let depth = 0;

  function flush() {
    const token = current.trim();
    if (token) tokens.push(token);
    current = '';
  }

  for (const char of standardizeParentheses(text)) {
    if (char === '(') {
      depth += 1;
      current += char;
      continue;
    }
    if (char === ')') {
      depth = Math.max(0, depth - 1);
      current += char;
      continue;
    }
    if (depth === 0 && TOP_LEVEL_DELIMITER_PATTERN.test(char)) {
      flush();
      continue;
    }
    current += char;
  }
  flush();
  return tokens;
}

function groupIssues(text) {
  const issues = [];
  let depth = 0;

  for (const char of standardizeParentheses(text)) {
    if (char === '(') {
      depth += 1;
    } else if (char === ')') {
      if (depth === 0) {
        issues.push({
          code: 'unexpected_close',
          message: "닫는 괄호 ')' 앞에 대응하는 여는 괄호가 없습니다.",
        });
      } else {
        depth -= 1;
      }
    }
  }

  if (depth > 0) {
    issues.push({
      code: 'unclosed_group',
      message: `닫히지 않은 괄호가 ${depth}개 있습니다.`,
    });
  }
  return issues;
}

function isLegalAllergenLabel(label) {
  return LEGAL_ALLERGEN_LABELS.has(label) || /^조개류\(.+\)$/u.test(label);
}

export function parseAllergensText(text) {
  if (text == null) return null;
  return normalizeAllergenList(tokenizeAllergensText(String(text)));
}

export function analyzeAllergensText(text) {
  if (text == null) return { allergens: null, issues: [], unknownLabels: [] };

  const rawText = String(text);
  const normalizedLabels = normalizeAllergenTokenList(tokenizeAllergensText(rawText));
  const allergens = normalizedLabels.filter(isLegalAllergenLabel);
  const unknownLabels = normalizedLabels.filter(label => !isLegalAllergenLabel(label));
  const issues = groupIssues(rawText);

  for (const label of unknownLabels) {
    issues.push({
      code: 'unknown_label',
      label,
      message: `법정 19개 분류에 없는 항목: ${label}`,
    });
  }
  if (rawText.trim() && normalizedLabels.length === 0) {
    issues.push({
      code: 'empty_result',
      message: '입력값에서 알레르기 항목을 찾지 못했습니다.',
    });
  }

  return { allergens, issues, unknownLabels };
}

export function formatAllergensText(allergens) {
  const normalized = normalizeAllergenList(allergens);
  return normalized.length > 0 ? `${normalized.join(', ')} 함유` : '';
}
