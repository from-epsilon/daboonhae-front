import { supabase } from '../lib/supabase.js';

const MAX_MESSAGE_LENGTH = 2000;
const truncate = (value, maxLength) => (
  typeof value === 'string' ? value.slice(0, maxLength) : null
);

export async function submitFeedback({
  source,
  entryPoint = null,
  category = null,
  message,
  email = null,
}) {
  const trimmedMessage = message.trim();
  const trimmedEmail = email?.trim() || null;

  if (!trimmedMessage) {
    throw new Error('의견 내용을 입력해주세요.');
  }

  if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`의견은 ${MAX_MESSAGE_LENGTH}자 이하로 입력해주세요.`);
  }

  const payload = {
    source,
    entry_point: entryPoint,
    category,
    message: trimmedMessage,
    email: trimmedEmail,
    page_path: truncate(window.location.pathname, 500),
    user_agent: truncate(navigator.userAgent, 1000),
  };

  let { error } = await supabase
    .from('feedback_submissions')
    .insert(payload);

  // DB 제약 마이그레이션과 프런트 배포가 잠시 엇갈려도 제출 자체는 보존한다.
  // PostHog에는 컴포넌트가 원래 entryPoint를 그대로 기록한다.
  if (
    error?.code === '23514'
    && entryPoint === 'search_empty_state'
  ) {
    ({ error } = await supabase
      .from('feedback_submissions')
      .insert({ ...payload, entry_point: 'global_fab' }));
  }

  if (error) throw error;
}
