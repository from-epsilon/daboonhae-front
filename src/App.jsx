import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
import { useIsMobile } from './hooks/useMediaQuery.js';
import Header from './components/global/Header.jsx';
import CompareTrayBar from './components/global/CompareTrayBar.jsx';
import SiteFeedbackButton from './components/global/SiteFeedbackButton.jsx';
// 데스크탑 페이지 (기존)
import MainPage from './pages/MainPage.jsx';
import ListPage from './pages/ListPage.jsx';
import DetailPage from './pages/DetailPage.jsx';
import ComparePage from './pages/ComparePage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import FaqPage from './pages/FaqPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import RedirectPage from './pages/RedirectPage.jsx';
// 모바일 페이지 (Round 3에서 생성됨)
import MainPageMobile from './pages/mobile/MainPage.jsx';
import ListPageMobile from './pages/mobile/ListPage.jsx';
import DetailPageMobile from './pages/mobile/DetailPage.jsx';
import ComparePageMobile from './pages/mobile/ComparePage.jsx';

// 데스크탑 셸: 기존 Header + 페이지 + 하단 비교 트레이바 + 우하단 피드백 FAB
function DesktopShell() {
  return (
    <div className="app">
      <ScrollToTop />
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
                  <Route path="/product/:id" element={<DetailPage />} />
                  <Route path="/compare" element={<ComparePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/faq" element={<FaqPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <CompareTrayBar />
              <SiteFeedbackButton />
            </>
          }
        />
      </Routes>
    </div>
  );
}

// 모바일 셸: 페이지가 AppBar 직접 렌더, 셸은 피드백 FAB만 담당
// - 하단 BottomNav 제거 → 네비게이션은 AppBar(검색/비교) + 카테고리 탭 + Back으로 처리
function MobileShell() {
  return (
    <div className="mobile-shell">
      <ScrollToTop />
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
                  <Route path="/product/:id" element={<DetailPageMobile />} />
                  <Route path="/compare" element={<ComparePageMobile />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <SiteFeedbackButton />
            </>
          }
        />
      </Routes>
    </div>
  );
}

// 앱 진입점: viewport에 따라 데스크탑/모바일 셸 분기
export default function App() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileShell /> : <DesktopShell />;
}
