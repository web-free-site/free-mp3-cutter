# Cursor agent brief — free-mp3-cutter

Target: https://free-mp3-cutter.web-free.site
Repo name (wrangler `name`): `free-mp3-cutter`
English name: "Free MP3 Cutter". English primary.

Follow every rule in the attached `agent-brief-common.md`, with one SEO override below. Do not write the tool from scratch. Do not deploy. Do not switch models. Push to `main` of this repo when the work is done.

**SEO / language override (takes precedence over the common brief):** do **not** add a French or Swahili landing page, UI translation, or how-to pages. How-to and legal pages are English only. You may omit `hreflang` fr.

This is an audio trimmer for **local files only**. Do not add YouTube, URL, or cloud downloading.

## Recommended base (use this)

- Repo: https://github.com/irajeshegde/AudioSlice
- License: MIT (keep `LICENSE`, credit AudioSlice / irajeshegde in the footer and on `/about`)
- Stars: 1
- Last commit: 24 Aug 2026, 10:09 CAT (Africa/Kigali) — `7e19568` on `main`
- Official demo: `https://audio-slice.vercel.app`
- Stack: Vite 6, React 19, TypeScript, Tailwind 4, `wavesurfer.js`, `@ffmpeg/ffmpeg` 0.12.15, JSZip. A complete in-browser audio editor: drag-and-drop local files, waveform trim / gain / split / join, a timestamp finder, equal-length split with ZIP download of the chunks, keyboard shortcuts, light/dark mode. `npm run build` emits a static `dist/`.
- Coverage already in the base: MP3, WAV, M4A, FLAC, OGG and other common audio formats; preview before export; 2 GB hard size cap (warning above 1 GB).
- Cloudflare: yes — static assets / Workers with assets. The app is a client-side shell; you must add prerendered HTML for every public page (no bare SPA fallback).
- Verification (this box, 19 Nov 2026, CAT): cloned; `LICENSE` is a real MIT file (Copyright (c) 2026 AudioSlice contributors). `package.json` license is MIT. The FFmpeg wrapper is loaded in `src/services/ffmpegService.ts` from `@ffmpeg/core@0.12.6` on unpkg / jsDelivr (see the core-license section below). No COEP/COOP headers in `vite.config.ts`.
- Local clone already on the box: `/workspace/repo-candidates/batch-2026-11-19/AudioSlice`
- Why this one: MIT with a real `LICENSE` file, a complete working website (not just a library), waveform cutting plus split/join, Vite static output, and no server.

## Backup (MIT; simpler trimmer; weaker otherwise)

- Repo: https://github.com/donatodelpeschio/soundBlade
- License: MIT (LICENSE file, Copyright (c) 2026 Donato del Peschio — the file is the MIT text even though `package.json` has no `license` field)
- Stars: 2
- Last commit: 8 Feb 2026, 18:03 CAT (Africa/Kigali) — `e0a8672` on `main`
- Official demo: `https://soundblade.dfix.it`
- Stack: Vite, vanilla JS, WaveSurfer.js, `@ffmpeg/ffmpeg`. A minimal PWA trimmer. Same FFmpeg core caveat. If you use this base, add multi-format export and a clear cut/preview UI before the SEO pages, and drop Docker/nginx.
- Local clone: `/workspace/repo-candidates/batch-2026-11-19/soundBlade`

`m-a-c-m/AudioCutter` is also MIT (Copyright (c) 2026 Miguel Ángel Colorado Marin) and has a “fast mode” that stream-copies without re-encoding, but it is a Next.js app, last commit 6 Sep 2026 (`c0fb6a1`). Use it only if both bases above fail, and you would still have to prerender every public page.

## Do not use these

- `D3SOX/browser-audio-tools` — AGPL-3.0, not a permitted license for the app.
- `est/audio-editor` — AGPL-3.0.
- Desktop, Android, or Electron audio editors, and any tool that downloads audio from a URL.

## FFmpeg core license and file size (mandatory)

The JavaScript wrapper `@ffmpeg/ffmpeg` is MIT. The FFmpeg **WebAssembly cores are often not**.

