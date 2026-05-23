import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/global/Header.jsx';
import CompareTrayBar from './components/global/CompareTrayBar.jsx';
import SiteFeedbackButton from './components/global/SiteFeedbackButton.jsx';
import MainPage from './pages/MainPage.jsx';
import ListPage from './pages/ListPage.jsx';
import DetailPage from './pages/DetailPage.jsx';
import ComparePage from './pages/ComparePage.jsx';

// 앱 셸
// - 모든 페이지 공통: 상단 Header(목적 토글 포함), 하단 비교함 플로팅 바, 우하단 사이트 피드백 버튼
// - 라우트만 본문으로 교체됨
export default function App() {
  return (
    <div className="app">
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/list" element={<ListPage />} />
          <Route path="/product/:id" element={<DetailPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <CompareTrayBar />
      <SiteFeedbackButton />
    </div>
  );
}
