ALTER TABLE page_views ADD COLUMN country TEXT;

CREATE INDEX IF NOT EXISTS idx_page_views_country ON page_views(country);