-- Gäste-Fotos ohne manuelle Freigabe: Default sichtbar, bestehende freigeben
ALTER TABLE guest_photos
  ALTER COLUMN is_approved SET DEFAULT true;

UPDATE guest_photos
SET is_approved = true
WHERE is_approved = false;
