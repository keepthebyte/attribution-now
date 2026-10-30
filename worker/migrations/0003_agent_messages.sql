-- Messages sent to the agent door (POST /, A2A message/send). Linked to hits by `hit`.
-- No IP addresses. `body` keeps the raw request (clipped) for shapes we don't parse yet.
CREATE TABLE agent_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hit TEXT NOT NULL,
  ts TEXT NOT NULL,
  rpc_method TEXT,
  message_id TEXT,
  context_id TEXT,
  text TEXT,
  metadata TEXT,
  body TEXT
);
CREATE INDEX agent_messages_hit ON agent_messages (hit);
