import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { submitFeedback } from '../../data/feedbackApi.js';

// 우하단 의견을 주세요 버튼 (제품 후기와는 별개)
// - 버튼 클릭 시 텍스트 입력 패널 토글
// - 상세(/product/*)·비교(/compare)는 하단 CTA/표와 겹쳐 콘텐츠를 가리므로 미노출
export default function SiteFeedbackButton() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const closeTimerRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  // 상세·비교 페이지에서는 숨김 (플로팅 버튼이 표/CTA를 가림)
  if (pathname.startsWith('/product/') || pathname === '/compare') return null;

  const submit = async () => {
    const trimmed = text.trim();
    if (!trimmed || status === 'submitting') return;

    setStatus('submitting');
    setErrorMessage('');

    try {
      await submitFeedback({
        source: 'floating_button',
        category: 'site_feedback',
        message: trimmed,
      });
      setStatus('success');
      setText('');
      closeTimerRef.current = setTimeout(() => {
        setStatus('idle');
        setOpen(false);
      }, 1500);
    } catch (error) {
      console.error('[site feedback]', error);
      setStatus('error');
      setErrorMessage('전송하지 못했어요. 잠시 후 다시 시도해주세요.');
    }
  };

  const toggleOpen = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setOpen((value) => !value);
    if (!open) {
      setStatus('idle');
      setErrorMessage('');
    }
  };

  const updateText = (value) => {
    setText(value);
    if (status === 'error') {
      setStatus('idle');
      setErrorMessage('');
    }
  };

  return (
    <div className="site-feedback">
      {open && (
        <div className="site-feedback-panel" role="dialog" aria-label="의견을 주세요">
          <div className="site-feedback-title">의견을 주세요</div>
          {status === 'success' ? (
            <div className="site-feedback-done">고맙습니다! 의견이 전달되었습니다.</div>
          ) : (
            <>
              <textarea
                className="site-feedback-textarea"
                rows={4}
                maxLength={2000}
                placeholder="다분해 사이트에 대한 의견을 들려주세요."
                value={text}
                onChange={(e) => updateText(e.target.value)}
                disabled={status === 'submitting'}
              />
              <div className="site-feedback-meta">
                <span>접속 페이지와 함께 저장됩니다.</span>
                <span>{text.length}/2000</span>
              </div>
              {status === 'error' && (
                <div className="site-feedback-error" role="status">{errorMessage}</div>
              )}
              <div className="site-feedback-actions">
                <button
                  className="site-feedback-cancel"
                  onClick={() => setOpen(false)}
                  disabled={status === 'submitting'}
                >
                  닫기
                </button>
                <button
                  className="site-feedback-submit"
                  onClick={submit}
                  disabled={!text.trim() || status === 'submitting'}
                >
                  {status === 'submitting' ? '보내는 중' : '보내기'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
      <button
        className="site-feedback-fab"
        onClick={toggleOpen}
        aria-label="의견을 주세요"
      >
        <MessageCircle size={16} aria-hidden />
        <span>의견을 주세요</span>
      </button>
    </div>
  );
}
