import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
import { useIsMobile } from './hooks/useMediaQuery.js';
// 전역 크롬(항상 노출)은 즉시 로드, 페이지는 라우트별 청크로 분리(lazy)
import Header from './components/global/Header.jsx';
import CompareTrayBar from './components/global/CompareTrayBar.jsx';
import SiteFeedbackButton from './components/global/SiteFeedbackButton.jsx';
import AnalyticsTracker from './components/global/AnalyticsTracker.jsx';
import InternalAnalyticsNotice from './components/global/InternalAnalyticsNotice.jsx';

// 데스크탑 페이지 — 렌더될 때만 청크 로드 (모바일 사용자는 받지 않음)
const MainPage = lazy(() => import('./pages/MainPage.jsx'));
const ListPage = lazy(() => import('./pages/ListPage.jsx'));
const DetailPage = lazy(() => import('./pages/DetailPage.jsx'));
const ComparePage = lazy(() => import('./pages/ComparePage.jsx'));
const WishlistPage = lazy(() => import('./pages/WishlistPage.jsx'));
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'));
const FaqPage = lazy(() => import('./pages/FaqPage.jsx'));
const ContactPage = lazy(() => import('./pages/ContactPage.jsx'));
const TermsPage = lazy(() => import('./pages/TermsPage.jsx'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage.jsx'));
const RedirectPage = lazy(() => import('./pages/RedirectPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));
// 모바일 페이지 — 데스크탑 사용자는 받지 않음
const MainPageMobile = lazy(() => import('./pages/mobile/MainPage.jsx'));
const ListPageMobile = lazy(() => import('./pages/mobile/ListPage.jsx'));
const DetailPageMobile = lazy(() => import('./pages/mobile/DetailPage.jsx'));
const ComparePageMobile = lazy(() => import('./pages/mobile/ComparePage.jsx'));

// 청크 로딩 중 폴백 — 레이아웃 점프 최소화를 위해 최소 높이만 확보
function PageFallback() {
  return <div style={{ minHeight: '60vh' }} aria-busy="true" />;
}

// 데스크탑 셸: 기존 Header + 페이지 + 하단 비교 트레이바 + 우하단 피드백 FAB
function DesktopShell() {
  return (
    <div className="app">
      <ScrollToTop />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/redirect" element={<RedirectPage />} />
          <Route
            path="*"
            element={
              <>
                <Header />
                <main className="app-main">
                  <Routes>
                    <Route path="/" element={<MainPage />} />
                    <Route path="/list" element={<ListPage />} />
                    <Route path="/category/:categorySlug" element={<ListPage />} />
                    <Route path="/product/:id" element={<DetailPage />} />
                    <Route path="/compare" element={<ComparePage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/faq" element={<FaqPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </main>
                <CompareTrayBar />
                <SiteFeedbackButton />
              </>
            }
          />
        </Routes>
      </Suspense>
    </div>
  );
}

// 모바일 셸: 페이지가 AppBar 직접 렌더, 셸은 피드백 FAB만 담당
// - 하단 BottomNav 제거 → 네비게이션은 AppBar(검색/비교) + 카테고리 탭 + Back으로 처리
function MobileShell() {
  return (
    <div className="mobile-shell">
      <ScrollToTop />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/redirect" element={<RedirectPage />} />
          <Route
            path="*"
            element={
              <>
                <main className="mobile-shell-main">
                  <Routes>
                    <Route path="/" element={<MainPageMobile />} />
                    <Route path="/list" element={<ListPageMobile />} />
                    <Route path="/category/:categorySlug" element={<ListPageMobile />} />
                    <Route path="/product/:id" element={<DetailPageMobile />} />
                    <Route path="/compare" element={<ComparePageMobile />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/faq" element={<FaqPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </main>
                <SiteFeedbackButton />
              </>
            }
          />
        </Routes>
      </Suspense>
    </div>
  );
}

// 앱 진입점: viewport에 따라 데스크탑/모바일 셸 분기
export default function App() {
  const isMobile = useIsMobile();
  return (
    <>
      <AnalyticsTracker />
      <InternalAnalyticsNotice />
      {isMobile ? <MobileShell /> : <DesktopShell />}
    </>
  );
}
