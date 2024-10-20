CREATE TABLE conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    status TEXT DEFAULT 'in_progress',
    messages TEXT,
    extractedInfo TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_userId ON conversations(userId);
