import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/auth/AuthShell.jsx';
import { consumeAuthReturnPath, wishlistImportPath } from '../lib/auth.js';
import { useAuth } from '../store/AuthContext.jsx';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [returnPath] = useState(() => consumeAuthReturnPath());
  const {
    user,
    profile,
    loading,
    profileLoading,
    profileError,
    onboardingComplete,
    wishlistImportPending,
  } = useAuth();

  useEffect(() => {
    if (loading || profileLoading || !user || !profile || profileError) return;
    const destination = !onboardingComplete
      ? `/join?next=${encodeURIComponent(returnPath)}`
      : wishlistImportPending
        ? wishlistImportPath(returnPath)
        : returnPath;
    navigate(destination, { replace: true });
  }, [
    loading,
    profileLoading,
    user,
    profile,
    profileError,
    onboardingComplete,
    wishlistImportPending,
    returnPath,
    navigate,
  ]);

  const providerError = new URLSearchParams(window.location.search).get('error_description');
  const failed = !loading && !profileLoading && (!user || !profile || profileError || providerError);

  return (
    <AuthShell title={failed ? '로그인을 완료하지 못했어요' : '로그인 확인 중'} compact>
      {failed ? (
        <>
          <p className="auth-error" role="alert">
            {providerError || profileError?.message || '인증 정보를 확인할 수 없습니다.'}
          </p>
          <Link className="auth-primary-button" to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            다시 로그인하기
          </Link>
        </>
      ) : (
        <p className="auth-status" aria-live="polite">잠시만 기다려주세요…</p>
      )}
    </AuthShell>
  );
}
