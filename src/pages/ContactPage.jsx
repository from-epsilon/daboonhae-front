import { useState } from 'react';
import { Send } from 'lucide-react';
import Seo from '../components/global/Seo.jsx';
import './ContactPage.css';

export default function ContactPage() {
  const [form, setForm] = useState({ type: 'general', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="page d-contact">
        <div className="d-contact-done">
          <div className="d-contact-done-icon">
            <Send size={32} />
          </div>
          <h2 className="d-contact-done-title">문의가 접수되었습니다</h2>
          <p className="d-contact-done-sub">빠른 시일 내에 이메일로 답변 드리겠습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page d-contact">
      <Seo
        title="문의하기"
        description="제품 추가 요청, 데이터 오류 제보, 서비스 피드백을 보내주세요."
        canonicalPath="/contact"
      />
      <header className="d-contact-header">
        <h1 className="d-contact-title">문의하기</h1>
        <p className="d-contact-sub">
          제품 추가 요청, 데이터 오류 제보, 서비스 피드백 등 무엇이든 보내주세요.
        </p>
      </header>

      <form className="d-contact-form" onSubmit={handleSubmit}>
        <div className="d-contact-field">
          <label className="d-contact-label">문의 유형</label>
          <div className="d-contact-type-options">
            {[
              { id: 'general', label: '일반 문의' },
              { id: 'product', label: '제품 추가 요청' },
              { id: 'error', label: '데이터 오류 제보' },
              { id: 'feedback', label: '서비스 피드백' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`d-contact-type-btn${form.type === opt.id ? ' is-active' : ''}`}
                onClick={() => update('type', opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="d-contact-field">
          <label className="d-contact-label" htmlFor="contact-email">이메일 (선택)</label>
          <input
            id="contact-email"
            type="email"
            className="d-contact-input"
            placeholder="답변 받으실 이메일"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
          />
        </div>

        <div className="d-contact-field">
          <label className="d-contact-label" htmlFor="contact-message">내용</label>
          <textarea
            id="contact-message"
            className="d-contact-textarea"
            placeholder="문의 내용을 입력해주세요"
            value={form.message}
            onChange={(e) => update('message', e.target.value)}
            required
          />
        </div>

        <button type="submit" className="d-contact-submit" disabled={!form.message.trim()}>
          보내기
        </button>
      </form>
    </div>
  );
}
