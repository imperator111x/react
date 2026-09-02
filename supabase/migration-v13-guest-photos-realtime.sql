-- Migration v13: Realtime für Gäste-Fotos (Live-Fotowand)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'guest_photos'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE guest_photos;
  END IF;
END $$;
