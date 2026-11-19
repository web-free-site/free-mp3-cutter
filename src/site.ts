export const SITE = {
  name: 'Free MP3 Cutter',
  canonicalHost: 'https://free-mp3-cutter.web-free.site',
  hubUrl: 'https://web-free.site/',
  gentilUrl: 'https://gentil.gentil.dev/',
  contactEmail: 'gentil@quevvy.com',
  upstreamRepo: 'https://github.com/irajeshegde/AudioSlice',
  ffmpegCore: {
    /** Upstream build (Louder.video); shipped same-origin under /vendor for CORS-free loading */
    upstream: 'https://louder.video/vendor/ffmpeg-core-0.12.6-lgpl/',
    runtimePath: '/vendor/ffmpeg-core-0.12.6-lgpl/',
    license: 'LGPL-2.1-or-later (custom single-thread build without GPL components)',
    wasmBytes: 6_091_652,
    version: '0.12.6-lgpl',
  },
}