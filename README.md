# Free MP3 Cutter

Browser-based audio trimmer for **local files only** (MP3, WAV, M4A, FLAC, OGG). Based on [AudioSlice](https://github.com/irajeshegde/AudioSlice) (MIT).

- Live site: https://free-mp3-cutter.web-free.site
- Stack: Vite, React 19, Tailwind 4, wavesurfer.js, `@ffmpeg/ffmpeg`, JSZip
- FFmpeg WASM: LGPL single-thread core loaded at runtime from a CDN (not bundled in `dist`)

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build   # dist/ + prerendered legal pages + sitemap.xml
npm run preview
```

## Deploy

Configured via `wrangler.toml` (static assets only). Deploy is done outside this repo.