import fs from 'node:fs'
import path from 'node:path'

const BASE = 'https://louder.video/vendor/ffmpeg-core-0.12.6-lgpl'
const OUT = path.resolve('public/vendor/ffmpeg-core-0.12.6-lgpl')
const FILES = ['ffmpeg-core.js', 'ffmpeg-core.wasm']

async function download() {
  fs.mkdirSync(OUT, { recursive: true })
  for (const file of FILES) {
    const dest = path.join(OUT, file)
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      console.log('skip', file, '(already present)')
      continue
    }
    const url = `${BASE}/${file}`
    console.log('fetch', url)
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    fs.writeFileSync(dest, buf)
    console.log('wrote', file, buf.length, 'bytes')
  }
}

await download()