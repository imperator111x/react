-- Migration v6: Separate Termine für Trauung und Feier
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS ceremony_date TIMESTAMPTZ;
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS reception_date TIMESTAMPTZ;

UPDATE weddings
SET ceremony_date = wedding_date
WHERE ceremony_date IS NULL;

CREATE INDEX IF NOT EXISTS idx_weddings_ceremony_date ON weddings(ceremony_date);
CREATE INDEX IF NOT EXISTS idx_weddings_reception_date ON weddings(reception_date);

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
