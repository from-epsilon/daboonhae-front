// 데스크탑 메인 — 페이지 하단 푸터
// - 신뢰 요소 (회사 정보 · 약관 · 문의)
// - 메인페이지 전용으로 두기 위해 home 폴더에 둠
//   (전역 footer가 필요해지면 global/ 로 이전 가능)
// - 현재는 placeholder 링크 (#) — 실제 페이지가 생기면 to/href 교체
import { Mail, FileText, ShieldCheck } from 'lucide-react';

// 현재 연도 — 빌드 시점 고정이 아닌 런타임으로 매년 자동 갱신
function currentYear() {
  return new Date().getFullYear();
}

export default function Footer() {
  return (
    <footer className="d-home-footer" aria-label="페이지 푸터">
      <div className="d-home-footer-top">
        <div className="d-home-footer-brand">
          <span className="d-home-footer-logo">다분해</span>
          <p className="d-home-footer-tagline">
            성분으로 비교하는 다이어트 식품 플랫폼
          </p>
        </div>
        <nav className="d-home-footer-nav" aria-label="푸터 메뉴">
          <a className="d-home-footer-link" href="#about">
            <ShieldCheck size={14} aria-hidden />
            <span>서비스 소개</span>
          </a>
          <a className="d-home-footer-link" href="#terms">
            <FileText size={14} aria-hidden />
            <span>이용약관</span>
          </a>
          <a className="d-home-footer-link" href="#privacy">
            <FileText size={14} aria-hidden />
            <span>개인정보처리방침</span>
          </a>
          <a className="d-home-footer-link" href="mailto:hello@daboonhae.example">
            <Mail size={14} aria-hidden />
            <span>문의</span>
          </a>
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
