import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, Heart, LogOut, MessageCircle, Settings, Shuffle, Star } from 'lucide-react';
import Seo from '../components/global/Seo.jsx';
import { AppBar } from '../components/ds/AppBar.jsx';
import { useIsMobile } from '../hooks/useMediaQuery.js';
import { loginPath } from '../lib/auth.js';
import { useAuth } from '../store/AuthContext.jsx';
import { useCompare } from '../store/CompareContext.jsx';
import { useWishlist } from '../store/WishlistContext.jsx';
import { fetchMyProductProfileReviews } from '../data/reviewApi.js';
import '../components/auth/Auth.css';
import './AccountPage.css';

const PROVIDER_LABELS = { google: 'Google', kakao: '카카오' };

export default function AccountPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const wishlist = useWishlist();
  const compare = useCompare();
  const {
    user,
    profile,
    loading,
    profileLoading,
    profileError,
    onboardingComplete,
    signOut,
  } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate(loginPath(`${location.pathname}${location.search}`), { replace: true });
      return;
    }
    if (!profileLoading && !profileError && profile && !onboardingComplete) {
      navigate('/join?next=%2Faccount', { replace: true });
    }
  }, [loading, profileLoading, profileError, profile, user, onboardingComplete, location, navigate]);

  useEffect(() => {
    let active = true;
    if (!user) {
      setReviewCount(0);
      return () => { active = false; };
    }
    fetchMyProductProfileReviews()
      .then((reviews) => {
        if (active) setReviewCount(reviews.length);
      })
      .catch(() => {
        if (active) setReviewCount(0);
      });
    return () => { active = false; };
  }, [user]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      navigate('/', { replace: true });
    } finally {
      setSigningOut(false);
    }
  };

  const provider = PROVIDER_LABELS[user?.app_metadata?.provider] || '소셜';
  const initial = profile?.nickname?.trim()?.slice(0, 1) || '나';

  return (
    <>
      <Seo title="내 정보" noindex />
      {isMobile && <AppBar onBack={() => navigate(-1)} title="내 정보" />}
      <div className="page d-account">
        {profileError ? (
          <p className="auth-error" role="alert">프로필을 불러오지 못했습니다: {profileError.message}</p>
        ) : loading || profileLoading || !profile ? (
          <p className="auth-status">내 정보를 불러오고 있어요…</p>
        ) : (
          <>
            <section className="d-account-profile" aria-labelledby="account-nickname">
              <div className="d-account-avatar" aria-hidden="true">{initial}</div>
              <div className="d-account-identity">
                <h1 id="account-nickname">{profile.nickname}</h1>
                <p>{provider} 로그인 · {user?.email || '이메일 비공개'}</p>
              </div>
              <button
                type="button"
                className="d-account-settings"
                onClick={() => navigate('/account/profile')}
                aria-label="프로필 수정"
                title="프로필 수정"
              >
                <Settings size={22} strokeWidth={1.8} />
              </button>
            </section>

            <section className="d-account-shortcuts" aria-label="저장한 제품">
              <button type="button" onClick={() => navigate('/wishlist')}>
                <Heart size={24} strokeWidth={1.7} />
                <span>찜한 제품</span>
                <strong>{wishlist.count}</strong>
              </button>
              <button type="button" onClick={() => navigate('/compare')}>
                <Shuffle size={24} strokeWidth={1.7} />
                <span>비교함</span>
                <strong>{compare.count}</strong>
              </button>
              <button type="button" onClick={() => navigate('/account/reviews')}>
                <Star size={24} strokeWidth={1.7} />
                <span>내 리뷰</span>
                <strong>{reviewCount}</strong>
              </button>
            </section>

            <section className="d-account-menu" aria-labelledby="account-menu-title">
              <h2 id="account-menu-title">계정</h2>
              <button type="button" onClick={() => navigate('/account/profile')}>
                <Settings size={19} strokeWidth={1.8} />
                <span>프로필 수정</span>
                <ChevronRight size={18} strokeWidth={1.8} />
              </button>
              <button type="button" onClick={() => navigate('/contact')}>
                <MessageCircle size={19} strokeWidth={1.8} />
                <span>문의하기</span>
                <ChevronRight size={18} strokeWidth={1.8} />
              </button>
              <button type="button" onClick={handleSignOut} disabled={signingOut}>
                <LogOut size={19} strokeWidth={1.8} />
                <span>{signingOut ? '로그아웃 중…' : '로그아웃'}</span>
              </button>
            </section>
          </>
        )}
      </div>
    </>
  );
}
