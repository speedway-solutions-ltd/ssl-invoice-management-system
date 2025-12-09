-- Migration: add per-item discount columns to invoice_item
-- Run this against your Postgres database (adjust schema/table name if needed)

ALTER TABLE IF EXISTS invoice_item
  ADD COLUMN IF NOT EXISTS discount_type VARCHAR(16) DEFAULT 'percent';

ALTER TABLE IF EXISTS invoice_item
  ADD COLUMN IF NOT EXISTS discount_value NUMERIC DEFAULT 0;

-- Optionally set NOT NULL if you want strictness (commented):
-- ALTER TABLE invoice_item ALTER COLUMN discount_type SET NOT NULL;
-- ALTER TABLE invoice_item ALTER COLUMN discount_value SET NOT NULL;

-- End migration
