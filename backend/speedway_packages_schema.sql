-- -- Safe idempotent script: create schema, ensure tables/columns, add constraints, then seed.
-- -- Run as the DB user your app uses.

-- -- 0) Ensure schema exists and use it
-- CREATE SCHEMA IF NOT EXISTS speedway_packages;
-- SET search_path TO speedway_packages, public;

-- -- 1) plan_type (create if missing)
-- CREATE TABLE IF NOT EXISTS plan_type (
--   id SERIAL PRIMARY KEY,
--   code TEXT NOT NULL UNIQUE,
--   name TEXT NOT NULL
-- );

-- -- 2) experience_tier (create if missing)
-- CREATE TABLE IF NOT EXISTS experience_tier (
--   id SERIAL PRIMARY KEY,
--   code TEXT NOT NULL UNIQUE,
--   label TEXT NOT NULL,
--   notes TEXT
-- );

-- -- 3) resource_price: create the table with all expected columns if it doesn't exist.
-- -- If it exists, we'll add any missing columns after this block.
-- CREATE TABLE IF NOT EXISTS resource_price (
--   id SERIAL PRIMARY KEY,
--   plan_type_id INTEGER,
--   experience_tier_id INTEGER,
--   one_time_setup NUMERIC(12,2) DEFAULT 2000.00,
--   speedway_annual_fee NUMERIC(12,2),
--   industry_average TEXT
-- );

-- 3a) If resource_price existed but lacked columns, add them (safe: IF NOT EXISTS)
ALTER TABLE resource_price
  ADD COLUMN IF NOT EXISTS plan_type_id INTEGER,
  ADD COLUMN IF NOT EXISTS experience_tier_id INTEGER,
  ADD COLUMN IF NOT EXISTS one_time_setup NUMERIC(12,2) DEFAULT 2000.00,
  ADD COLUMN IF NOT EXISTS speedway_annual_fee NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS industry_average TEXT;

-- 3b) Add UNIQUE constraint for (plan_type_id, experience_tier_id) if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE c.contype = 'u'
      AND t.relname = 'resource_price'
      AND c.conkey IS NOT NULL
      AND pg_get_constraintdef(c.oid) LIKE '%(plan_type_id, experience_tier_id)%'
  ) THEN
    BEGIN
      ALTER TABLE resource_price
        ADD CONSTRAINT resource_price_plan_experience_key UNIQUE (plan_type_id, experience_tier_id);
    EXCEPTION WHEN duplicate_object THEN
      -- guard race condition
      RAISE NOTICE 'unique constraint already exists (race)';
    END;
  END IF;
END$$;

-- 3c) Add foreign key constraints only if columns exist and constraint not present
DO $$
BEGIN
  -- plan_type_id FK
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'speedway_packages' AND table_name = 'resource_price' AND column_name = 'plan_type_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE c.conname = 'resource_price_plan_type_id_fkey'
      AND t.relname = 'resource_price'
  ) THEN
    BEGIN
      ALTER TABLE resource_price
        ADD CONSTRAINT resource_price_plan_type_id_fkey
        FOREIGN KEY (plan_type_id) REFERENCES plan_type(id) ON DELETE CASCADE;
    EXCEPTION WHEN undefined_column THEN
      RAISE NOTICE 'column plan_type_id not present to add FK (race/ordering)';
    END;
  END IF;

  -- experience_tier_id FK
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'speedway_packages' AND table_name = 'resource_price' AND column_name = 'experience_tier_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE c.conname = 'resource_price_experience_tier_id_fkey'
      AND t.relname = 'resource_price'
  ) THEN
    BEGIN
      ALTER TABLE resource_price
        ADD CONSTRAINT resource_price_experience_tier_id_fkey
        FOREIGN KEY (experience_tier_id) REFERENCES experience_tier(id) ON DELETE CASCADE;
    EXCEPTION WHEN undefined_column THEN
      RAISE NOTICE 'column experience_tier_id not present to add FK (race/ordering)';
    END;
  END IF;
END$$;

