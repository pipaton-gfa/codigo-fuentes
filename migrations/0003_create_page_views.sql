CREATE TABLE IF NOT EXISTS page_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  path TEXT NOT NULL,
  viewed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON page_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path);
