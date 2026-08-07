import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthShell from '../components/auth/AuthShell.jsx';
import { loginPath, safeReturnPath } from '../lib/auth.js';
import { useAuth } from '../store/AuthContext.jsx';
import { useWishlist } from '../store/WishlistContext.jsx';

export default function WishlistImportPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    user,
    profile,
    loading,
    profileLoading,
    wishlistImportPending,
  } = useAuth();
  const { guestIds, completeGuestImport } = useWishlist();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const emptyImportStarted = useRef(false);
  const returnPath = safeReturnPath(searchParams.get('next'));

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate(loginPath(returnPath), { replace: true });
      return;
    }
    if (!profileLoading && profile && !wishlistImportPending) {
      navigate(returnPath, { replace: true });
    }
  }, [
    loading,
    profileLoading,
    user,
    profile,
    wishlistImportPending,
    returnPath,
    navigate,
  ]);

  useEffect(() => {
    if (
      loading
      || profileLoading
      || !user
      || !profile
      || !wishlistImportPending
      || guestIds.length > 0
      || emptyImportStarted.current
    ) return;

    emptyImportStarted.current = true;
    completeGuestImport({ importItems: false })
      .then(() => navigate(returnPath, { replace: true }))
      .catch((completeError) => {
        emptyImportStarted.current = false;
        setError(completeError?.message || '찜함 설정을 완료하지 못했습니다.');
      });
  }, [
    loading,
    profileLoading,
    user,
    profile,
    wishlistImportPending,
    guestIds.length,
    completeGuestImport,
    returnPath,
    navigate,
  ]);

  const finish = async (importItems) => {
    setSaving(true);
    setError('');
    try {
      await completeGuestImport({ importItems });
      navigate(returnPath, { replace: true });
    } catch (completeError) {
      setError(completeError?.message || '찜함을 가져오지 못했습니다.');
      setSaving(false);
    }
  };

  const preparing = loading || profileLoading || !user || !profile || guestIds.length === 0;

  return (
    <AuthShell
      title="찜한 제품 가져오기"
      description={preparing ? undefined : `이 브라우저에 저장된 찜 ${guestIds.length}개를 계정으로 가져올까요?`}
      compact
    >
      {preparing ? (
        <p className="auth-status" aria-live="polite">찜함을 확인하고 있어요…</p>
      ) : (
        <div className="auth-wishlist-import-actions">
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button
            type="button"
            className="auth-primary-button"
            disabled={saving}
            onClick={() => finish(true)}
          >
            {saving ? '가져오는 중…' : '가져오기'}
          </button>
          <button
            type="button"
            className="auth-secondary-button"
            disabled={saving}
            onClick={() => finish(false)}
          >
            가져오지 않기
          </button>
        </div>
      )}
    </AuthShell>
  );
}
