import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Seo from '../components/global/Seo.jsx';
import { ANALYTICS_EVENTS, captureEvent } from '../lib/analytics.js';
import '../styles/redirect.css';

const DEFAULT_DELAY_SECONDS = 1.5;
const MIN_DELAY_SECONDS = 0.5;
const MAX_DELAY_SECONDS = 5;

// 구매 페이지로 연결을 허용하는 판매처 호스트.
// 판매처명은 쿼리 파라미터를 신뢰하지 않고 검증된 호스트에서 결정한다.
const TRUSTED_VENDOR_HOSTS = [
  { host: 'link.coupang.com', vendorName: '쿠팡' },
  { host: 'oy.run', vendorName: '올리브영' },
  { host: 'wellife.co.kr', vendorName: '대상웰라이프', allowSubdomains: true },
  { host: 'cjthemarket.com', vendorName: 'CJ더마켓', allowSubdomains: true },
];
const LINKPRICE_HOST = 'click.linkprice.com';

function parseSafeHttpsUrl(rawUrl) {
  const url = new URL(rawUrl);
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    (url.port && url.port !== '443')
  ) {
    return null;
  }
  return url;
}

function vendorForHostname(hostname) {
  return TRUSTED_VENDOR_HOSTS.find(({ host, allowSubdomains }) => (
    hostname === host || (allowSubdomains && hostname.endsWith(`.${host}`))
  ));
}

function getTrustedPurchaseTarget(rawUrl) {
  if (!rawUrl) return null;

  try {
    const url = parseSafeHttpsUrl(rawUrl);
    if (!url) return null;

    const hostname = url.hostname.toLowerCase();
    const vendor = vendorForHostname(hostname);
    if (vendor) return { url: url.href, vendorName: vendor.vendorName };

    // CJ더마켓 제휴링크는 LinkPrice를 경유한다. 중계 호스트만 신뢰하지 않고
    // tu 파라미터의 최종 목적지가 기존 허용 판매처인지까지 검증한다.
    if (hostname === LINKPRICE_HOST) {
      const destination = parseSafeHttpsUrl(url.searchParams.get('tu'));
      if (!destination) return null;
      const destinationVendor = vendorForHostname(destination.hostname.toLowerCase());
      return destinationVendor
        ? { url: url.href, vendorName: destinationVendor.vendorName }
        : null;
    }

    return null;
  } catch {
    return null;
  }
}

function getDelaySeconds(rawDelay) {
  const parsed = Number.parseFloat(rawDelay ?? '');
  if (!Number.isFinite(parsed)) return DEFAULT_DELAY_SECONDS;
  return Math.min(MAX_DELAY_SECONDS, Math.max(MIN_DELAY_SECONDS, parsed));
}

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

  const rawTargetUrl = searchParams.get('url');
  const trustedTarget = getTrustedPurchaseTarget(rawTargetUrl);
  const targetUrl = trustedTarget?.url ?? null;
  const vendorName = trustedTarget?.vendorName ?? '판매처';
  const productId = searchParams.get('product');
  // 대기 시간 — 비정상 값은 기본값으로, 정상 값도 안전한 범위로 제한
  const delaySeconds = getDelaySeconds(searchParams.get('delay'));

  const [timeLeft, setTimeLeft] = useState(() => Math.ceil(delaySeconds));
  const [progress, setProgress] = useState(100);
  const [isStopped, setIsStopped] = useState(false);
  const intervalRef = useRef(null);
  const purchaseCapturedRef = useRef(false);

  useEffect(() => {
    if (!targetUrl || purchaseCapturedRef.current) return;
    purchaseCapturedRef.current = true;
    captureEvent(ANALYTICS_EVENTS.PURCHASE_LINK_CLICKED, {
      vendor: vendorName,
      product_id: productId || null,
      source_path: document.referrer.startsWith(window.location.origin)
        ? new URL(document.referrer).pathname
        : null,
    }, { send_instantly: true });
  }, [targetUrl, vendorName, productId]);

  useEffect(() => {
    if (!targetUrl) return;

    const startTime = Date.now();
    const totalDuration = delaySeconds * 1000;

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      // 남은 시간을 올림한 정수 초로 표시 (1.5초 → 2초→1초 카운트다운)
      const remaining = Math.max(0, Math.ceil((totalDuration - elapsed) / 1000));
      const progressPercent = Math.max(0, 100 - (elapsed / totalDuration) * 100);

      setTimeLeft(remaining);
      setProgress(progressPercent);

      // 대기 시간 경과 후 자동 이동
      // replace로 이동해 히스토리에서 리다이렉트 페이지를 교체 →
      // 구매 페이지에서 뒤로가기 시 진입 직전 페이지로 돌아감
      if (elapsed >= totalDuration) {
        clearInterval(intervalRef.current);
        window.location.replace(targetUrl);
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
  // replace로 이동해 뒤로가기 시 리다이렉트 페이지로 돌아오지 않도록 함
  const handleGoNow = () => {
    clearInterval(intervalRef.current);
    if (!targetUrl) return;
    window.location.replace(targetUrl);
  };

  if (!targetUrl) {
    return (
      <div className="redirect-page">
        <Seo title="이동 중" noindex />
        <div className="redirect-card">
          <DabunhaeLogo />
          <div className="redirect-error-icon">⚠️</div>
          <h1 className="redirect-title">링크 오류</h1>
          <p className="redirect-message">
            {rawTargetUrl
              ? '허용되지 않은 판매처 링크입니다.'
              : '판매처 링크를 찾을 수 없습니다.'}
          </p>
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
      <Seo title={`${vendorName} 이동 중`} noindex />
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
