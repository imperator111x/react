-- Migration v5: Ablaufplan (Tagesablauf)
CREATE TABLE IF NOT EXISTS itinerary_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  time_label TEXT NOT NULL,
  title TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'heart',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_itinerary_wedding_id ON itinerary_items(wedding_id);

ALTER TABLE itinerary_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "itinerary_select_public" ON itinerary_items;
DROP POLICY IF EXISTS "itinerary_insert_public" ON itinerary_items;
DROP POLICY IF EXISTS "itinerary_update_public" ON itinerary_items;
DROP POLICY IF EXISTS "itinerary_delete_public" ON itinerary_items;

CREATE POLICY "itinerary_select_public" ON itinerary_items FOR SELECT USING (true);
CREATE POLICY "itinerary_insert_public" ON itinerary_items FOR INSERT WITH CHECK (true);
CREATE POLICY "itinerary_update_public" ON itinerary_items FOR UPDATE USING (true);
CREATE POLICY "itinerary_delete_public" ON itinerary_items FOR DELETE USING (true);
