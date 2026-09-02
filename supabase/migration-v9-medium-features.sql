-- Migration v9: Plus-One, Anreise, Design, Gästebuch
ALTER TABLE guests ADD COLUMN IF NOT EXISTS max_guest_count INTEGER;
UPDATE guests SET max_guest_count = guest_count WHERE max_guest_count IS NULL;

ALTER TABLE weddings ADD COLUMN IF NOT EXISTS travel_info TEXT;
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS theme_id TEXT DEFAULT 'gold';

CREATE TABLE IF NOT EXISTS guestbook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  message TEXT NOT NULL,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guestbook_wedding_id ON guestbook_entries(wedding_id);

ALTER TABLE guestbook_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "guestbook_select_public" ON guestbook_entries;
DROP POLICY IF EXISTS "guestbook_insert_public" ON guestbook_entries;
DROP POLICY IF EXISTS "guestbook_update_public" ON guestbook_entries;
DROP POLICY IF EXISTS "guestbook_delete_public" ON guestbook_entries;

CREATE POLICY "guestbook_select_public" ON guestbook_entries FOR SELECT USING (true);
CREATE POLICY "guestbook_insert_public" ON guestbook_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "guestbook_update_public" ON guestbook_entries FOR UPDATE USING (true);
CREATE POLICY "guestbook_delete_public" ON guestbook_entries FOR DELETE USING (true);
