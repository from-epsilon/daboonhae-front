import { Link } from 'react-router-dom';
import Seo from '../components/global/Seo.jsx';

// 존재하지 않는 경로 — 홈 리다이렉트 대신 noindex 404 화면을 렌더해
// 잘못된 URL이 홈 콘텐츠로 200 색인되는 소프트 404를 방지한다.
export default function NotFoundPage() {
  return (
    <div
      className="page"
      style={{
        minHeight: '50vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        textAlign: 'center',
        padding: '48px 16px',
      }}
    >
      <Seo title="페이지를 찾을 수 없습니다" noindex />
      <p style={{ fontSize: 48, fontWeight: 700, lineHeight: 1, color: 'var(--gray-300, #cbd5e1)' }}>404</p>
      <p style={{ fontSize: 16, color: 'var(--gray-700, #374151)' }}>
        요청하신 페이지를 찾을 수 없어요.
      </p>
      <Link
        to="/"
        style={{
          color: 'var(--brand-green, #16a34a)',
          fontWeight: 600,
          textDecoration: 'underline',
        }}
      >
        메인으로 가기
      </Link>
    </div>
  );
}
