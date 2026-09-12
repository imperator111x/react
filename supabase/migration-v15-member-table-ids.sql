-- Migration v15: Einzelne Tischzuweisung für Begleitungen / Familienmitglieder

ALTER TABLE guests
  ADD COLUMN IF NOT EXISTS member_table_ids TEXT[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN guests.member_table_ids IS
  'Tisch-IDs parallel zu member_names; leerer String = kein Tisch, fehlend/null = erbt table_id des Hauptgasts';
