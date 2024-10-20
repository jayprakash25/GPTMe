CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  google_id TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT NOT NULL,
  picture TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Index for faster lookups
CREATE INDEX idx_google_id ON users(google_id);