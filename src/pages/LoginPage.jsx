import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthShell from '../components/auth/AuthShell.jsx';
import { useAuth } from '../store/AuthContext.jsx';
import { safeReturnPath, wishlistImportPath } from '../lib/auth.js';

function KakaoIcon() {
  return (
    <svg className="auth-provider-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 3C6.48 3 2 6.5 2 10.82c0 2.78 1.85 5.22 4.63 6.61l-.95 3.48c-.08.3.26.54.52.36l4.17-2.78c.53.07 1.08.11 1.63.11 5.52 0 10-3.5 10-7.78S17.52 3 12 3Z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg className="auth-provider-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.36l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.39 13.93A6.02 6.02 0 0 1 6.07 12c0-.67.11-1.32.32-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.55l3.35-2.62Z" />
      <path fill="#EA4335" d="M12 5.94c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z" />
    </svg>
  );
}

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    user,
    profile,
    onboardingComplete,
    wishlistImportPending,
    loading,
    profileLoading,
    signInWithProvider,
  } = useAuth();
  const [pendingProvider, setPendingProvider] = useState('');
  const [error, setError] = useState('');
  const returnPath = safeReturnPath(searchParams.get('next'));

  useEffect(() => {
    if (loading || profileLoading || !user || !profile) return;
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
    onboardingComplete,
    wishlistImportPending,
    returnPath,
    navigate,
  ]);

  const handleLogin = async (provider) => {
    setPendingProvider(provider);
    setError('');
    try {
      await signInWithProvider(provider, returnPath);
    } catch (loginError) {
      setPendingProvider('');
      setError(loginError?.message || '로그인을 시작하지 못했습니다.');
    }
  };

  return (
    <AuthShell
      title="간편 로그인"
      description="카카오나 구글 계정으로 바로 시작할 수 있어요. 처음 한 번만 간단한 프로필을 설정합니다."
      compact
    >
      <div className="auth-provider-list">
        <button
          type="button"
          className="auth-provider-button auth-provider-button--kakao"
          disabled={Boolean(pendingProvider)}
          onClick={() => handleLogin('kakao')}
        >
          <KakaoIcon />
          {pendingProvider === 'kakao' ? '카카오로 이동 중…' : '카카오로 계속하기'}
        </button>
        <button
          type="button"
          className="auth-provider-button auth-provider-button--google"
          disabled={Boolean(pendingProvider)}
          onClick={() => handleLogin('google')}
        >
          <GoogleIcon />
          {pendingProvider === 'google' ? '구글로 이동 중…' : '구글로 계속하기'}
        </button>
      </div>
      {error && <p className="auth-error" role="alert">{error}</p>}
      <p className="auth-legal-copy">
        계속하면 다분해의 <Link to="/terms">이용약관</Link>에 동의하며{' '}
        <Link to="/privacy">개인정보 처리방침</Link>을 확인할 수 있습니다.
      </p>
    </AuthShell>
  );
}
