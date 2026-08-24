<img src="public/favicon.svg" width="48" height="48" alt="AudioSlice icon" />

# AudioSlice

Cut, trim, and time-mark audio recordings right in your browser. No uploads, no server, no storage.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-19-61dafb.svg)
![Vite](https://img.shields.io/badge/vite-6-646cff.svg)
![Client-side only](https://img.shields.io/badge/processing-100%25%20client--side-brightgreen.svg)

## Features

Three modes, one workflow:

- **Manual Editor** — waveform-based trim, gain, split, and join; pick exact start/end points on the graph, preview and re-trim any clip before export
- **Find Timestamp** — scrub and step frame-by-frame (1s / 0.1s / 10ms) to pinpoint a precise cut, mark it, then copy it straight into the editor
- **Equal Split** — split long recordings into fixed-length chunks in one click, download all as a ZIP or grab them one at a time

Plus:

- Drag-and-drop MP3, WAV, M4A, FLAC, OGG, and most other audio formats
- Keyboard shortcuts (space to play/pause, arrow keys with Shift/Alt modifiers to step) with an on-screen legend
- Runs fully client-side via [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm), so your file never leaves the tab
- Light and dark mode
- File size cap (2GB hard limit, warning above 1GB) to stay within browser memory limits

## Run locally

**Prerequisites:** Node.js

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Tech stack

- React, TypeScript, Vite
- Tailwind CSS
- ffmpeg.wasm for audio splitting in-browser
- JSZip for bundling output chunks

## License

MIT, see [LICENSE](LICENSE).
