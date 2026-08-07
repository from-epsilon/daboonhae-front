const BLOCKED_EXACT = new Set([
  '시발', 'ㅅㅂ', 'ㅆㅂ',
  '병신', 'ㅂㅅ',
  '개새끼', '새끼',
  '좆', '존나', 'ㅈㄴ',
  '보지', '자지', '섹스', '강간',
  'fuck', 'fucker', 'fucking', 'motherfucker',
  'bitch', 'shit', 'nigger', 'nigga',
]);

const REVIEW_BLOCKED_EXACT = new Set(
  [...BLOCKED_EXACT].filter((term) => term !== '보지' && term !== '자지'),
);

const BLOCKED_PARTS = [
  '씨발', '씨빨', '씨팔',
  '시발놈', '시발년', '시발새끼',
  '개새끼', '개색기', '개쉐끼',
  '병신', '븅신', '좆', '존나', '졸라',
  '니애미', '니에미', '느금마', '애미뒤',
  '창녀', '강간',
  'fuck', 'bitch', 'motherfucker', 'fucking', 'nigger', 'nigga',
];

const RESERVED_PREFIXES = [
  '다분해', '관리자', '운영자', '어드민',
  'daboonhae', 'admin', 'administrator', 'official',
];

function normalizeText(value) {
  return String(value ?? '').normalize('NFKC').trim().toLowerCase();
}

function compactText(value) {
  return value.replace(/[^\p{L}\p{N}]/gu, '');
}

function containsBlockedExpression(normalized, exactTerms = BLOCKED_EXACT) {
  const compact = compactText(normalized);
  if (exactTerms.has(compact)) return true;
  if (BLOCKED_PARTS.some((part) => compact.includes(part))) return true;
  const tokens = normalized.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  return tokens.some((token) => exactTerms.has(token));
}

function containsContactOrLink(value) {
  if (/https?:\/\/|www\.|\.(?:com|net|org|kr|co\.kr|io)(?:\/|$)/i.test(value)) return true;
  if (/[^\s@]+@[^\s@]+/.test(value)) return true;
  return value.replace(/\D/g, '').length >= 9;
}

export function isAllowedNickname(value) {
  const nickname = normalizeText(value);
  if (nickname.length < 2 || nickname.length > 20) return false;
  if (/[\p{Cc}\p{Cf}]/u.test(nickname)) return false;
  if (containsContactOrLink(nickname)) return false;

  const compact = compactText(nickname);
  if (!compact) return false;
  if (RESERVED_PREFIXES.some((prefix) => compact.startsWith(prefix))) return false;
  return !containsBlockedExpression(nickname);
}

export function isAllowedReviewContent(value) {
  const content = normalizeText(value);
  if (!content) return true;
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]|\p{Cf}/u.test(content)) return false;
  if (containsContactOrLink(content)) return false;
  return !containsBlockedExpression(content, REVIEW_BLOCKED_EXACT);
}
