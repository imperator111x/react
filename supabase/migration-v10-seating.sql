-- Migration v10: Tischplan
CREATE TABLE IF NOT EXISTS seating_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seating_tables_wedding_id ON seating_tables(wedding_id);

ALTER TABLE guests ADD COLUMN IF NOT EXISTS table_id UUID REFERENCES seating_tables(id) ON DELETE SET NULL;

ALTER TABLE seating_tables ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "seating_select_public" ON seating_tables;
DROP POLICY IF EXISTS "seating_insert_public" ON seating_tables;
DROP POLICY IF EXISTS "seating_update_public" ON seating_tables;
DROP POLICY IF EXISTS "seating_delete_public" ON seating_tables;

CREATE POLICY "seating_select_public" ON seating_tables FOR SELECT USING (true);
CREATE POLICY "seating_insert_public" ON seating_tables FOR INSERT WITH CHECK (true);
CREATE POLICY "seating_update_public" ON seating_tables FOR UPDATE USING (true);
CREATE POLICY "seating_delete_public" ON seating_tables FOR DELETE USING (true);
