-- Create companies table and add invoice references
CREATE TABLE IF NOT EXISTS company (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(64),
  email VARCHAR(128),
  website VARCHAR(255)
);

ALTER TABLE IF EXISTS invoice
  ADD COLUMN IF NOT EXISTS billing_from_id INTEGER REFERENCES company(id);

ALTER TABLE IF EXISTS invoice
  ADD COLUMN IF NOT EXISTS billing_to_id INTEGER REFERENCES company(id);

ALTER TABLE IF EXISTS invoice
  ADD COLUMN IF NOT EXISTS status VARCHAR(32) DEFAULT 'draft';

-- end
