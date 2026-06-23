import { supabase } from '../lib/supabase.js';

const MAX_MESSAGE_LENGTH = 2000;
const truncate = (value, maxLength) => (
  typeof value === 'string' ? value.slice(0, maxLength) : null
);

export async function submitFeedback({
  source,
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

  const { error } = await supabase
    .from('feedback_submissions')
    .insert({
      source,
      category,
      message: trimmedMessage,
      email: trimmedEmail,
      page_path: truncate(window.location.pathname, 500),
      user_agent: truncate(navigator.userAgent, 1000),
    });

  if (error) throw error;
}
