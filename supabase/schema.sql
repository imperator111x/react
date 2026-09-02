-- UnsereHochzeit – Supabase Schema
-- Führe dieses SQL im Supabase SQL Editor aus

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE weddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  partner1_name TEXT NOT NULL,
  partner2_name TEXT NOT NULL,
  wedding_date TIMESTAMPTZ NOT NULL,
  ceremony_date TIMESTAMPTZ,
  reception_date TIMESTAMPTZ,
  ceremony_location TEXT,
  ceremony_address TEXT,
  reception_location TEXT,
  reception_address TEXT,
  story TEXT,
  dress_code TEXT,
  invitation_text TEXT,
  travel_info TEXT,
  theme_id TEXT DEFAULT 'gold',
  email TEXT NOT NULL,
  dashboard_token UUID NOT NULL DEFAULT gen_random_uuid(),
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  salutation TEXT NOT NULL DEFAULT 'frau' CHECK (salutation IN ('herr', 'frau', 'familie')),
  email TEXT,
  guest_count INTEGER NOT NULL DEFAULT 1 CHECK (guest_count >= 1 AND guest_count <= 10),
  max_guest_count INTEGER,
  invite_token UUID NOT NULL DEFAULT gen_random_uuid(),
  rsvp_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('accepted', 'declined', 'pending')),
  guest_count INTEGER NOT NULL DEFAULT 1 CHECK (guest_count >= 1 AND guest_count <= 10),
  dietary_notes TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE guests
  ADD CONSTRAINT guests_rsvp_id_fkey
  FOREIGN KEY (rsvp_id) REFERENCES rsvps(id) ON DELETE SET NULL;

CREATE INDEX idx_weddings_slug ON weddings(slug);
CREATE INDEX idx_weddings_dashboard_token ON weddings(dashboard_token);
CREATE INDEX idx_weddings_wedding_date ON weddings(wedding_date);
CREATE INDEX idx_guests_wedding_id ON guests(wedding_id);
CREATE UNIQUE INDEX idx_guests_invite_token ON guests(invite_token);
CREATE INDEX idx_rsvps_wedding_id ON rsvps(wedding_id);
CREATE INDEX idx_rsvps_guest_id ON rsvps(guest_id);

CREATE TABLE guestbook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  message TEXT NOT NULL,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_guestbook_wedding_id ON guestbook_entries(wedding_id);

ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE guestbook_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "weddings_select_public" ON weddings FOR SELECT USING (true);
CREATE POLICY "weddings_insert_public" ON weddings FOR INSERT WITH CHECK (true);
CREATE POLICY "weddings_update_public" ON weddings FOR UPDATE USING (true);
CREATE POLICY "weddings_delete_public" ON weddings FOR DELETE USING (true);

CREATE POLICY "guests_select_public" ON guests FOR SELECT USING (true);
CREATE POLICY "guests_insert_public" ON guests FOR INSERT WITH CHECK (true);
CREATE POLICY "guests_update_public" ON guests FOR UPDATE USING (true);
CREATE POLICY "guests_delete_public" ON guests FOR DELETE USING (true);

CREATE POLICY "rsvps_select_public" ON rsvps FOR SELECT USING (true);
CREATE POLICY "rsvps_insert_public" ON rsvps FOR INSERT WITH CHECK (true);
CREATE POLICY "rsvps_update_public" ON rsvps FOR UPDATE USING (true);

CREATE POLICY "guestbook_select_public" ON guestbook_entries FOR SELECT USING (true);
CREATE POLICY "guestbook_insert_public" ON guestbook_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "guestbook_update_public" ON guestbook_entries FOR UPDATE USING (true);
CREATE POLICY "guestbook_delete_public" ON guestbook_entries FOR DELETE USING (true);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER weddings_updated_at
  BEFORE UPDATE ON weddings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER guests_updated_at
  BEFORE UPDATE ON guests FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER rsvps_updated_at
  BEFORE UPDATE ON rsvps FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-Löschung 7 Tage nach Hochzeitsdatum
CREATE OR REPLACE FUNCTION delete_expired_weddings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM weddings
  WHERE GREATEST(
    wedding_date,
    COALESCE(ceremony_date, wedding_date),
    COALESCE(reception_date, wedding_date)
  ) + INTERVAL '7 days' < NOW();
END;
$$;

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

SELECT cron.schedule(
  'delete-expired-weddings',
  '0 3 * * *',
  $$SELECT delete_expired_weddings()$$
);
