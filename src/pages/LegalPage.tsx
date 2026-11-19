import React, { FC } from 'react'
import { Link } from 'react-router-dom'
import { AdSlot } from '../components/ads/AdSlot'
import { SITE } from '../site'

interface Props {
  kind: 'privacy' | 'terms' | 'about' | 'contact'
}

const copy: Record<string, { title: string; body: React.ReactNode[] }> = {
  privacy: {
    title: 'Privacy policy',
    body: [
      'Free MP3 Cutter processes audio entirely in your browser. Your files are not uploaded to our servers and we do not maintain user accounts.',
      'Draft settings may remain in browser storage on your device until you clear site data.',
      'Ad partners (Adsterra) may set cookies when ads are shown; see their policies when ads are enabled.',
      `Questions: ${SITE.contactEmail}`,
    ],
  },
  terms: {
    title: 'Terms of use',
    body: [
      'This tool is provided as-is without warranty. You are responsible for copyright compliance when editing audio you do not own.',
      'Do not use the site for unlawful content. The operator may update these terms.',
    ],
  },
  about: {
    title: 'About Free MP3 Cutter',
    body: [
      <>
        Free MP3 Cutter is a browser-based audio trimmer on{' '}
        <a href={SITE.hubUrl} className="text-indigo-600 dark:text-indigo-400 underline">
          web-free.site
        </a>
        , extended from the MIT project{' '}
        <a href={SITE.upstreamRepo} className="text-indigo-600 dark:text-indigo-400 underline" rel="noopener noreferrer">
          AudioSlice
        </a>{' '}
        by irajeshegde.
      </>,
      <>
        Waveform display uses{' '}
        <a href="https://wavesurfer.xyz/" className="underline" rel="noopener noreferrer">
          wavesurfer.js
        </a>
        . ZIP downloads use JSZip. Encoding and cutting use FFmpeg via{' '}
        <a href="https://ffmpegwasm.netlify.app/" className="underline" rel="noopener noreferrer">
          ffmpeg.wasm
        </a>{' '}
        (
        <a href="https://www.npmjs.com/package/@ffmpeg/ffmpeg" className="underline" rel="noopener noreferrer">
          @ffmpeg/ffmpeg
        </a>{' '}
        MIT wrapper).
      </>,
      <>
        The WebAssembly core is a single-thread LGPL build (version {SITE.ffmpegCore.version}) loaded at runtime from{' '}
        <a href={SITE.ffmpegCore.upstream} className="underline" rel="noopener noreferrer">
          {SITE.ffmpegCore.upstream}
        </a>{' '}
        (served from this site at {SITE.ffmpegCore.runtimePath} for same-origin loading){' '}
        (~{(SITE.ffmpegCore.wasmBytes / 1024 / 1024).toFixed(1)}&nbsp;MiB WASM, cached in your browser). It is built without GPL
        components, with LAME for MP3 encoding. License: {SITE.ffmpegCore.license}. FFmpeg is LGPL; LAME is LGPL.
      </>,
      `Operator: Gentil M. — ${SITE.contactEmail}`,
    ],
  },
  contact: {
    title: 'Contact',
    body: [
      <>
        Email{' '}
        <a href={`mailto:${SITE.contactEmail}`} className="underline">
          {SITE.contactEmail}
        </a>{' '}
        for support, corrections, or partnerships. For more free tools, visit{' '}
        <Link to="/" className="underline">
          Free MP3 Cutter
        </Link>{' '}
        or{' '}
        <a href={SITE.hubUrl} className="underline">
          web-free.site
        </a>
        .
      </>,
    ],
  },
}

export const LegalPage: FC<Props> = ({ kind }) => {
  const c = copy[kind]
  return (
    <article className="prose prose-slate dark:prose-invert max-w-3xl">
      <h1 className="text-2xl font-semibold mb-4">{c.title}</h1>
      {c.body.map((p, i) => (
        <p key={i} className="text-sm text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
          {p}
        </p>
      ))}
      <AdSlot slot="content300x250" className="ad-content" />
      <AdSlot slot="content468x60" className="ad-content" />
    </article>
  )
}