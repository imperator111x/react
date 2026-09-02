-- Einladungstext unter der persönlichen Anrede (optional)
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS invitation_text TEXT;
