-- Migration v14: Namen der Begleitungen / Familienmitglieder für Tischplan

ALTER TABLE guests
  ADD COLUMN IF NOT EXISTS member_names TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE rsvps
  ADD COLUMN IF NOT EXISTS member_names TEXT[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN guests.member_names IS 'Einzelne Namen von Familie/+1, die am Tisch angezeigt werden';
COMMENT ON COLUMN rsvps.member_names IS 'Beim RSVP angegebene Begleitungs-/Familiarienamen';
