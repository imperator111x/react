-- UnsereHochzeit – Supabase Schema
-- Führe dieses SQL im Supabase SQL Editor aus

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE weddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  partner1_name TEXT NOT NULL,
  partner2_name TEXT NOT NULL,
  wedding_date TIMESTAMPTZ NOT NULL,
  ceremony_location TEXT,
  ceremony_address TEXT,
  reception_location TEXT,
  reception_address TEXT,
  story TEXT,
  dress_code TEXT,
  email TEXT NOT NULL,
  dashboard_token UUID NOT NULL DEFAULT gen_random_uuid(),
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('accepted', 'declined', 'pending')),
  guest_count INTEGER NOT NULL DEFAULT 1 CHECK (guest_count >= 1 AND guest_count <= 10),
  dietary_notes TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_weddings_slug ON weddings(slug);
CREATE INDEX idx_weddings_dashboard_token ON weddings(dashboard_token);
CREATE INDEX idx_rsvps_wedding_id ON rsvps(wedding_id);

ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

-- Öffentlich: Hochzeit lesen
CREATE POLICY "weddings_select_public" ON weddings
  FOR SELECT USING (true);

-- Öffentlich: Hochzeit erstellen
CREATE POLICY "weddings_insert_public" ON weddings
  FOR INSERT WITH CHECK (true);

-- Öffentlich: Hochzeit aktualisieren (Dashboard-Zugriff über Token auf Client-Seite)
CREATE POLICY "weddings_update_public" ON weddings
  FOR UPDATE USING (true);

-- Öffentlich: RSVPs lesen und erstellen
CREATE POLICY "rsvps_select_public" ON rsvps
  FOR SELECT USING (true);

CREATE POLICY "rsvps_insert_public" ON rsvps
  FOR INSERT WITH CHECK (true);

CREATE POLICY "rsvps_update_public" ON rsvps
  FOR UPDATE USING (true);

-- Automatisches updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER weddings_updated_at
  BEFORE UPDATE ON weddings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER rsvps_updated_at
  BEFORE UPDATE ON rsvps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
