import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { supabase } from '../lib/supabase.js';
import { rememberAuthReturnPath, safeReturnPath } from '../lib/auth.js';

const AuthContext = createContext(null);
const PROFILE_FIELDS =
  'user_id,nickname,gender,birth_year,onboarding_completed_at,wishlist_import_decided_at,created_at,updated_at';

function normalizeProfileInput({ nickname, gender, birthYear }) {
  const normalizedNickname = String(nickname || '').trim();
  if (normalizedNickname.length < 2 || normalizedNickname.length > 20) {
    throw new Error('닉네임은 2자 이상 20자 이하로 입력해주세요.');
  }

  const normalizedGender = gender === 'female' || gender === 'male' ? gender : null;
  const parsedBirthYear = birthYear === '' || birthYear == null
    ? null
    : Number(birthYear);
  const currentYear = new Date().getFullYear();
  if (
    parsedBirthYear !== null
    && (!Number.isInteger(parsedBirthYear) || parsedBirthYear < 1900 || parsedBirthYear > currentYear)
  ) {
    throw new Error('출생연도를 다시 확인해주세요.');
  }

  return {
    nickname: normalizedNickname,
    gender: normalizedGender,
    birth_year: parsedBirthYear,
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const user = session?.user ?? null;
  const userId = user?.id ?? null;

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setProfileError(error);
      setSession(data.session ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) setSession(nextSession ?? null);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setProfileError(null);
      setProfileLoading(false);
      return null;
    }

    setProfileLoading(true);
    setProfileError(null);
    const { data, error } = await supabase
      .from('user_profiles')
      .select(PROFILE_FIELDS)
      .eq('user_id', userId)
      .single();

    if (error) {
      setProfile(null);
      setProfileError(error);
      setProfileLoading(false);
      return null;
    }

    setProfile(data);
    setProfileLoading(false);
    return data;
  }, [userId]);

  useEffect(() => {
    let active = true;

    if (!userId) {
      setProfile(null);
      setProfileError(null);
      setProfileLoading(false);
      return () => { active = false; };
    }

    setProfileLoading(true);
    setProfileError(null);
    supabase
      .from('user_profiles')
      .select(PROFILE_FIELDS)
      .eq('user_id', userId)
      .single()
      .then(({ data, error }) => {
        if (!active) return;
        setProfile(error ? null : data);
        setProfileError(error ?? null);
        setProfileLoading(false);
      });

    return () => { active = false; };
  }, [userId]);

  const signInWithProvider = useCallback(async (provider, returnPath = '/') => {
    if (provider !== 'google' && provider !== 'kakao') {
      throw new Error('지원하지 않는 로그인 방식입니다.');
    }

    rememberAuthReturnPath(safeReturnPath(returnPath));
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
    return data;
  }, []);

  const saveProfile = useCallback(async (values, { completeOnboarding = false } = {}) => {
    if (!userId) throw new Error('로그인이 필요합니다.');

    const payload = normalizeProfileInput(values);
    if (completeOnboarding) payload.onboarding_completed_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('user_profiles')
      .update(payload)
      .eq('user_id', userId)
      .select(PROFILE_FIELDS)
      .single();
    if (error) throw error;

    setProfile(data);
    setProfileError(null);
    return data;
  }, [userId]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) throw error;
  }, []);

  const deleteAccount = useCallback(async () => {
    if (!userId) throw new Error('로그인이 필요합니다.');

    const { error } = await supabase.functions.invoke('delete-account');
    if (error) throw error;

    await supabase.auth.signOut({ scope: 'local' });
    setSession(null);
    setProfile(null);
    setProfileError(null);
  }, [userId]);

  const value = useMemo(() => ({
    session: session ?? null,
    user,
    profile,
    loading: session === undefined,
    profileLoading,
    profileError,
    onboardingComplete: Boolean(profile?.onboarding_completed_at),
    wishlistImportPending: Boolean(profile && !profile.wishlist_import_decided_at),
    signInWithProvider,
    saveProfile,
    refreshProfile,
    signOut,
    deleteAccount,
  }), [
    session,
    user,
    profile,
    profileLoading,
    profileError,
    signInWithProvider,
    saveProfile,
    refreshProfile,
    signOut,
    deleteAccount,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth는 AuthProvider 안에서만 사용 가능합니다.');
  return value;
}
