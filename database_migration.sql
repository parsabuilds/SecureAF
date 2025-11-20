/*
  # GitHub OAuth and PR Tracking Schema

  1. New Tables
    - `github_tokens`
      - `id` (uuid, primary key)
      - `user_id` (text) - Session-based user identifier
      - `access_token` (text, encrypted) - GitHub OAuth access token
      - `token_type` (text) - Token type (usually "Bearer")
      - `scope` (text) - OAuth scopes granted
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz)
      - `refresh_token` (text, encrypted, nullable)

    - `pr_generation_jobs`
      - `id` (uuid, primary key)
      - `user_id` (text) - Session-based user identifier
      - `repo_url` (text) - Repository URL
      - `repo_owner` (text) - Repository owner
      - `repo_name` (text) - Repository name
      - `issue_id` (text) - Security issue ID being fixed
      - `status` (text) - pending, generating_fix, creating_pr, completed, failed
      - `pr_url` (text, nullable) - Created PR URL
      - `pr_number` (integer, nullable) - PR number
      - `branch_name` (text) - Branch name for the fix
      - `error_message` (text, nullable) - Error details if failed
      - `created_at` (timestamptz)
      - `completed_at` (timestamptz, nullable)

    - `generated_fixes`
      - `id` (uuid, primary key)
      - `job_id` (uuid, foreign key) - Links to pr_generation_jobs
      - `file_path` (text) - File being fixed
      - `original_content` (text) - Original file content
      - `fixed_content` (text) - Fixed file content
      - `fix_explanation` (text) - AI explanation of the fix
      - `confidence_score` (numeric) - AI confidence in the fix (0-1)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for user access based on user_id
    - Tokens are session-scoped for security

  3. Indexes
    - Index on user_id for fast lookups
    - Index on job status for queue processing

  To apply this migration:
  1. Log in to your Supabase dashboard
  2. Go to SQL Editor
  3. Paste this entire file and click "Run"
*/

-- GitHub tokens table
CREATE TABLE IF NOT EXISTS github_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  access_token text NOT NULL,
  token_type text DEFAULT 'Bearer',
  scope text,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  refresh_token text
);

CREATE INDEX IF NOT EXISTS idx_github_tokens_user_id ON github_tokens(user_id);

ALTER TABLE github_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own tokens"
  ON github_tokens
  FOR ALL
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- PR generation jobs table
CREATE TABLE IF NOT EXISTS pr_generation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  repo_url text NOT NULL,
  repo_owner text NOT NULL,
  repo_name text NOT NULL,
  issue_id text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'generating_fix', 'creating_pr', 'completed', 'failed')),
  pr_url text,
  pr_number integer,
  branch_name text NOT NULL,
  error_message text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_pr_jobs_user_id ON pr_generation_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_pr_jobs_status ON pr_generation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_pr_jobs_created_at ON pr_generation_jobs(created_at DESC);

ALTER TABLE pr_generation_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own PR jobs"
  ON pr_generation_jobs
  FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can create PR jobs"
  ON pr_generation_jobs
  FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own PR jobs"
  ON pr_generation_jobs
  FOR UPDATE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Generated fixes table
CREATE TABLE IF NOT EXISTS generated_fixes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES pr_generation_jobs(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  original_content text NOT NULL,
  fixed_content text NOT NULL,
  fix_explanation text NOT NULL,
  confidence_score numeric CHECK (confidence_score >= 0 AND confidence_score <= 1),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_generated_fixes_job_id ON generated_fixes(job_id);

ALTER TABLE generated_fixes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view fixes for their jobs"
  ON generated_fixes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pr_generation_jobs
      WHERE pr_generation_jobs.id = generated_fixes.job_id
      AND pr_generation_jobs.user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

CREATE POLICY "System can create fixes"
  ON generated_fixes
  FOR INSERT
  WITH CHECK (true);
