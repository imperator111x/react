-- Migration v7: FAQ
CREATE TABLE IF NOT EXISTS faq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faq_wedding_id ON faq_items(wedding_id);

ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "faq_select_public" ON faq_items;
DROP POLICY IF EXISTS "faq_insert_public" ON faq_items;
DROP POLICY IF EXISTS "faq_update_public" ON faq_items;
DROP POLICY IF EXISTS "faq_delete_public" ON faq_items;

CREATE POLICY "faq_select_public" ON faq_items FOR SELECT USING (true);
CREATE POLICY "faq_insert_public" ON faq_items FOR INSERT WITH CHECK (true);
CREATE POLICY "faq_update_public" ON faq_items FOR UPDATE USING (true);
CREATE POLICY "faq_delete_public" ON faq_items FOR DELETE USING (true);
