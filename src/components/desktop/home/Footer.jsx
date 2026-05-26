import { Link } from 'react-router-dom';
import { Mail, FileText, ShieldCheck, HelpCircle, MessageCircle } from 'lucide-react';

function currentYear() {
  return new Date().getFullYear();
}

export default function Footer() {
  return (
    <footer className="d-home-footer" aria-label="페이지 푸터">
      <div className="d-home-footer-top">
        <div className="d-home-footer-brand">
          <span className="d-home-footer-logo">다분해.</span>
          <p className="d-home-footer-tagline">
            성분으로 비교하는 다이어트 식품 플랫폼
          </p>
        </div>
        <nav className="d-home-footer-nav" aria-label="푸터 메뉴">
          <Link className="d-home-footer-link" to="/about">
            <ShieldCheck size={14} aria-hidden />
            <span>소개</span>
          </Link>
          <Link className="d-home-footer-link" to="/faq">
            <HelpCircle size={14} aria-hidden />
            <span>자주 묻는 질문</span>
          </Link>
          <Link className="d-home-footer-link" to="/contact">
            <MessageCircle size={14} aria-hidden />
            <span>문의하기</span>
          </Link>
        </nav>
      </div>
      <div className="d-home-footer-bottom">
        <span className="d-home-footer-copy">© {currentYear()} 다분해 · BETA</span>
        <span className="d-home-footer-note">
          영양정보는 제조사 공시 자료를 기준으로 하며, 실제 제품과 차이가 있을 수 있습니다.
        </span>
      </div>
    </footer>
  );
}
