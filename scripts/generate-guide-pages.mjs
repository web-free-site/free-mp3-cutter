import fs from 'node:fs'
import path from 'node:path'
import { WF_MORE_TOOLS_HTML, CF_ANALYTICS_HTML } from './wf-more-tools-snippet.mjs'

const HOST = 'https://free-mp3-cutter.web-free.site'

const guides = [
  {
    slug: 'how-to-cut-an-mp3-in-the-browser',
    title: 'How to cut an MP3 in the browser',
    description:
      'Trim an MP3 file in your browser with Free MP3 Cutter: no upload, waveform preview, and MP3 download.',
    steps: [
      ['Open Free MP3 Cutter', 'Go to the home page and wait for the page to load. The first cut may download the FFmpeg engine once (~6 MB).'],
      ['Drop your MP3', 'Drag and drop a local MP3 or choose a file. The duration and waveform appear in memory only.'],
      ['Select the range', 'In Manual Editor mode, drag handles on the waveform or type start/end times. Preview playback before exporting.'],
      ['Export', 'Download the trimmed MP3. The file is rendered in your browser; nothing is uploaded.'],
    ],
    extra: `<h2>No URL imports</h2><p>Free MP3 Cutter only works with files on your device. It does not download audio from YouTube or other links.</p>`,
  },
  {
    slug: 'cut-wav',
    title: 'Cut WAV files online (browser only)',
    description: 'Trim WAV audio locally in the browser and export MP3 or WAV with Free MP3 Cutter.',
    steps: [
      ['Load a WAV file', 'Use drag-and-drop on the Free MP3 Cutter home page.'],
      ['Trim on the waveform', 'Set start and end points in the manual editor. WAV is large; allow extra time for processing.'],
      ['Download', 'Export defaults to MP3 for compatibility. Re-encode may take longer than stream-copy cuts.'],
    ],
    extra: `<h2>Large files</h2><p>WAV files can be hundreds of megabytes. The tool warns above 1 GB and blocks above 2 GB to protect your browser.</p>`,
  },
  {
    slug: 'cut-m4a',
    title: 'Cut M4A and AAC files in your browser',
    description: 'Trim M4A/AAC recordings without uploading them. Preview, cut, and download with Free MP3 Cutter.',
    steps: [
      ['Add an M4A', 'Pick a local .m4a or .aac file from your phone or computer.'],
      ['Choose a mode', 'Use Manual Editor for one cut, Timestamp Finder for time-coded marks, or Equal Split for chunks.'],
      ['Export MP3', 'Most exports become MP3 unless stream copy keeps the original container in split mode.'],
    ],
    extra: `<h2>Phone recordings</h2><p>Voice memos and screen recordings often arrive as M4A. You can trim silence or split long calls locally.</p>`,
  },
]

const sharedStyle = `
  :root { color-scheme: light dark; }
  body.wf-guide{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.6;background:#fff;color:#1a1a1a}
  .wf-guide-header,.wf-guide-main{max-width:46rem;margin:0 auto;padding:1rem 1.15rem}
  .wf-guide-header{display:flex;flex-wrap:wrap;gap:.75rem 1.25rem;align-items:baseline;border-bottom:1px solid #e3e3e3}
  .wf-guide-header a{color:inherit;text-decoration:none;font-weight:700}
  .wf-guide-header nav a{font-weight:500;text-decoration:underline;margin-right:.8rem}
  .wf-guide-main h1{margin:.4rem 0 1rem;font-size:1.85rem;line-height:1.25}
  .wf-guide-main h2{margin:1.6rem 0 .5rem;font-size:1.2rem}
  .wf-guide-main p,.wf-guide-main li{margin:0 0 .75rem}
  .wf-guide-main ol{padding-left:1.25rem}
  .wf-guide-main a{color:#0b57d0}
  .wf-guide-main .wf-cta{margin:1.5rem 0}
  @media (prefers-color-scheme:dark){
    body.wf-guide{background:#111;color:#f3f3f3}
    .wf-guide-header{border-bottom-color:#333}
    .wf-guide-main a{color:#8ab4f8}
  }
`

function page(g) {
  const url = `${HOST}/${g.slug}`
  const stepsHtml = g.steps
    .map(
      (s, i) => `<li><strong>${s[0]}.</strong> ${s[1]}</li>`,
    )
    .join('')
  const howToLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: g.title,
    description: g.description,
    inLanguage: 'en',
    step: g.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s[0],
      text: s[1],
    })),
  }
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${g.title}</title>
<meta name="description" content="${g.description}">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="en" href="${url}">
<meta property="og:type" content="article">
<meta property="og:title" content="${g.title}">
<meta property="og:description" content="${g.description}">
<meta property="og:url" content="${url}">
<meta name="twitter:card" content="summary">
<meta name="robots" content="index,follow">
<script type="application/ld+json">${JSON.stringify(howToLd)}</script>
<style>${sharedStyle}</style>
<script src="https://ref.web-free.site/r.js" defer></script>
<script data-cfasync="false" src="https://abscloud.org/1/0cd062487f5bd30f8553c665a12d723f"></script>
<script data-cfasync="false" src="https://bauval.org/14/b2d277f910180540e070c5c3769432fa"></script>
</head>
<body class="wf-guide">
  <header class="wf-guide-header">
    <a href="/">Free MP3 Cutter</a>
    <nav aria-label="Page">
      <a href="/">Open the tool</a>
      <a href="https://web-free.site/">All free tools</a>
    </nav>
  </header>
  <main class="wf-guide-main">
    <article>
      <h1>${g.title}</h1>
      <p>${g.description}</p>
      <h2>Steps</h2>
      <ol>${stepsHtml}</ol>
      ${g.extra}
      <p class="wf-cta">Try it now on <a href="/">Free MP3 Cutter</a>.</p>
    </article>
  </main>
  ${WF_MORE_TOOLS_HTML}
  ${CF_ANALYTICS_HTML}
  <script src="/wf-ads.js" defer></script>
</body>
</html>`
}

for (const g of guides) {
  const dir = path.join('public', g.slug)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'index.html'), page(g))
  console.log('Wrote', g.slug)
}