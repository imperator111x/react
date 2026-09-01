-- Migration v2: Gästeliste, persönliche Links, Auto-Löschung
-- Einmalig im Supabase SQL Editor ausführen (wenn schema.sql bereits läuft)

CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  guest_count INTEGER NOT NULL DEFAULT 1 CHECK (guest_count >= 1 AND guest_count <= 10),
  invite_token UUID NOT NULL DEFAULT gen_random_uuid(),
  rsvp_id UUID REFERENCES rsvps(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS guest_id UUID REFERENCES guests(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_guests_invite_token ON guests(invite_token);
CREATE INDEX IF NOT EXISTS idx_guests_wedding_id ON guests(wedding_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_guest_id ON rsvps(guest_id);

ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "guests_select_public" ON guests;
DROP POLICY IF EXISTS "guests_insert_public" ON guests;
DROP POLICY IF EXISTS "guests_update_public" ON guests;
DROP POLICY IF EXISTS "guests_delete_public" ON guests;

CREATE POLICY "guests_select_public" ON guests FOR SELECT USING (true);
CREATE POLICY "guests_insert_public" ON guests FOR INSERT WITH CHECK (true);
CREATE POLICY "guests_update_public" ON guests FOR UPDATE USING (true);
CREATE POLICY "guests_delete_public" ON guests FOR DELETE USING (true);

DROP TRIGGER IF EXISTS guests_updated_at ON guests;
CREATE TRIGGER guests_updated_at
  BEFORE UPDATE ON guests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-Löschung 7 Tage nach Hochzeitsdatum (täglich um 03:00 UTC)
CREATE OR REPLACE FUNCTION delete_expired_weddings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM weddings
  WHERE wedding_date + INTERVAL '7 days' < NOW();
END;
$$;

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'delete-expired-weddings';

SELECT cron.schedule(
  'delete-expired-weddings',
  '0 3 * * *',
  $$SELECT delete_expired_weddings()$$
);
