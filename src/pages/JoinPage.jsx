import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthShell from '../components/auth/AuthShell.jsx';
import ProfileForm from '../components/auth/ProfileForm.jsx';
import { loginPath, safeReturnPath, wishlistImportPath } from '../lib/auth.js';
import { useAuth } from '../store/AuthContext.jsx';

export default function JoinPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    user,
    profile,
    loading,
    profileLoading,
    profileError,
    onboardingComplete,
    wishlistImportPending,
    saveProfile,
  } = useAuth();
  const [saving, setSaving] = useState(false);
  const returnPath = safeReturnPath(searchParams.get('next'));

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate(loginPath(returnPath), { replace: true });
      return;
    }
    if (!profileLoading && onboardingComplete) {
      navigate(wishlistImportPending ? wishlistImportPath(returnPath) : returnPath, { replace: true });
    }
  }, [
    loading,
    profileLoading,
    user,
    onboardingComplete,
    wishlistImportPending,
    returnPath,
    navigate,
  ]);

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      const savedProfile = await saveProfile(values, { completeOnboarding: true });
      navigate(
        savedProfile.wishlist_import_decided_at ? returnPath : wishlistImportPath(returnPath),
        { replace: true },
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthShell
      title="프로필 설정"
    >
      {profileError ? (
        <p className="auth-error" role="alert">프로필을 불러오지 못했습니다: {profileError.message}</p>
      ) : loading || profileLoading || !profile ? (
        <p className="auth-status">프로필을 준비하고 있어요…</p>
      ) : (
        <ProfileForm
          profile={profile}
          onSubmit={handleSubmit}
          submitLabel="가입 완료"
          saving={saving}
        />
      )}
    </AuthShell>
  );
}