-- -- 4) project_service (create if missing)
-- CREATE TABLE IF NOT EXISTS project_service (
--   id SERIAL PRIMARY KEY,
--   code TEXT UNIQUE,
--   title TEXT NOT NULL,
--   description TEXT,
--   turnaround_min_days INTEGER,
--   turnaround_max_days INTEGER,
--   speedway_billing_min NUMERIC(12,2),
--   speedway_billing_max NUMERIC(12,2),
--   industry_average TEXT
-- );

-- -- 5) actuarial_package (create if missing)
-- CREATE TABLE IF NOT EXISTS actuarial_package (
--   id SERIAL PRIMARY KEY,
--   code TEXT UNIQUE,
--   title TEXT NOT NULL,
--   description TEXT,
--   turnaround_min_days INTEGER,
--   turnaround_max_days INTEGER,
--   speedway_fee NUMERIC(12,2)
-- );

-- 6) Seed plan_type rows (idempotent)
INSERT INTO plan_type (code, name)
VALUES
  ('DC', 'Defined Contribution (DC) Plans'),
  ('DB', 'Defined Benefit (DB) Plans'),
  ('COMBO', 'DB-CB / Combo Plans')
ON CONFLICT (code) DO NOTHING;

-- 7) Seed experience_tier rows (idempotent)
INSERT INTO experience_tier (code, label)
VALUES
  ('below_2yrs', 'Below 2 Years'),
  ('2_plus', '2+ Years'),
  ('5_plus', '5+ Years'),
  ('5_plus_qka', '5+ Years + QKA'),
  ('10_plus_qka', '10+ Years + QKA'),
  ('15_plus_qkc', '15+ Years + QKC')
ON CONFLICT (code) DO NOTHING;

-- 8) Seed resource_price for DC (uses unique constraint to support ON CONFLICT)
WITH p AS (SELECT id FROM plan_type WHERE code='DC'),
     t AS (SELECT id, code FROM experience_tier)
INSERT INTO resource_price (plan_type_id, experience_tier_id, one_time_setup, speedway_annual_fee, industry_average)
SELECT p.id, t.id, 2000.00,
  CASE t.code
    WHEN 'below_2yrs' THEN 28000.00
    WHEN '2_plus' THEN 30000.00
    WHEN '5_plus' THEN 36000.00
    WHEN '5_plus_qka' THEN 40000.00
    WHEN '10_plus_qka' THEN 45000.00
    WHEN '15_plus_qkc' THEN 50000.00
    ELSE 0 END,
  CASE t.code
    WHEN 'below_2yrs' THEN '$32,000+'
    WHEN '2_plus' THEN '$35,000+'
    WHEN '5_plus' THEN '$40,000+'
    WHEN '5_plus_qka' THEN '$45,000+'
    WHEN '10_plus_qka' THEN '$55,000+'
    WHEN '15_plus_qkc' THEN '$65,000+'
    ELSE NULL END
FROM t, p
ON CONFLICT (plan_type_id, experience_tier_id) DO NOTHING;

-- 9) Seed resource_price for DB
WITH p AS (SELECT id FROM plan_type WHERE code='DB'),
     t AS (SELECT id, code FROM experience_tier)
INSERT INTO resource_price (plan_type_id, experience_tier_id, one_time_setup, speedway_annual_fee, industry_average)
SELECT p.id, t.id, 2000.00,
  CASE t.code
    WHEN 'below_2yrs' THEN 32000.00
    WHEN '2_plus' THEN 35000.00
    WHEN '5_plus' THEN 40000.00
    WHEN '5_plus_qka' THEN 45000.00
    WHEN '10_plus_qka' THEN 50000.00
    WHEN '15_plus_qkc' THEN 55000.00
    ELSE 0 END,
  CASE t.code
    WHEN 'below_2yrs' THEN '$40,000+'
    WHEN '2_plus' THEN '$45,000+'
    WHEN '5_plus' THEN '$50,000+'
    WHEN '5_plus_qka' THEN '$55,000+'
    WHEN '10_plus_qka' THEN '$65,000+'
    WHEN '15_plus_qkc' THEN '$75,000+'
    ELSE NULL END
