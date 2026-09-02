-- Migration v3: Anrede für Gäste
ALTER TABLE guests ADD COLUMN IF NOT EXISTS salutation TEXT NOT NULL DEFAULT 'frau'
  CHECK (salutation IN ('herr', 'frau', 'familie'));
