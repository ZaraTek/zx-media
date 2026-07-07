# zx-media

A sleek, dark-themed media library and streaming UI built with React + TypeScript + Vite. Browse a catalog of (fictional) shows, dive into episode lists, watch with a full-featured custom video player, and curate your own library.

## Features

- Home page with a featured hero banner and real-time search (by title, genre, or description).
- Show detail pages with season selector and rich episode lists.
- Custom video player: play/pause, seek scrubber with buffered progress, volume + mute, playback speed, fullscreen, skip +/-10s, keyboard shortcuts, auto-hiding controls, and auto "next episode".
- "My Library" — add/remove shows, persisted to `localStorage`.
- Dark theme with a bright-blue accent, responsive across screen sizes.

## Keyboard shortcuts (player)

- `Space` / `k` — play/pause
- `<-` / `->` — skip 10s back/forward
- `Up` / `Down` — volume
- `f` — fullscreen
- `m` — mute

## Getting started

```bash
npm install
npm run dev
```

The app runs at http://localhost:5173.

## Anonymous cloud sync (MongoDB)

This project supports no-login sync for "My Library" using an anonymous profile and a private sync code.

1. Add these values to your `.env` file:

```bash
MONGODB_URI=your-mongodb-connection-string
MONGODB_DB=zx_media
```

2. Start both backend + frontend:

```bash
npm run dev:full
```

The sync API runs on `http://localhost:8787` and Vite proxies `/api/*` automatically in development.

Optional (if frontend and backend are on different hosts):

```bash
VITE_SYNC_API_BASE_URL=https://your-api-domain
```

## Notes

Show metadata/artwork comes from TMDB and episode playback uses Vidsrc episode embeds.

- Default embed base URL: `https://vidsrc.to`
- Optional override in `.env`: `VITE_VIDSRC_BASE_URL=https://your-vidsrc-domain`

Playback requires an internet connection and may depend on your network/ad-block/privacy settings.

## Tech

React 18, TypeScript, Vite, React Router, Tailwind CSS v4.
