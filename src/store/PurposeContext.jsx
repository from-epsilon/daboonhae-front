import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { getPurpose } from '../data/purposes.jsx';

// 목적(purpose) 전역 상태
// - 사용자가 어디서든 목적 토글로 변경 가능
// - localStorage에 영속 → 새로고침해도 마지막 선택이 유지됨
// - 알 수 없는 id는 'all'로 안전 fallback

const STORAGE_KEY = 'dabunhae:purpose:v1';
const PurposeContext = createContext(null);

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 'all';
    return typeof raw === 'string' && raw.length > 0 ? raw : 'all';
  } catch {
    return 'all';
  }
}

function saveToStorage(id) {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // 저장 실패는 치명적이지 않으므로 무시
  }
}

export function PurposeProvider({ children }) {
  const [purposeId, setPurposeId] = useState(() => loadFromStorage());

  useEffect(() => {
    saveToStorage(purposeId);
  }, [purposeId]);

  const setPurpose = useCallback((id) => {
    setPurposeId(id ?? 'all');
  }, []);

  // 현재 목적의 메타데이터 (없으면 ALL_PURPOSE)
  const purpose = useMemo(() => getPurpose(purposeId), [purposeId]);

  const value = useMemo(
    () => ({ purposeId, purpose, setPurpose }),
    [purposeId, purpose, setPurpose],
  );

  return <PurposeContext.Provider value={value}>{children}</PurposeContext.Provider>;
}

export function usePurpose() {
  const ctx = useContext(PurposeContext);
  if (!ctx) throw new Error('usePurpose는 PurposeProvider 안에서만 사용 가능');
  return ctx;
}
