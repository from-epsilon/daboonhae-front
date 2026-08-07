import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProfileForm from '../components/auth/ProfileForm.jsx';
import { AppBar } from '../components/ds/AppBar.jsx';
import Seo from '../components/global/Seo.jsx';
import { useIsMobile } from '../hooks/useMediaQuery.js';
import { loginPath } from '../lib/auth.js';
import { useAuth } from '../store/AuthContext.jsx';
import '../components/auth/Auth.css';
import './AccountPage.css';

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const {
    user,
    profile,
    loading,
    profileLoading,
    profileError,
    onboardingComplete,
    saveProfile,
    deleteAccount,
  } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (deleting) return;
    if (loading) return;
    if (!user) {
      navigate(loginPath(`${location.pathname}${location.search}`), { replace: true });
      return;
    }
    if (!profileLoading && !profileError && profile && !onboardingComplete) {
      navigate('/join?next=%2Faccount%2Fprofile', { replace: true });
    }
  }, [deleting, loading, profileLoading, profileError, profile, user, onboardingComplete, location, navigate]);

  const handleSubmit = async (values) => {
    setSaving(true);
    setSaved(false);
    try {
      await saveProfile(values);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteAccount();
      navigate('/', { replace: true });
    } catch (error) {
      setDeleteError(error?.message || '회원 탈퇴를 완료하지 못했습니다. 잠시 후 다시 시도해주세요.');
      setDeleting(false);
    }
  };

  return (
    <>
      <Seo title="프로필 수정" noindex />
      {isMobile && <AppBar onBack={() => navigate('/account')} title="프로필 수정" />}
      <div className="page d-account-edit">
        <header className="d-account-edit-header">
          <h1>프로필 수정</h1>
          <p>닉네임과 선택 정보를 변경할 수 있습니다.</p>
        </header>
        <section className="d-account-edit-body">
          {profileError ? (
            <p className="auth-error" role="alert">프로필을 불러오지 못했습니다: {profileError.message}</p>
          ) : loading || profileLoading || !profile ? (
            <p className="auth-status">프로필을 불러오고 있어요…</p>
          ) : (
            <>
              <ProfileForm
                profile={profile}
                onSubmit={handleSubmit}
                submitLabel={saved ? '저장 완료' : '변경사항 저장'}
                saving={saving}
              />
              <section className="d-account-delete" aria-labelledby="account-delete-title">
                <h2 id="account-delete-title">회원 탈퇴</h2>
                <p>계정과 프로필 정보가 삭제되며 되돌릴 수 없습니다.</p>
                {deleteError && <p className="auth-error" role="alert">{deleteError}</p>}
                {confirmingDelete ? (
                  <div className="d-account-delete-confirm">
                    <strong>정말 탈퇴하시겠어요?</strong>
                    <div>
                      <button type="button" onClick={() => setConfirmingDelete(false)} disabled={deleting}>취소</button>
                      <button type="button" className="is-danger" onClick={handleDeleteAccount} disabled={deleting}>
                        {deleting ? '탈퇴 처리 중…' : '탈퇴하기'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" className="d-account-delete-trigger" onClick={() => setConfirmingDelete(true)}>
                    회원 탈퇴
                  </button>
                )}
              </section>
            </>
          )}
        </section>
      </div>
    </>
  );
}
