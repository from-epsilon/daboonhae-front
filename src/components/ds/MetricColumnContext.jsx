// 리스트 카드 핵심 지표 표 — '강조 열'을 카드 간 공유하는 컨텍스트
// - 한 카드의 열에 호버하면 모든 제품 카드의 같은 열이 함께 강조
// - 호버가 풀려도 마지막 강조 열을 유지(sticky)
import { createContext, useContext, useState } from 'react';

const MetricColumnContext = createContext(null);

export function MetricColumnProvider({ children }) {
  const [activeCol, setActiveCol] = useState(null);
  return (
    <MetricColumnContext.Provider value={{ activeCol, setActiveCol }}>
      {children}
    </MetricColumnContext.Provider>
  );
}

// 컨텍스트가 있으면 공유 상태, 없으면 카드별 로컬 상태로 폴백
export function useMetricColumn() {
  const ctx = useContext(MetricColumnContext);
  const local = useState(null);
  return ctx ? [ctx.activeCol, ctx.setActiveCol] : local;
}
