ALTER TABLE event_purchases ADD COLUMN email_status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE event_purchases ADD COLUMN email_attempted_at TEXT;
ALTER TABLE event_purchases ADD COLUMN email_sent_at TEXT;
ALTER TABLE event_purchases ADD COLUMN email_error TEXT;

CREATE INDEX IF NOT EXISTS idx_event_purchases_email_status
  ON event_purchases(email_status, email_attempted_at);
