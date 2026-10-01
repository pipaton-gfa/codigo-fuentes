CREATE TABLE IF NOT EXISTS sales_statistics_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  path TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sales_statistics_pages_event_id
  ON sales_statistics_pages(event_id);

INSERT OR IGNORE INTO sales_statistics_pages (event_id, title, description, path)
VALUES (
  3,
  'Compras de idols',
  'Evento 0003 · facturas y códigos QR.',
  '/admin/compras-idols'
);
