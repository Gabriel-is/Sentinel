-- Audit log for tool calls
CREATE TABLE sentinel_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  tool_name TEXT NOT NULL,
  input_summary TEXT,
  ip_address TEXT,
  user_agent TEXT,
  response_status TEXT NOT NULL DEFAULT 'success',
  error_message TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user ON sentinel_audit_log (user_id, created_at DESC);
CREATE INDEX idx_audit_log_tool ON sentinel_audit_log (tool_name, created_at DESC);

-- RLS: users can only see their own audit entries
ALTER TABLE sentinel_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_log_user_read ON sentinel_audit_log FOR SELECT USING (auth.uid() = user_id);

-- Rate limiting table (sliding window per identifier+action)
CREATE TABLE sentinel_rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,
  action TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  request_count INTEGER NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX idx_rate_limits_lookup ON sentinel_rate_limits (identifier, action, window_start);

-- Cleanup function for old rate limit entries
CREATE OR REPLACE FUNCTION sentinel_cleanup_rate_limits()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM sentinel_rate_limits WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$;
