ALTER TABLE event_purchases ADD COLUMN purchase_id TEXT;

UPDATE event_purchases
SET purchase_id = printf('%04d%d', event_id, id)
WHERE purchase_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_event_purchases_purchase_id
  ON event_purchases(purchase_id);