FROM t, p
ON CONFLICT (plan_type_id, experience_tier_id) DO NOTHING;

-- 10) Seed resource_price for COMBO
WITH p AS (SELECT id FROM plan_type WHERE code='COMBO'),
     t AS (SELECT id, code FROM experience_tier)
INSERT INTO resource_price (plan_type_id, experience_tier_id, one_time_setup, speedway_annual_fee, industry_average)
SELECT p.id, t.id, 2000.00,
  CASE t.code
    WHEN 'below_2yrs' THEN 32000.00
    WHEN '2_plus' THEN 35000.00
    WHEN '5_plus' THEN 40000.00
    WHEN '5_plus_qka' THEN 45000.00
    WHEN '10_plus_qka' THEN 50000.00
    WHEN '15_plus_qkc' THEN 55000.00
    ELSE 0 END,
  NULL
FROM t, p
ON CONFLICT (plan_type_id, experience_tier_id) DO NOTHING;

-- 11) Seed project_service (idempotent using ON CONFLICT on code)
INSERT INTO project_service
(code, title, description, turnaround_min_days, turnaround_max_days, speedway_billing_min, speedway_billing_max, industry_average)
VALUES
  ('VALUATION_5500_SF', 'Full Plan Valuation (including Form 5500-SF, 8955-SSA)', '', 1, 5, 350, 350, '$500 - 1,500'),
  ('CENSUS_SCRUB', 'Census Scrubbing and Contribution Reconciliation', '', 1, 2, 150, 150, '$200 - 500'),
  ('TRUST_RECON', 'Trust Reconciliation', '', 1, 2, 150, 150, '$300 - 700'),
  ('CONTRIB_SCENARIOS', 'Contribution Scenario Preparation (Cross-tested)', '', 1, 1, 150, 150, '$250 - 500'),
  ('COMPLIANCE_TEST', 'Compliance Testing', '', 1, 1, 150, 150, '$300 - 1,000'),
  ('FORM_5500_SF', 'Form 5500-SF Preparation', '', 1, 1, 75, 75, '$250 - 600'),
  ('AUDIT_5500', 'Audit Form 5500 with Schedules H and C', '', 1, 1, 120, 120, '$250 - 800'),
  ('PAYROLL_PROC', 'Payroll Contribution Processing', '', 1, 1, 50, 50, '$100 - 300'),
  ('PARTICIPANT_DIST', 'Participant Distributions', '', 1, 1, 30, 30, '$50 - 150'),
  ('LOAN_ADMIN', 'Loan Administration', '', 1, 1, 40, 40, '$100 - 200'),
  ('RMD', 'Required Minimum Distributions (RMDs)', '', 1, 1, 25, 25, '$50 - 150'),
  ('PLAN_DOCS', 'Plan Documents Preparation', '', 1, 1, 400, 400, '$1,000 - 2,500'),
  ('PLAN_AMEND', 'Plan Amendments', '', 1, 1, 300, 300, '$500 - 1,500'),
  ('FORM_5330', 'Form 5330 / Lost Earnings Calculations', '', 1, 1, 100, 100, '$250 - 500'),
  ('ANNUAL_NOTICES', 'Annual Participant Notices', '', 1, 1, 20, 20, '$50 - 100')
ON CONFLICT (code) DO NOTHING;

-- 12) Seed actuarial_package (idempotent)
INSERT INTO actuarial_package
(code, title, description, turnaround_min_days, turnaround_max_days, speedway_fee)
VALUES
  ('ACT_OWNER_ONLY', 'Owner Only Bundle - Full Process, Review & Sign', '', 1, 5, 400),
  ('ACT_WITH_PART', 'With Participants - Full Process, Review & Sign', '', 1, 5, 500),
  ('ACT_STANDALONE', 'Standalone DB/CB Plans - Full Process, Review & Sign', '', 1, 5, 600),
  ('ACT_PBGC', 'PBGC Covered - Full Process, Review & Sign', '', 1, 5, 600)
ON CONFLICT (code) DO NOTHING;

-- Done
