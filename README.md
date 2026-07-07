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

## Notes

All titles, descriptions, and artwork are fictional/dummy data. Episodes stream public sample videos from Google's test bucket, so playback needs an internet connection.

## Tech

React 18, TypeScript, Vite, React Router, Tailwind CSS v4.
