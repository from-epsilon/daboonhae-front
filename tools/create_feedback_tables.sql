-- ============================================================
-- 다분해 문의/피드백 접수 테이블 (Supabase SQL Editor에서 실행)
-- ============================================================

CREATE TABLE IF NOT EXISTS feedback_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL CHECK (source IN ('floating_button', 'contact_page')),
  category TEXT CHECK (category IS NULL OR char_length(category) <= 50),
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 2000),
  email TEXT CHECK (email IS NULL OR char_length(email) <= 320),
  page_path TEXT CHECK (page_path IS NULL OR char_length(page_path) <= 500),
  user_agent TEXT CHECK (user_agent IS NULL OR char_length(user_agent) <= 1000),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'done', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_submissions_created
  ON feedback_submissions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_feedback_submissions_status
  ON feedback_submissions(status, created_at DESC);

ALTER TABLE feedback_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit feedback" ON feedback_submissions;
CREATE POLICY "Anyone can submit feedback"
  ON feedback_submissions
  FOR INSERT
  TO anon
  WITH CHECK (
    source IN ('floating_button', 'contact_page')
    AND char_length(message) BETWEEN 1 AND 2000
    AND status = 'new'
  );

GRANT INSERT ON feedback_submissions TO anon;
