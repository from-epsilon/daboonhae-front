import { getAdapted } from './adapters.js';
import { productMatchesTab } from './categoryTabs.js';
import { getProteinDrinkRecommendConfidence, getProteinDrinkRecommendScore } from './listSort.js';

function purposeRecommendationScore(product, tabId) {
  if (tabId === 'protein') {
    return getProteinDrinkRecommendScore(product);
  }
  return product?.rankingScore ?? 0;
}

export function getPurposeRecommendedProducts(products, tabId, limit) {
  return (products ?? [])
    .filter((p) => productMatchesTab(p, tabId))
    // 단백질 보충 추천은 카테고리 종류가 아니라 실제 추천점수 보유 여부로만 제한한다.
    // 추후 셰이크 등 다른 식품유형에 점수가 연결되면 별도 분기 없이 자동 포함된다.
    .filter((p) => tabId !== 'protein' || Number.isFinite(getProteinDrinkRecommendScore(p)))
    .sort((a, b) => {
      const scoreDiff = (purposeRecommendationScore(b, tabId) ?? -Infinity) - (purposeRecommendationScore(a, tabId) ?? -Infinity);
      if (scoreDiff !== 0) return scoreDiff;

      if (tabId === 'protein') {
        const confidenceDiff = getProteinDrinkRecommendConfidence(b) - getProteinDrinkRecommendConfidence(a);
        if (confidenceDiff !== 0) return confidenceDiff;
      }

      const rankingDiff = (b?.rankingScore ?? 0) - (a?.rankingScore ?? 0);
      if (rankingDiff !== 0) return rankingDiff;

      return String(a?.name ?? '').localeCompare(String(b?.name ?? ''), 'ko');
    })
    .slice(0, limit)
    .map(getAdapted);
}
