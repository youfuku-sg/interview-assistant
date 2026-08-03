-- Create app_launches table
CREATE TABLE IF NOT EXISTS app_launches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    launched_at INTEGER NOT NULL DEFAULT (unixepoch())
);
