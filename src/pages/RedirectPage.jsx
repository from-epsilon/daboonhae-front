import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/redirect.css';

// 다분해 텍스트 로고 — 헤더와 동일한 표기('분'만 브랜드 그린)
function DabunhaeLogo() {
  return (
    <div className="redirect-logo">
      <span className="redirect-logo-black">다</span>분<span className="redirect-logo-black">해</span>
      <span className="redirect-logo-dot">.</span>
    </div>
  );
}

export default function RedirectPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(3);
  const [progress, setProgress] = useState(100);
  const [isStopped, setIsStopped] = useState(false);
  const intervalRef = useRef(null);

  const targetUrl = searchParams.get('url');
  const vendorName = searchParams.get('vendor') || '판매처';
  const delaySeconds = parseInt(searchParams.get('delay') ?? '3', 10);

  useEffect(() => {
    if (!targetUrl) return;

    const startTime = Date.now();
    const totalDuration = delaySeconds * 1000;

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, delaySeconds - Math.ceil(elapsed / 1000));
      const progressPercent = Math.max(0, 100 - (elapsed / totalDuration) * 100);

      setTimeLeft(remaining);
      setProgress(progressPercent);

      // 대기 시간 경과 후 자동 이동
      if (elapsed >= totalDuration) {
        clearInterval(intervalRef.current);
        window.location.href = decodeURIComponent(targetUrl);
      }
    }, 100);

    return () => clearInterval(intervalRef.current);
  }, [targetUrl, delaySeconds]);

  // 자동 이동 정지 — 타이머를 멈추고 페이지에 머무름
  const handleStop = () => {
    clearInterval(intervalRef.current);
    setIsStopped(true);
  };

  // 카운트다운을 건너뛰고 즉시 판매처로 이동
  const handleGoNow = () => {
    clearInterval(intervalRef.current);
    window.location.href = decodeURIComponent(targetUrl);
  };

  if (!targetUrl) {
    return (
      <div className="redirect-page">
        <div className="redirect-card">
          <DabunhaeLogo />
          <div className="redirect-error-icon">⚠️</div>
          <h1 className="redirect-title">링크 오류</h1>
          <p className="redirect-message">판매처 링크를 찾을 수 없습니다.</p>
          <div className="redirect-actions">
            <button type="button" className="redirect-btn redirect-btn--ghost" onClick={() => navigate(-1)}>
              이전 페이지
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="redirect-page">
      <div className="redirect-card">
        <DabunhaeLogo />

        {/* 로딩 스피너 — 정지 시 회전 멈춤 */}
        <div className={`redirect-spinner${isStopped ? ' is-stopped' : ''}`} aria-hidden="true" />

        <h1 className="redirect-title">
          {isStopped ? '자동 이동을 멈췄어요' : `${vendorName} 판매 페이지로 이동 중입니다`}
        </h1>
        <p className="redirect-message">
          {isStopped
            ? "'바로 가기'를 누르면 판매 페이지로 이동합니다"
            : '안전하게 연결하고 있어요. 잠시만 기다려주세요'}
        </p>

        {/* 진행률 바 */}
        <div className="redirect-progress-container">
          <div className="redirect-progress-bar" style={{ width: `${progress}%` }} />
        </div>

        {/* 카운트다운 */}
        <div className="redirect-timer">{isStopped ? '정지됨' : `${timeLeft}초`}</div>

        {/* 액션 버튼 — 자동 이동 정지 / 카운트다운 건너뛰고 바로 가기 */}
        <div className="redirect-actions">
          <button
            type="button"
            className="redirect-btn redirect-btn--ghost"
            onClick={handleStop}
            disabled={isStopped}
          >
            {isStopped ? '정지됨' : '이동 정지'}
          </button>
          <button type="button" className="redirect-btn redirect-btn--primary" onClick={handleGoNow}>
            바로 가기
          </button>
        </div>

        {/* 신뢰 안내 문구 */}
        <p className="redirect-hint">
          다분해가 검증한 판매처로 안전하게 연결됩니다
        </p>

        {/* 제휴 수익 및 구매 유의 안내 */}
        <div className="redirect-notice">
          <p className="redirect-notice-title">잠깐! 다분해에서 알려드립니다</p>
          <p className="redirect-notice-lead">
            다분해는 제휴 링크를 통한 구매에 대해 제휴 쇼핑몰로부터 제휴수익을 받습니다.
            구매자에게 추가로 발생하는 비용은 없습니다.
          </p>
          <ul className="redirect-notice-list">
            <li>다분해와 쇼핑몰이 제공하는 상품정보·가격이 일치하지 않을 수 있으니 구매 전 반드시 확인해 주시기 바랍니다.</li>
            <li>배송비 등 추가 요금이나 구매 조건은 쇼핑몰마다 다를 수 있으니 구매 전 반드시 확인해 주시기 바랍니다.</li>
            <li>다분해는 쇼핑몰을 통해 구매한 상품을 보증하거나 별도의 책임을 지지 않으며, 주문·결제·배송·교환·환불 등 상품판매와 관련한 일체의 책임은 해당 쇼핑몰에 있습니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
