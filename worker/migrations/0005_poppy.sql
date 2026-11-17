-- Personal Agent Protocol (Poppy 1.0) company agent: conversations at /poppy/conversations.
-- No IP addresses. The personal agent's User ID (`sub`) is never stored, only a SHA-256 of
-- client_id + sub, which is enough to check who owns a conversation.

CREATE TABLE poppy_conversations (
  id TEXT PRIMARY KEY,
  ts TEXT NOT NULL,
  client_id TEXT NOT NULL,
  user_hash TEXT NOT NULL,
  sid TEXT,
  agent_id TEXT,
  closed INTEGER NOT NULL DEFAULT 0
);

-- Events in order; `body` is the event as served ({id, type, created_at, ...}).
CREATE TABLE poppy_events (
  seq INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id TEXT NOT NULL,
  id TEXT NOT NULL,
  ts TEXT NOT NULL,
  type TEXT NOT NULL,
  body TEXT NOT NULL
);
CREATE INDEX poppy_events_conversation ON poppy_events (conversation_id, seq);

-- Request ids, unique per user: a replay returns the first answer, a reuse is a conflict.
CREATE TABLE poppy_requests (
  client_id TEXT NOT NULL,
  user_hash TEXT NOT NULL,
  request_id TEXT NOT NULL,
  path TEXT NOT NULL,
  body_hash TEXT NOT NULL,
  conversation_id TEXT NOT NULL,
  status INTEGER NOT NULL,
  PRIMARY KEY (client_id, user_hash, request_id)
);

-- Research log: one row per request to the endpoint, including rejected ones.
-- `client_id` is the claimed issuer and only trustworthy when verified = 1.
CREATE TABLE poppy_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hit TEXT NOT NULL,
  ts TEXT NOT NULL,
  method TEXT,
  path TEXT,
  poppy_version TEXT,
  poppy_extensions TEXT,
  client_id TEXT,
  agent_id TEXT,
  sid TEXT,
  verified INTEGER NOT NULL DEFAULT 0,
  status INTEGER,
  error TEXT,
  error_description TEXT,
  conversation_id TEXT,
  text TEXT,
  body TEXT
);
CREATE INDEX poppy_log_hit ON poppy_log (hit);
