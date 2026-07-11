import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { parseProductId } from '../../data/productUrl.js';
import {
  ANALYTICS_EVENTS,
  captureEvent,
  capturePageview,
} from '../../lib/analytics.js';

function routeName(pathname) {
  if (pathname === '/') return 'home';
  if (pathname === '/list') return 'product_list';
  if (pathname.startsWith('/category/')) return 'category_list';
  if (pathname.startsWith('/product/')) return 'product_detail';
  if (pathname === '/compare') return 'compare';
  if (pathname === '/wishlist') return 'wishlist';
  if (pathname === '/redirect') return 'purchase_redirect';
  return 'other';
}

export default function AnalyticsTracker() {
  const location = useLocation();
  const previousPageKey = useRef(null);
  const previousSemanticKey = useRef(null);

  useEffect(() => {
    const pageName = routeName(location.pathname);
    const pageKey = `${location.pathname}${location.search}`;
    if (previousPageKey.current !== pageKey) {
      const safeCurrentUrl = location.pathname === '/redirect'
        ? `${window.location.origin}${location.pathname}`
        : window.location.href;
      capturePageview({
        $current_url: safeCurrentUrl,
        page_name: pageName,
        path: location.pathname,
      });
      previousPageKey.current = pageKey;
    }

    const params = new URLSearchParams(location.search);
    const query = params.get('q')?.trim();
    const semanticKey = `${location.pathname}|${query ?? ''}`;

    if (previousSemanticKey.current !== semanticKey) {
      if (location.pathname.startsWith('/category/')) {
        captureEvent(ANALYTICS_EVENTS.CATEGORY_VIEWED, {
          category_slug: decodeURIComponent(location.pathname.slice('/category/'.length)),
        });
      }

      if (query && (location.pathname === '/list' || location.pathname.startsWith('/category/'))) {
        captureEvent(ANALYTICS_EVENTS.SEARCH_SUBMITTED, {
          query,
          category_slug: location.pathname.startsWith('/category/')
            ? decodeURIComponent(location.pathname.slice('/category/'.length))
            : null,
        });
      }

      if (location.pathname.startsWith('/product/')) {
        captureEvent(ANALYTICS_EVENTS.PRODUCT_VIEWED, {
          product_id: parseProductId(location.pathname.slice('/product/'.length)),
        });
      }

      if (location.pathname === '/compare') {
        captureEvent(ANALYTICS_EVENTS.COMPARE_VIEWED);
      }

      previousSemanticKey.current = semanticKey;
    }
  }, [location.pathname, location.search]);

  return null;
}
