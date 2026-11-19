import fs from 'node:fs'
import path from 'node:path'

const HOST = 'https://free-mp3-cutter.web-free.site'
const dist = path.resolve('dist')
const baseHtml = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')

const pages = [
  {
    path: '/privacy',
    title: 'Privacy — Free MP3 Cutter',
    description: 'How Free MP3 Cutter handles your audio files and browser data. No server uploads.',
    h1: 'Privacy policy',
    snippet:
      '<p>Free MP3 Cutter processes audio entirely in your browser. We do not receive your files, and we do not operate a user account system.</p>',
  },
  {
    path: '/terms',
    title: 'Terms of use — Free MP3 Cutter',
    description: 'Terms for using the Free MP3 Cutter browser tool.',
    h1: 'Terms of use',
    snippet:
      '<p>This tool is provided as-is without warranty. You are responsible for how you use exported audio and for complying with copyright law in your jurisdiction.</p>',
  },
  {
    path: '/about',
    title: 'About — Free MP3 Cutter',
    description: 'About Free MP3 Cutter, AudioSlice, FFmpeg, and ffmpeg.wasm.',
    h1: 'About Free MP3 Cutter',
    snippet:
      '<p>Free MP3 Cutter is based on the MIT AudioSlice project by irajeshegde. Audio is processed with FFmpeg WebAssembly (LGPL single-thread build) loaded at runtime.</p>',
  },
  {
    path: '/contact',
    title: 'Contact — Free MP3 Cutter',
    description: 'Contact the web-free.site team about Free MP3 Cutter.',
    h1: 'Contact',
    snippet: '<p>Email gentil@quevvy.com for support, corrections, or partnerships.</p>',
  },
]

function buildPage(page) {
  const url = HOST + page.path
  let html = baseHtml
  html = html.replace(/<html lang="[^"]*"/, `<html lang="en"`)
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${page.title}</title>`)
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${page.description}" />`,
  )
  html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${url}" />`)
  html = html.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${url}" />`)
  html = html.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${page.title}" />`)
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${page.description}" />`,
  )
  const seoBlock = `<section id="seo-prerender" class="seo-prerender"><h1>${page.h1}</h1>${page.snippet}</section>`
  html = html.replace('<div id="root"></div>', `${seoBlock}<div id="root"></div>`)
  return html
}

for (const page of pages) {
  const dir = path.join(dist, page.path.replace(/^\//, ''))
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'index.html'), buildPage(page))
}

console.log('Prerendered', pages.length, 'legal shells from Vite index.html')