- Official `@ffmpeg/core@0.12.10` is **GPL-2.0-or-later** on the npm registry. The npm license field on some older tags (including 0.12.6, which AudioSlice loads from unpkg) may say MIT — do not trust that for the `.wasm` binary without checking the core you actually ship.
- Gentil allows an **LGPL** ffmpeg.wasm core used as a library. A GPL core is worse. For cutting audio, libmp3lame (and basic decoders) is enough; you do not need libx264.
- Prefer a **single-thread LGPL build** (no `--enable-gpl`, no COEP/COOP). If you cannot produce or obtain a clearly LGPL single-thread core, **STOP before shipping a GPL core** and report what you found, rather than quietly using AudioSlice’s unpkg `@ffmpeg/core@0.12.6`.
- **Do not put a 25+ MiB `.wasm` file in the Worker assets or the Git repo.** Cloudflare static assets typically cap individual files at 25 MiB. Load the single-thread core at runtime from a public CDN or similar host, show a progress indicator, and cache it in the browser (Cache API or OPFS). Credit FFmpeg and ffmpeg.wasm on `/about`, and keep the license texts that apply to the core you actually ship.
- **Do not set COEP/COOP headers.** Ads will break if you do.

## What to build on top of irajeshegde/AudioSlice

1. Import the base into this repo, keep the MIT license, and credit AudioSlice / irajeshegde. Also credit wavesurfer.js and JSZip (and FFmpeg / ffmpeg.wasm as above). Omit GitHub Actions workflows if any (the token lacks the `workflow` scope — do not restore them).
2. Rebrand to "Free MP3 Cutter". English primary. No FR/SW translations of the site. Keep the waveform editor, timestamp finder, and equal-split modes. The default export should be a cut MP3 (other input formats may be converted to MP3, or kept when a stream-copy cut is possible).
3. Keep everything 100% in the browser. No accounts, no paid APIs, no API keys, no file upload, no YouTube, no URL import. Accept local audio files (at least MP3, WAV, M4A, OGG, FLAC). Let the user preview, set start/end, cut, optionally split into chunks, and download.
4. Adsterra only, never AdSense. Use **only** the codes in `/workspace/ads-free-mp3-cutter.md` (that file will be filled in before you start; do not invent codes). Follow the `free-invoice-generator` pattern: all 10 units, banners in isolated iframes, `atOptions {key, format:'iframe', height, width, params:{}}`, `src https://bauval.org/22/<key>`, `public/ads.json`. Never set COEP/COOP headers. Ads must not break playback, cutting, or download.
5. SEO: prerendered HTML for every page (no bare SPA fallback); unique title, meta description, canonical, OG; JSON-LD (WebApplication + FAQPage); `sitemap.xml` and `robots.txt` for `https://free-mp3-cutter.web-free.site`; English format/how-to pages, at least `/how-to-cut-an-mp3-in-the-browser`, `/cut-wav`, and `/cut-m4a` (each with its own title, description and canonical); prerendered `/privacy`, `/terms`, `/about`, `/contact`. Canonicals must be `https://free-mp3-cutter.web-free.site`. No French landing page.
6. Footer: credit the upstream project, FFmpeg, and ffmpeg.wasm, and add a link back to the hub `https://web-free.site`.
7. On every prerendered HTML page, before `</body>`, add:
   - The same **"More free tools"** block used on the other web-free.site tools (`id="wf-more-tools"`). Include a "Guides on this site" column for the how-to pages. List every current hub tool, plus the four other sites in this batch. Show **Free MP3 Cutter** as bold text, not a self-link.
     - **Documents & writing:** Free Word Counter, Free PDF Converter, Free CV Maker, Free Invoice Generator, Free Typing Test, Free Signature Generator, and Free Email Signature Generator (`https://free-email-signature-generator.web-free.site/`).
     - **Images & codes:** Free QR Code Creator, Free Image Resizer, Free Image to Text, Free Background Remover, Free Image Compressor.
     - **Calculators & currency:** Free Online Calculator, Free Currency Converter, Free Unit Converter, Free Loan Calculator, Free Age Calculator, Free Percentage Calculator, Free BMI Calculator.
     - **Text & SEO:** Free AI Humanizer, Free SEO Generator, Free Backlink Generator, Free JSON Formatter, Free Text to Speech, Free Speech to Text, and Free Diff Checker (`https://free-diff-checker.web-free.site/`).
     - **Audio & video:** Free Video to MP3 Converter, **Free MP3 Cutter**, and Free Screen Recorder (`https://free-screen-recorder.web-free.site/`).
     - **Files:** Free ZIP Tool (`https://free-zip-tool.web-free.site/`).
     - **Test data:** Free Fake Address Generator, Free Fake Name Generator.
     - **Security & passwords:** Free Password Generator.
   - The same Cloudflare Web Analytics tag used on the other sites: `<!-- Cloudflare Web Analytics --><script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "3e2f5f96ab32442ebb6e6f650615b58a"}'></script><!-- End Cloudflare Web Analytics -->`
