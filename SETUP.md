# DeutschMeister — Setup

A single-user German B2/C1 learning app. Runs entirely locally: Next.js 14 (App Router) + Tailwind CSS on the frontend, Next.js Server Actions on the backend, the Anthropic Claude API for AI features, and local JSON files under `data/` for storage — no database, no auth.

## Prerequisites

- **Node.js 18+**
- **An Anthropic API key** — create one at [console.anthropic.com](https://console.anthropic.com). Required for Screens 1–3 (vocabulary extraction, grammar analysis, and the AI tutor chat all call Claude).
- Two more free-tier keys, needed specifically for Screen 1's content search:
  - A **Tavily API key** — [tavily.com](https://tavily.com) (free tier: 1000 searches/month), for article search.
  - A **YouTube Data API v3 key** — [console.cloud.google.com](https://console.cloud.google.com) (free quota), for video search.

## Installation

```bash
git clone <this-repository-url>
cd GermanLearning
npm install
```

## Configuration

Copy the example env file and fill in your real keys:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and paste your keys:

```
ANTHROPIC_API_KEY=sk-ant-...
TAVILY_API_KEY=tvly-...
YOUTUBE_API_KEY=...
```

> **Important:** the app reads `.env.local` — not a plain `.env`. If you also happen to have a `.env` file in the project (Next.js loads both), `.env.local` takes precedence for any variable defined in both, but it's cleanest to only keep `.env.local` and delete any stray `.env`.

## Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects straight to Screen 1.

## Verify it works — checklist

1. **Screen 1's topic dropdown** loads all 100 topics, grouped by category (Business, Tech, Lifestyle, Culture, Society).
2. With **📄 Artikel** selected, pick a topic and click **"Suchen"** — a German news article (title, source link, body text) should appear within a few seconds.
3. Click **"Vokabular extrahieren"** in the right-hand panel — 10 vocabulary cards (term, German definition, example sentence) should appear.
4. Click **"Speichern"** on one of those cards, then open `data/vocabulary.json` — it should now contain a new entry for that term with `saved_at`/`next_review_at`/etc. filled in.
5. Go to **Screen 3** (Tutor tab) and send a reply in the chat — the tutor's response should come back in German.

## Troubleshooting

**API key not working**
The app surfaces its own error messages inline instead of crashing — look for text like `ANTHROPIC_API_KEY ist nicht gesetzt.` or `Anfrage an Claude ist fehlgeschlagen.` on the page. Fix: confirm the real key is in `.env.local` (not just `.env.local.example`, and not shadowed by a stray `.env`), then **restart** `npm run dev` — Next.js only reads environment variables when the server starts, so edits to `.env.local` need a restart to take effect.

**`Anfrage an Claude ist fehlgeschlagen (400): ... anthropic-workspace-id is required ...`**
Your API key is "identity-linked" (tied to your Console account across workspaces) rather than scoped to a single workspace, so the API needs to be told which workspace to act in. Fix: add `ANTHROPIC_WORKSPACE_ID=wrkspc_...` (the id of the workspace the key should act in, from that workspace's Console settings) alongside `ANTHROPIC_API_KEY` — in `.env.local` for local dev, and in the Vercel project's Environment Variables for production, then redeploy/restart.

**`data/vocabulary.json` write errors (fs write fails)**
If saving a vocab item silently does nothing, or the terminal shows an `EPERM`/`EACCES` error, check that `data/vocabulary.json` isn't marked read-only, isn't open/locked in another program (some editors and sync tools lock JSON files), and that the account running `npm run dev` has write permission to the `data/` folder.

**Tesseract.js (OCR) fails silently**
The OCR path in Screen 1's file upload downloads its worker/WASM/language-data files from a CDN the first time it runs — it isn't fully bundled locally. If the progress bar stays at 0% and nothing happens, open the browser DevTools Network tab and look for failed requests to the tessdata/CDN URLs; this almost always means no internet access at that moment, or the request is being blocked (corporate proxy, ad-blocker, etc.).
