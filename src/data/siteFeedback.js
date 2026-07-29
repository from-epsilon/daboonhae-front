export const SITE_FEEDBACK_OPEN_EVENT = 'daboonhae:open-site-feedback';

export function openSiteFeedback({ type = null, entryPoint = 'global_fab' } = {}) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(SITE_FEEDBACK_OPEN_EVENT, {
    detail: { type, entryPoint },
  }));
}
