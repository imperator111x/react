import fs from 'node:fs'
import path from 'node:path'
import pg from 'pg'

const { Client } = pg

function loadDotEnv() {
  const envPath = path.join(process.cwd(), '.env')
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim()
    if (key && process.env[key] === undefined) process.env[key] = value
  }
}

loadDotEnv()

const projectRef = 'umynsbrfthlsqzkehqtm'
const password = process.env.SUPABASE_DB_PASSWORD

if (!password) {
  console.error('SUPABASE_DB_PASSWORD fehlt. Setze das Datenbank-Passwort aus Supabase → Settings → Database.')
  process.exit(1)
}

const client = new Client({
  host: `aws-0-eu-central-1.pooler.supabase.com`,
  port: 6543,
  database: 'postgres',
  user: `postgres.${projectRef}`,
  password,
  ssl: { rejectUnauthorized: false },
})

const sqlFiles = [
  'supabase/schema.sql',
  'supabase/migration-v2-guests.sql',
  'supabase/migration-v3-salutation.sql',
  'supabase/migration-v4-gallery.sql',
  'supabase/migration-v5-itinerary.sql',
  'supabase/migration-v6-event-dates.sql',
  'supabase/migration-v7-faq.sql',
  'supabase/migration-v8-invitation-text.sql',
  'supabase/migration-v9-medium-features.sql',
  'supabase/migration-v10-seating.sql',
  'supabase/migration-v11-music-wishlist.sql',
]

try {
  await client.connect()
  console.log('Verbunden mit Supabase PostgreSQL...')

  for (const file of sqlFiles) {
    const filePath = path.join(process.cwd(), file)
    if (!fs.existsSync(filePath)) continue
    console.log(`Führe aus: ${file}`)
    const sql = fs.readFileSync(filePath, 'utf8')
    try {
      await client.query(sql)
      console.log(`✓ ${file}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (file.includes('migration') || message.includes('already exists')) {
        console.log(`⚠ ${file}: ${message}`)
      } else {
        throw error
      }
    }
  }

  console.log('Datenbank-Setup abgeschlossen!')
} catch (error) {
  console.error('Fehler:', error instanceof Error ? error.message : error)
  process.exit(1)
} finally {
  await client.end()
}
