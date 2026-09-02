-- Migration v11: Musikwünsche & Wunschliste

CREATE TABLE IF NOT EXISTS music_wishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  song_title TEXT NOT NULL,
  artist TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_music_wishes_wedding_id ON music_wishes(wedding_id);

ALTER TABLE music_wishes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "music_wishes_select_public" ON music_wishes;
DROP POLICY IF EXISTS "music_wishes_insert_public" ON music_wishes;
DROP POLICY IF EXISTS "music_wishes_delete_public" ON music_wishes;

CREATE POLICY "music_wishes_select_public" ON music_wishes FOR SELECT USING (true);
CREATE POLICY "music_wishes_insert_public" ON music_wishes FOR INSERT WITH CHECK (true);
CREATE POLICY "music_wishes_delete_public" ON music_wishes FOR DELETE USING (true);

CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wishlist_wedding_id ON wishlist_items(wedding_id);

ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wishlist_select_public" ON wishlist_items;
DROP POLICY IF EXISTS "wishlist_insert_public" ON wishlist_items;
DROP POLICY IF EXISTS "wishlist_update_public" ON wishlist_items;
DROP POLICY IF EXISTS "wishlist_delete_public" ON wishlist_items;

CREATE POLICY "wishlist_select_public" ON wishlist_items FOR SELECT USING (true);
CREATE POLICY "wishlist_insert_public" ON wishlist_items FOR INSERT WITH CHECK (true);
CREATE POLICY "wishlist_update_public" ON wishlist_items FOR UPDATE USING (true);
CREATE POLICY "wishlist_delete_public" ON wishlist_items FOR DELETE USING (true);
