import { getAdapted } from './adapters.js';
import { productMatchesTab } from './categoryTabs.js';
import { getProteinDrinkRecommendConfidence, getProteinDrinkRecommendScore } from './listSort.js';

function purposeRecommendationScore(product, tabId) {
  if (tabId === 'protein' && product?.categoryCode === 'protein_drink') {
    return getProteinDrinkRecommendScore(product);
  }
  return product?.rankingScore ?? 0;
}

export function getPurposeRecommendedProducts(products, tabId, limit) {
  return (products ?? [])
    .filter((p) => productMatchesTab(p, tabId))
    .sort((a, b) => {
      const scoreDiff = (purposeRecommendationScore(b, tabId) ?? -Infinity) - (purposeRecommendationScore(a, tabId) ?? -Infinity);
      if (scoreDiff !== 0) return scoreDiff;

      if (tabId === 'protein' && (a?.categoryCode === 'protein_drink' || b?.categoryCode === 'protein_drink')) {
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