8. `wrangler.toml`: `name = "free-mp3-cutter"`, `[assets]` pointing at `dist`. Use `html_handling = "auto-trailing-slash"` and `not_found_handling = "none"`. Custom domain `free-mp3-cutter.web-free.site`. **Do not put `account_id` (or API tokens) in the committed file.** **Do not deploy.** Push to this repo only. Deploy happens from Gentil's box.
9. Test: production build, run locally (without COEP/COOP), cut a short MP3 and a short WAV (or M4A), download and play the results, try an equal-length split if you kept that mode, check mobile at 390px, confirm no file is uploaded and that no URL downloader exists, fix bugs. Critique your own result and fix issues.
10. Push everything to `main`. Final report: base repo + license, which FFmpeg core you actually shipped (source, license, size, how it is loaded), pages, tests and results, remaining caveats, commit hash.

## Adsterra ad codes

Read `/workspace/ads-free-mp3-cutter.md` and use only the codes in that file. It will be filled in separately, before this agent is launched. Do not invent Adsterra keys, URLs, or site IDs.


---
NOTE: any /workspace/... box path mentioned above is NOT accessible to you; everything you need is inline below. Clone the base repo from GitHub yourself.

# COMMON RULES (contents of agent-brief-common.md)
COMMON RULES (from Gentil, mandatory):
- Start from an existing, usable open-source repository: search GitHub, then compare stars, activity, license (MIT/Apache/BSD preferred; avoid AGPL/GPL unless nothing else fits) and code quality. Import its code into this repo, keep its LICENSE, and credit it in the footer and on /about.
- Do NOT write the tool from scratch. If no suitable open-source base exists, STOP before coding and report the 2-3 best candidates and why they fail. Gentil must approve any from-scratch work, and he only allows it for one or two simple pages.
- Keep the model you were launched with. Do not switch models.
- Must be hostable on Cloudflare Workers with static assets (free plan). No paid APIs, no server costs, no API keys. Client-side processing preferred.
- Monetization: Adsterra only, never AdSense. The real codes for this site are in the attached adsterra-new-codes.md, in this site's section (use only that section). Integrate all 10 units following the free-invoice-generator pattern: Popunder and Social Bar in the HTML; 728x90 at the top; sidebar 160x600 and 160x300; mid-page 728x90, 468x60 and Native; 300x250; sticky 320x50 on mobile; Smartlink as a discreet link. Banners go in isolated iframes with atOptions {key, format:'iframe', height, width, params:{}} and src https://bauval.org/22/<key>. Also write public/ads.json with all the codes. Never set COEP/COOP headers. Ads must not break the tool.
- SEO: prerendered HTML for every page (no bare SPA fallback); unique title, meta description, canonical and OG tags; JSON-LD (WebApplication + FAQPage); hreflang en/fr; sitemap.xml and robots.txt using the site's own URL; a long-tail keyword page or two; FAQ and how-to content; /privacy, /terms, /about and /contact pages (prerendered); plus a French landing page.
- Name: "Free <Tool>". English primary.
- Add wrangler.toml with name = <repo name> and [assets] pointing to the build output. Do NOT deploy: Gentil's box deploys it.
- Test: build, run it locally, exercise the main feature in a browser, check mobile at 390px, and fix bugs. Critique your own result and fix the issues you find.
- Push everything to main of this repo.
- Final report: the base repo and its license, the pages, the tests and their results, the remaining caveats, and the commit hash.


# ADSTERRA CODES FOR THIS SITE (use only these)
Code formats (KEY = the 32-char hash):
- Popunder: <script data-cfasync="false" src="https://abscloud.org/1/KEY"></script>
- Native Banner: <script async="async" data-cfasync="false" src="https://bauval.org/21/KEY"></script><div id="container-KEY"></div>
- Social Bar: <script data-cfasync="false" src="https://bauval.org/14/KEY"></script>
- Banner WxH: <script>atOptions = {'key':'KEY','format':'iframe','height':H,'width':W,'params':{}};</script><script src="https://bauval.org/22/KEY"></script>
- Smartlink URL: https://araplhn.org/4/KEY

## free-mp3-cutter.web-free.site — site ID 6213247
Popunder 0cd062487f5bd30f8553c665a12d723f (unit 32367831)
Native Banner 33c548e9fea74be22580ea02d13ddd8c
Smartlink 8c918babe650bf5eeb3980fd9d1627cb
Social Bar b2d277f910180540e070c5c3769432fa
468x60 fa5b24b04f2fc21e47eceb1602dc97f0
160x300 ac0e7a240f3cc2dba0204eb4b30ac2ad
320x50 c9211ae7d6f96af9faeaf1d5a5a436e1
300x250 4d40d789c0b57f73526c9e4cef2cf5cb
160x600 5fac196909577f6fa65590c7c0678de7
728x90 055e97ed8e360b6decb7b547618a39a6

## 