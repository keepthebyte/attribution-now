-- One row per request to /t/* (logged in the worker, before cache). No IP addresses.
CREATE TABLE hits (
  hit TEXT PRIMARY KEY,
  ts TEXT NOT NULL,
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  query TEXT NOT NULL,
  referer TEXT,
  user_agent TEXT,
  sec_fetch_site TEXT,
  sec_fetch_dest TEXT,
  sec_fetch_mode TEXT,
  sec_purpose TEXT,
  country TEXT
);
CREATE INDEX hits_ts ON hits (ts);

-- One row per client beacon from a /t/* page: what only the browser knows.
CREATE TABLE beacons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hit TEXT NOT NULL,
  ts TEXT NOT NULL,
  path TEXT NOT NULL,
  document_referrer TEXT,
  search TEXT,
  hash TEXT
);
CREATE INDEX beacons_hit ON beacons (hit);
