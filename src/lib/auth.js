export const AUTH_RETURN_PATH_KEY = 'daboonhae:auth-return-path';

export function safeReturnPath(value, fallback = '/') {
  const candidate = String(value || '').trim();
  if (!candidate.startsWith('/') || candidate.startsWith('//')) return fallback;
  return candidate;
}

export function rememberAuthReturnPath(path) {
  try {
    sessionStorage.setItem(AUTH_RETURN_PATH_KEY, safeReturnPath(path));
  } catch {
    // OAuth can still complete even when browser storage is unavailable.
  }
}

export function consumeAuthReturnPath() {
  try {
    const value = sessionStorage.getItem(AUTH_RETURN_PATH_KEY);
    sessionStorage.removeItem(AUTH_RETURN_PATH_KEY);
    return safeReturnPath(value);
  } catch {
    return '/';
  }
}

export function loginPath(returnPath = '/') {
  return `/login?next=${encodeURIComponent(safeReturnPath(returnPath))}`;
}

export function wishlistImportPath(returnPath = '/') {
  return `/wishlist/import?next=${encodeURIComponent(safeReturnPath(returnPath))}`;
}
