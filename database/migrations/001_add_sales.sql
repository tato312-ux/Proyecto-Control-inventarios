CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_number VARCHAR(30) NOT NULL UNIQUE,
  customer_name VARCHAR(150),
  customer_document VARCHAR(60),
  note TEXT,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
  subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0)
);

ALTER TABLE inventory_movements
ADD COLUMN IF NOT EXISTS sale_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'inventory_movements_sale_id_fkey'
  ) THEN
    ALTER TABLE inventory_movements
    ADD CONSTRAINT inventory_movements_sale_id_fkey
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE SET NULL;
  END IF;
END $$;
