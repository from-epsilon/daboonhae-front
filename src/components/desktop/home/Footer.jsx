import { Link } from 'react-router-dom';
import { Mail, HelpCircle, MessageCircle, FileText, ShieldCheck } from 'lucide-react';

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
          <Link className="d-home-footer-link" to="/terms">
            <FileText size={14} aria-hidden />
            <span>이용약관</span>
          </Link>
          <Link className="d-home-footer-link" to="/privacy">
            <ShieldCheck size={14} aria-hidden />
            <span>개인정보 처리방침</span>
          </Link>
        </nav>
      </div>

      <div className="d-home-footer-legal">
        <p className="d-home-footer-disclaimer">
          본 서비스의 정보는 제품 라벨, 제조사 공개 자료 및 공공 데이터를 바탕으로 제공되며, 의료적 조언이나 진단을 대체하지 않습니다. 제품 구매 및 섭취 전 실제 제품 표시사항을 반드시 확인해주세요.
        </p>
        <p className="d-home-footer-affiliate">
          일부 링크는 제휴 링크일 수 있으며, 이를 통해 발생한 수익은 서비스 운영에 사용됩니다.
        </p>
      </div>

      <div className="d-home-footer-bottom">
        <span className="d-home-footer-copy">© 2026 다분해. All rights reserved.</span>
        <a className="d-home-footer-email" href="mailto:kodactle@gmail.com">
          <Mail size={13} aria-hidden />
          <span>문의 kodactle@gmail.com</span>
        </a>
      </div>
    </footer>
  );
}
