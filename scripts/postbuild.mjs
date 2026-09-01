import { copyFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

// GitHub Pages SPA fallback: unbekannte Pfade liefern index.html aus
if (process.env.GITHUB_PAGES === 'true') {
  const dist = join(process.cwd(), 'dist')
  const index = join(dist, 'index.html')
  const fallback = join(dist, '404.html')

  if (existsSync(index)) {
    copyFileSync(index, fallback)
    console.log('404.html für GitHub Pages SPA-Routing erstellt')
  }
}
