import { useEffect, useState } from 'react';
import {
  clearInternalAnalyticsNotice,
  getInternalAnalyticsNotice,
} from '../../lib/analytics.js';

const NOTICE_COPY = {
  enabled: '이 브라우저를 내부 테스트 기기로 등록했습니다.',
  disabled: '이 브라우저의 내부 테스트 등록을 해제했습니다.',
  failed: '내부 테스트 기기 등록에 실패했습니다. 브라우저 저장소 설정을 확인해주세요.',
};

export default function InternalAnalyticsNotice() {
  const [notice, setNotice] = useState(() => getInternalAnalyticsNotice());

  useEffect(() => {
    if (!notice) return undefined;
    clearInternalAnalyticsNotice();
    const timer = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  if (!notice) return null;

  return (
    <div
      className={`internal-analytics-notice${notice === 'failed' ? ' is-error' : ''}`}
      role="status"
    >
      {NOTICE_COPY[notice]}
    </div>
  );
}
