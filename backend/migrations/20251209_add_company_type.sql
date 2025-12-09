-- Migration: add company.type

ALTER TABLE IF EXISTS company
  ADD COLUMN IF NOT EXISTS type VARCHAR(16) DEFAULT 'client';

-- Optionally migrate existing records (set one known company to 'own')
-- UPDATE company SET type='own' WHERE name ILIKE '%speedway%';
