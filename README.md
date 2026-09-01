# UnsereHochzeit – Digitale Hochzeitseinladungen

Eine kostenlose Hochzeitseinladungs-Website mit React und Supabase. Erstellt elegante digitale Einladungen, auf denen Gäste online zu- und absagen können – ähnlich wie [mi-boda.com](https://mi-boda.com/).

## Features

- **Kostenlos** – Kein Abo, keine versteckten Kosten
- **Digitale Einladung** – Personalisierte Seite mit Namen, Datum, Locations und Liebesgeschichte
- **RSVP** – Gäste können zu- oder absagen, Begleitpersonen angeben und Nachrichten hinterlassen
- **Countdown** – Live-Countdown bis zum großen Tag
- **Dashboard** – Übersicht aller Zusagen und Absagen für das Brautpaar
- **Demo-Modus** – `/e/demo` zeigt eine Beispiel-Einladung ohne Supabase

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **Datenbank:** Supabase (PostgreSQL)
- **Hosting:** GitHub Pages

## Schnellstart

### 1. Repository klonen

```bash
git clone https://github.com/DEIN-USER/react.git
cd react
npm install
```

### 2. Supabase einrichten

1. Erstelle ein kostenloses Projekt auf [supabase.com](https://supabase.com)
2. Öffne den **SQL Editor** und führe `supabase/schema.sql` aus
3. Kopiere **Project URL** und **anon public key** aus den API-Einstellungen

### 3. Umgebungsvariablen

```bash
cp .env.example .env
```

Trage in `.env` ein:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

### 4. Entwicklungsserver starten

```bash
npm run dev
```

Öffne [http://localhost:5173](http://localhost:5173)

## GitHub Pages Deployment

### Repository-Einstellungen (einmalig)

1. Gehe zu **Settings → Pages**
2. Unter **Build and deployment** → **Source**: **Deploy from a branch**
3. Branch: **`gh-pages`** · Folder: **`/ (root)`**
4. Speichern – nach dem nächsten Push auf `main` wird automatisch deployed

Die Supabase-Keys sind im Workflow hinterlegt (öffentliche anon-Keys, kein Secret nötig).

Die Live-URL ist: `https://DEIN-USER.github.io/react/`

## Seiten & Routen

| Route | Beschreibung |
|-------|-------------|
| `/` | Landing Page |
| `/erstellen` | Hochzeit erstellen |
| `/e/:slug` | Öffentliche Einladung (Gäste) |
| `/dashboard/:token` | Dashboard für das Brautpaar |
| `/e/demo` | Demo-Einladung |

## Datenbank-Schema

- **weddings** – Hochzeitsprofile mit Slug und Dashboard-Token
- **rsvps** – Gästeantworten (Zusage/Absage)

Details in `supabase/schema.sql`.

## Lizenz

MIT
