import { SITE } from '../site'

export interface SeoPage {
  path: string
  locale: 'en'
  title: string
  description: string
  h1: string
  keywords: string
  paragraphs: string[]
  faq: { q: string; a: string }[]
}

export const SEO_PAGES: SeoPage[] = [
  {
    path: '/',
    locale: 'en',
    title: 'Free MP3 Cutter — Trim audio in your browser | No upload',
    description:
      'Cut, trim, and split MP3, WAV, M4A, FLAC, and OGG files in your browser. Waveform editor, timestamp finder, equal split. No sign-up, no server upload.',
    h1: 'Free MP3 Cutter — cut and trim audio locally',
    keywords: 'free mp3 cutter, trim mp3 online, cut audio browser, waveform editor',
    paragraphs: [
      'Free MP3 Cutter lets you trim, split, and export audio without uploading files to a server. Drag a local track onto the page, preview on a waveform, set start and end points, and download a cut MP3.',
      'Use the manual editor for precise trims, the timestamp finder to jump to time-coded marks, or equal-length split to divide long recordings into chunks and download a ZIP.',
      'Everything runs in your browser with wavesurfer.js and FFmpeg WebAssembly. Your files never leave your device.',
    ],
    faq: [
      {
        q: 'Do you upload my audio?',
        a: 'No. Processing happens entirely in your browser. We do not operate an upload server.',
      },
      {
        q: 'Which formats are supported?',
        a: 'Common formats including MP3, WAV, M4A, FLAC, and OGG. Export defaults to MP3 when re-encoding is required.',
      },
      {
        q: 'Is there a file size limit?',
        a: 'Very large files (above about 2 GB) are blocked. You may see a warning above 1 GB because browser memory is limited.',
      },
      {
        q: 'Why does the app download FFmpeg the first time?',
        a: 'The encoding engine is a WebAssembly build loaded from a CDN and cached in your browser so we do not ship a huge binary with the site.',
      },
    ],
  },
  {
    path: '/privacy',
    locale: 'en',
    title: 'Privacy — Free MP3 Cutter',
    description: 'Privacy policy for Free MP3 Cutter on web-free.site.',
    h1: 'Privacy policy',
    keywords: 'privacy, mp3 cutter',
    paragraphs: [],
    faq: [],
  },
  {
    path: '/terms',
    locale: 'en',
    title: 'Terms of use — Free MP3 Cutter',
    description: 'Terms for using Free MP3 Cutter.',
    h1: 'Terms of use',
    keywords: 'terms',
    paragraphs: [],
    faq: [],
  },
  {
    path: '/about',
    locale: 'en',
    title: 'About — Free MP3 Cutter',
    description: 'Credits for AudioSlice, wavesurfer.js, JSZip, FFmpeg, and ffmpeg.wasm.',
    h1: 'About Free MP3 Cutter',
    keywords: 'about',
    paragraphs: [],
    faq: [],
  },
  {
    path: '/contact',
    locale: 'en',
    title: 'Contact — Free MP3 Cutter',
    description: 'Contact web-free.site about Free MP3 Cutter.',
    h1: 'Contact',
    keywords: 'contact',
    paragraphs: [],
    faq: [],
  },
]

export function canonicalFor(path: string): string {
  if (path === '/') return `${SITE.canonicalHost}/`
  return `${SITE.canonicalHost}${path}`
}