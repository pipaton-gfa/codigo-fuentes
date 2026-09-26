CREATE TABLE IF NOT EXISTS event_purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events(id),
  transaction_number TEXT NOT NULL UNIQUE,
  payment_preference_id TEXT NOT NULL UNIQUE,
  payment_id TEXT UNIQUE,
  qr_code TEXT UNIQUE CHECK (qr_code IS NULL OR (length(qr_code) = 12 AND qr_code NOT GLOB '*[^0-9]*')),
  customer_name TEXT NOT NULL,
  customer_rut TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  invoice_data TEXT NOT NULL,
  total_clp INTEGER NOT NULL CHECK (total_clp >= 0),
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'iniciada',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_event_purchases_event_created
  ON event_purchases(event_id, created_at DESC);
