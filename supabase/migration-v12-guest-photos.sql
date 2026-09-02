-- Migration v12: Gäste-Fotos (Upload-Seite per QR)

CREATE TABLE IF NOT EXISTS guest_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  caption TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guest_photos_wedding_id ON guest_photos(wedding_id);
CREATE INDEX IF NOT EXISTS idx_guest_photos_approved ON guest_photos(wedding_id, is_approved);

ALTER TABLE guest_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "guest_photos_select_public" ON guest_photos;
DROP POLICY IF EXISTS "guest_photos_insert_public" ON guest_photos;
DROP POLICY IF EXISTS "guest_photos_update_public" ON guest_photos;
DROP POLICY IF EXISTS "guest_photos_delete_public" ON guest_photos;

CREATE POLICY "guest_photos_select_public" ON guest_photos FOR SELECT USING (true);
CREATE POLICY "guest_photos_insert_public" ON guest_photos FOR INSERT WITH CHECK (true);
CREATE POLICY "guest_photos_update_public" ON guest_photos FOR UPDATE USING (true);
CREATE POLICY "guest_photos_delete_public" ON guest_photos FOR DELETE USING (true);
