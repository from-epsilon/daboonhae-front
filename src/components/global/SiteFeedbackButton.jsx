import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, MessageCircle, X } from 'lucide-react';
import { submitFeedback } from '../../data/feedbackApi.js';
import { SITE_FEEDBACK_OPEN_EVENT } from '../../data/siteFeedback.js';
import {
  ANALYTICS_EVENTS,
  captureEvent,
} from '../../lib/analytics.js';

const MAX_FEEDBACK_LENGTH = 1000;
const FEEDBACK_TYPES = [
  {
    id: 'data_error',
    label: '정보가 틀려요',
    placeholder: '어떤 정보가 실제 제품과 다른지 알려주세요.',
  },
  {
    id: 'product_request',
    label: '찾는 제품이 없어요',
    placeholder: '추가되었으면 하는 제품명이나 브랜드를 알려주세요.',
  },
  {
    id: 'usability',
    label: '사용하기 불편해요',
    placeholder: '어떤 과정이 불편했는지 알려주세요.',
  },
  {
    id: 'feature_request',
    label: '기능을 제안해요',
    placeholder: '다분해에 있었으면 하는 기능을 알려주세요.',
  },
  {
    id: 'other',
    label: '기타',
    placeholder: '다분해에 전하고 싶은 의견을 자유롭게 적어주세요.',
  },
];

function feedbackPresentation() {
  return window.matchMedia('(max-width: 800px)').matches
    ? 'mobile_bottom_sheet'
    : 'desktop_popover';
}

