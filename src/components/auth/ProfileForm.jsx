import { useEffect, useMemo, useState } from 'react';

const GENDER_OPTIONS = [
  { value: 'female', label: '여성' },
  { value: 'male', label: '남성' },
];

export default function ProfileForm({
  profile,
  onSubmit,
  submitLabel,
  saving = false,
  footer,
  onDirtyChange,
}) {
  const [nickname, setNickname] = useState(() => profile?.nickname || '');
  const [gender, setGender] = useState(() => profile?.gender || '');
  const [birthYear, setBirthYear] = useState(() => (
    profile?.birth_year == null ? '' : String(profile.birth_year)
  ));
  const [error, setError] = useState('');
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - 1899 }, (_, index) => currentYear - index);
  }, []);

  useEffect(() => {
    if (!profile) return;
    setNickname(profile.nickname || '');
    setGender(profile.gender || '');
    setBirthYear(profile.birth_year == null ? '' : String(profile.birth_year));
  }, [profile]);

  useEffect(() => {
    if (!profile || !onDirtyChange) return;
    const dirty = nickname !== (profile.nickname || '')
      || gender !== (profile.gender || '')
      || birthYear !== (profile.birth_year == null ? '' : String(profile.birth_year));
    onDirtyChange(dirty);
  }, [profile, nickname, gender, birthYear, onDirtyChange]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await onSubmit({ nickname, gender, birthYear });
    } catch (submitError) {
      setError(submitError?.message || '저장하지 못했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <label className="auth-field">
        <span className="auth-field-label">
          닉네임 <span className="auth-required" aria-hidden="true">*</span>
        </span>
        <input
          type="text"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          minLength={2}
          maxLength={20}
          autoComplete="nickname"
          required
        />
      </label>

      <fieldset className="auth-field auth-fieldset">
        <legend className="auth-field-label">성별 <span>선택</span></legend>
        <div className="auth-choice-row">
          {GENDER_OPTIONS.map((option) => (
            <label key={option.value} className={`auth-choice${gender === option.value ? ' is-selected' : ''}`}>
              <input
                type="radio"
                name="gender"
                value={option.value}
                checked={gender === option.value}
                onChange={(event) => setGender(event.target.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="auth-field">
        <span className="auth-field-label">출생연도 <span>선택</span></span>
        <select value={birthYear} onChange={(event) => setBirthYear(event.target.value)}>
          <option value="" disabled hidden>선택</option>
          {years.map((year) => <option key={year} value={year}>{year}년</option>)}
        </select>
      </label>

      <p className="auth-optional-note">
        성별과 출생연도는 이용자 통계와 서비스 개선에만 사용하며 계정 삭제 시까지 보관합니다.
        응답하지 않아도 가입과 서비스 이용에 제한이 없습니다.
      </p>

      {error && <p className="auth-error" role="alert">{error}</p>}
      <button type="submit" className="auth-primary-button" disabled={saving}>
        {saving ? '저장 중…' : submitLabel}
      </button>
      {footer}
    </form>
  );
}
