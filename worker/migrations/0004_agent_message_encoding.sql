-- How the message arrived: one agent sent a gzip-compressed body (2026-10-30), which was unreadable.
ALTER TABLE agent_messages ADD COLUMN content_type TEXT;
ALTER TABLE agent_messages ADD COLUMN content_encoding TEXT;
