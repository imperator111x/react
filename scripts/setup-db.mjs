import fs from 'node:fs'
import path from 'node:path'
import pg from 'pg'

const { Client } = pg

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

const schemaPath = path.join(process.cwd(), 'supabase', 'schema.sql')
const sql = fs.readFileSync(schemaPath, 'utf8')

try {
  await client.connect()
  console.log('Verbunden mit Supabase PostgreSQL...')
  await client.query(sql)
  console.log('Schema erfolgreich ausgeführt!')
} catch (error) {
  console.error('Fehler:', error.message)
  process.exit(1)
} finally {
  await client.end()
}