// 우하단 의견을 주세요 버튼 (제품 리뷰와는 별개)
// - 버튼 클릭 시 텍스트 입력 패널 토글
// - 상세에서는 본문의 오류 제보 버튼으로 패널만 열고 FAB은 숨긴다.
export default function SiteFeedbackButton() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [selectedType, setSelectedType] = useState(null);
  const [entryPoint, setEntryPoint] = useState('global_fab');
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [compact, setCompact] = useState(false);
  const rootRef = useRef(null);
  const textareaRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const updateCompact = () => setCompact(window.scrollY > 80);
    updateCompact();
    window.addEventListener('scroll', updateCompact, { passive: true });
    return () => window.removeEventListener('scroll', updateCompact);
  }, [pathname]);

  const closePanel = useCallback(() => {
    if (status === 'submitting') return;
    setOpen(false);
    setErrorMessage('');
    if (status === 'success') {
      setStatus('idle');
      setSelectedType(null);
    }
  }, [status]);

  useEffect(() => {
    if (!open) return undefined;

    const handleOutsidePointer = (event) => {
      if (!rootRef.current?.contains(event.target)) closePanel();
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closePanel();
    };

    document.addEventListener('pointerdown', handleOutsidePointer);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handleOutsidePointer);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, closePanel]);

  useEffect(() => {
    if (
      !open
      || typeof window === 'undefined'
      || !window.matchMedia('(max-width: 800px)').matches
    ) {
      return undefined;
    }

    const preventBackgroundScroll = (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target?.closest('.site-feedback-panel')) event.preventDefault();
    };

    document.addEventListener('touchmove', preventBackgroundScroll, { passive: false });
    document.addEventListener('wheel', preventBackgroundScroll, { passive: false });
    return () => {
      document.removeEventListener('touchmove', preventBackgroundScroll);
      document.removeEventListener('wheel', preventBackgroundScroll);
    };
  }, [open]);

  useEffect(() => {
    if (open && status !== 'success') {
      textareaRef.current?.focus();
    }
  }, [open, status]);

  useEffect(() => {
    const handleOpenRequest = (event) => {
      const requestedType = event.detail?.type;
      const requestedEntryPoint = event.detail?.entryPoint ?? 'global_fab';
      const requestedInitialText = event.detail?.initialText;
      if (FEEDBACK_TYPES.some((option) => option.id === requestedType)) {
        setSelectedType(requestedType);
      }
      if (typeof requestedInitialText === 'string') {
        setText(requestedInitialText.slice(0, MAX_FEEDBACK_LENGTH));
      }
      setEntryPoint(requestedEntryPoint);
      setStatus('idle');
      setErrorMessage('');
      setOpen(true);
      captureEvent(ANALYTICS_EVENTS.FEEDBACK_OPENED, {
        entry_point: requestedEntryPoint,
        preset_category: requestedType ?? null,
        presentation: feedbackPresentation(),
        page_path: pathname,
      });
    };

    window.addEventListener(SITE_FEEDBACK_OPEN_EVENT, handleOpenRequest);
    return () => window.removeEventListener(SITE_FEEDBACK_OPEN_EVENT, handleOpenRequest);
  }, [pathname]);

  const hideFab = pathname.startsWith('/product/');
  if (hideFab && !open) return null;

  const submit = async () => {
    const trimmed = text.trim();
    if (!trimmed || status === 'submitting') return;

    setStatus('submitting');
    setErrorMessage('');

    try {
      await submitFeedback({
        source: 'floating_button',
        entryPoint,
        category: selectedType ?? 'site_feedback',
        message: trimmed,
      });
      captureEvent(ANALYTICS_EVENTS.FEEDBACK_SUBMITTED, {
        entry_point: entryPoint,
        category: selectedType ?? 'site_feedback',
        message_length: trimmed.length,
        presentation: feedbackPresentation(),
        page_path: pathname,
      });
      setStatus('success');
      setText('');
    } catch (error) {
      console.error('[site feedback]', error);
      setStatus('error');
      setErrorMessage('전송하지 못했어요. 잠시 후 다시 시도해주세요.');
    }
  };

  const toggleOpen = () => {
    if (open) {
      closePanel();
    } else {
      const nextEntryPoint = 'global_fab';
      setEntryPoint(nextEntryPoint);
      setOpen(true);
      setStatus('idle');
      setErrorMessage('');
      captureEvent(ANALYTICS_EVENTS.FEEDBACK_OPENED, {
        entry_point: nextEntryPoint,
        preset_category: selectedType,
        presentation: feedbackPresentation(),
        page_path: pathname,
      });
    }
  };

  const updateText = (value) => {
    setText(value);
    if (status === 'error') {
      setStatus('idle');
      setErrorMessage('');
    }
  };

  const startNewFeedback = () => {
    setStatus('idle');
    setSelectedType(null);
    setText('');
    setErrorMessage('');
  };

  const selectedOption = FEEDBACK_TYPES.find((option) => option.id === selectedType);

  return (
    <div className={`site-feedback${open ? ' is-open' : ''}`} ref={rootRef}>
      {open && (
        <>
          <button
            type="button"
            className="site-feedback-backdrop"
            aria-label="의견창 닫기"
            onClick={closePanel}
            disabled={status === 'submitting'}
          />
          <div
            className="site-feedback-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="site-feedback-title"
          >
            <div className="site-feedback-panel-head">
              <div className="site-feedback-title" id="site-feedback-title">의견을 주세요</div>
              <button
                type="button"
                className="site-feedback-panel-close"
                aria-label="닫기"
                onClick={closePanel}
                disabled={status === 'submitting'}
              >
                <X size={18} aria-hidden />
              </button>
            </div>
            {status === 'success' ? (
              <div className="site-feedback-done" role="status">
                <CheckCircle2 size={28} aria-hidden />
                <strong>의견을 보냈어요</strong>
                <span>보내주신 내용은 서비스 개선에 참고할게요.</span>
                <div className="site-feedback-done-actions">
                  <button type="button" className="site-feedback-cancel" onClick={closePanel}>
                    닫기
                  </button>
                  <button type="button" className="site-feedback-submit" onClick={startNewFeedback}>
                    새 의견 보내기
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="site-feedback-type-label">
                  어떤 의견인가요? <span>(선택)</span>
                </div>
                <div className="site-feedback-types" role="group" aria-label="의견 유형">
                  {FEEDBACK_TYPES.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`site-feedback-type${selectedType === option.id ? ' is-selected' : ''}`}
                      aria-pressed={selectedType === option.id}
                      onClick={() => setSelectedType(
                        selectedType === option.id ? null : option.id,
                      )}
                      disabled={status === 'submitting'}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <textarea
                  ref={textareaRef}
                  className="site-feedback-textarea"
                  rows={4}
                  maxLength={MAX_FEEDBACK_LENGTH}
                  placeholder={selectedOption?.placeholder ?? '다분해에 대한 의견을 자유롭게 들려주세요.'}
                  value={text}
                  onChange={(e) => updateText(e.target.value)}
                  disabled={status === 'submitting'}
                />
                <div className="site-feedback-meta">
                  <span>접속 페이지와 함께 저장됩니다.</span>
                  <span>{text.length}/{MAX_FEEDBACK_LENGTH}</span>
                </div>
                <p className="site-feedback-contact">
                  답변이 필요한 문의는{' '}
                  <Link to="/contact" onClick={closePanel}>문의하기</Link>에서 보내주세요.
                </p>
                {status === 'error' && (
                  <div className="site-feedback-error" role="status">{errorMessage}</div>
                )}
                <div className="site-feedback-actions">
                  <button
                    type="button"
                    className="site-feedback-cancel"
                    onClick={closePanel}
                    disabled={status === 'submitting'}
                  >
                    닫기
                  </button>
                  <button
                    type="button"
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
        </>
      )}
      {!hideFab && (
        <button
          type="button"
          className={`site-feedback-fab${compact ? ' is-compact' : ''}`}
          onClick={toggleOpen}
          aria-label="의견을 주세요"
          title={compact ? '의견을 주세요' : undefined}
        >
          <MessageCircle size={16} aria-hidden />
          <span className="site-feedback-fab-label">의견을 주세요</span>
        </button>
      )}
    </div>
  );
}
