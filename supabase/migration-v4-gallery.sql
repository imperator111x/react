-- Migration v4: Galerie mit Supabase Storage
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_wedding_id ON gallery_images(wedding_id);

ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gallery_select_public" ON gallery_images;
DROP POLICY IF EXISTS "gallery_insert_public" ON gallery_images;
DROP POLICY IF EXISTS "gallery_delete_public" ON gallery_images;

CREATE POLICY "gallery_select_public" ON gallery_images FOR SELECT USING (true);
CREATE POLICY "gallery_insert_public" ON gallery_images FOR INSERT WITH CHECK (true);
CREATE POLICY "gallery_delete_public" ON gallery_images FOR DELETE USING (true);

-- Storage Bucket (im Supabase Dashboard unter Storage prüfen)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wedding-gallery',
  'wedding-gallery',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "gallery_storage_select" ON storage.objects;
DROP POLICY IF EXISTS "gallery_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "gallery_storage_delete" ON storage.objects;

CREATE POLICY "gallery_storage_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'wedding-gallery');

CREATE POLICY "gallery_storage_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'wedding-gallery');

CREATE POLICY "gallery_storage_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'wedding-gallery');
