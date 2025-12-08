-- Sample invoice seed (values from uploaded PDF page 1). Citation: fileciteturn0file0
CREATE TABLE IF NOT EXISTS invoice (
  id SERIAL PRIMARY KEY,
  invoice_number VARCHAR(50),
  date DATE,
  bill_to TEXT,
  subtotal NUMERIC,
  tax NUMERIC,
  other NUMERIC,
  total NUMERIC,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS invoice_item (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER REFERENCES invoice(id) ON DELETE CASCADE,
  item_code VARCHAR(100),
  description TEXT,
  qty INTEGER,
  unit_price NUMERIC,
  total NUMERIC
);

INSERT INTO invoice(invoice_number, date, bill_to, subtotal, tax, other, total, notes)
VALUES ('11', '2025-12-03', 'Shah Md. Rashidul Islam, QKA\u00ae, M.M. Complex, 6th Floor, Pallabi, Mirpur, Dhaka-1216', 1585.00, NULL, NULL, 1585.00, 'KnowBe4 Security Awareness Training Subscription Silver');

INSERT INTO invoice_item(invoice_id, item_code, description, qty, unit_price, total)
VALUES (1, 'KMSATSN-A36', 'KnowBe4 Security Awareness Training Subscription Silver', 25, 63.40, 1585.00);
