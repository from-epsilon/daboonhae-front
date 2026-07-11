const projectToken = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN?.trim();
const apiHost = import.meta.env.VITE_POSTHOG_HOST?.trim();
const INTERNAL_USER_KEY = 'dabunhae:analytics:internal:v1';
const INTERNAL_NOTICE_KEY = 'dabunhae:analytics:internal-notice';

let client = null;
let initialization = null;
let staffCommandProcessed = false;
const pendingEvents = [];

export const ANALYTICS_EVENTS = Object.freeze({
  CATEGORY_VIEWED: 'category_viewed',
  SEARCH_SUBMITTED: 'search_submitted',
  PRODUCT_VIEWED: 'product_viewed',
  WISHLIST_CHANGED: 'wishlist_changed',
  COMPARE_CHANGED: 'compare_changed',
  COMPARE_VIEWED: 'compare_viewed',
  PURCHASE_LINK_CLICKED: 'purchase_link_clicked',
});

function readInternalUserStatus() {
  try {
    return localStorage.getItem(INTERNAL_USER_KEY) === 'true';
  } catch {
    return false;
  }
}

function processStaffCommand() {
  if (staffCommandProcessed || typeof window === 'undefined') return;
  staffCommandProcessed = true;

  const url = new URL(window.location.href);
  const command = url.searchParams.get('dh_staff');
  if (command !== '1' && command !== '0') return;

  const enabled = command === '1';
  try {
    if (enabled) localStorage.setItem(INTERNAL_USER_KEY, 'true');
    else localStorage.removeItem(INTERNAL_USER_KEY);
    try {
      sessionStorage.setItem(INTERNAL_NOTICE_KEY, enabled ? 'enabled' : 'disabled');
    } catch {
      // 알림 저장 실패는 내부 사용자 표시 자체에 영향을 주지 않는다.
    }
  } catch {
    try {
      sessionStorage.setItem(INTERNAL_NOTICE_KEY, 'failed');
    } catch {
      // 브라우저 저장소가 완전히 차단된 경우 알림도 표시할 수 없다.
    }
  }

  url.searchParams.delete('dh_staff');
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

export function getInternalAnalyticsNotice() {
  try {
    return sessionStorage.getItem(INTERNAL_NOTICE_KEY);
  } catch {
    return null;
  }
}

export function clearInternalAnalyticsNotice() {
  try {
    sessionStorage.removeItem(INTERNAL_NOTICE_KEY);
  } catch {
    // 저장소 접근 실패는 무시한다.
  }
}

export function initAnalytics() {
  processStaffCommand();
  // 로컬 개발·테스트 트래픽은 PostHog로 전송하지 않는다.
  if (!import.meta.env.PROD) return null;
  if (initialization || !projectToken || typeof window === 'undefined') return initialization;

  const isInternalUser = readInternalUserStatus();

  initialization = import('posthog-js').then(({ default: posthog }) => {
    posthog.init(projectToken, {
      api_host: apiHost || 'https://us.i.posthog.com',
      defaults: '2026-05-30',
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: true,
      disable_session_recording: true,
      person_profiles: 'identified_only',
      before_send: (event) => ({
        ...event,
        properties: {
          ...event.properties,
          app_environment: 'production',
          is_internal: isInternalUser,
        },
      }),
    });
    client = posthog;
    pendingEvents.splice(0).forEach(([eventName, properties, options]) => {
      client.capture(eventName, properties, options);
    });
    return client;
  }).catch(() => {
    pendingEvents.length = 0;
    return null;
  });

  return initialization;
}

export function captureEvent(eventName, properties = {}, options) {
  if (client) {
    client.capture(eventName, properties, options);
    return;
  }
  if (initialization) pendingEvents.push([eventName, properties, options]);
}

export function capturePageview(properties = {}) {
  captureEvent('$pageview', {
    $current_url: window.location.href,
    ...properties,
  });
}

export function isAnalyticsEnabled() {
  return Boolean(initialization);
}
