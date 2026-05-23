import { useState } from 'react';
import { MessageCircle } from 'lucide-react';

// 우하단 사이트 피드백 버튼 (제품 후기와는 별개)
// - 버튼 클릭 시 텍스트 입력 패널 토글
// - 제출 동작은 추후 백엔드 연동 (현재는 콘솔 로깅으로 자리만 잡아둠)
export default function SiteFeedbackButton() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    // TODO: 추후 백엔드/Form 서비스 연동
    console.log('[site feedback]', trimmed);
    setSubmitted(true);
    setText('');
    setTimeout(() => {
      setSubmitted(false);
      setOpen(false);
    }, 1500);
  };

  return (
    <div className="site-feedback">
      {open && (
        <div className="site-feedback-panel" role="dialog" aria-label="사이트 피드백">
          <div className="site-feedback-title">사이트 피드백</div>
          {submitted ? (
            <div className="site-feedback-done">고맙습니다! 의견이 전달되었습니다.</div>
          ) : (
            <>
              <textarea
                className="site-feedback-textarea"
                rows={4}
                placeholder="다분해 사이트에 대한 의견을 들려주세요."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <div className="site-feedback-actions">
                <button className="site-feedback-cancel" onClick={() => setOpen(false)}>닫기</button>
                <button className="site-feedback-submit" onClick={submit} disabled={!text.trim()}>
                  보내기
                </button>
              </div>
            </>
          )}
        </div>
      )}
      <button
        className="site-feedback-fab"
        onClick={() => setOpen((v) => !v)}
        aria-label="사이트 피드백"
      >
        <MessageCircle size={16} aria-hidden />
        <span>사이트 피드백</span>
      </button>
    </div>
  );
}
