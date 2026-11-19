import { FC, ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Scissors, Sun, Moon } from 'lucide-react'
import { AdSlot, SponsoredSmartlink, useAdScripts } from './ads/AdSlot'
import { useTheme } from '../hooks/useTheme'
import { SITE } from '../site'

interface Props {
  children: ReactNode
}

export const Layout: FC<Props> = ({ children }) => {
  const location = useLocation()
  useAdScripts()
  const { theme, toggleTheme } = useTheme()
  const isHome = location.pathname === '/'

  return (
    <div className="site-shell min-h-screen flex flex-col">
      <header className="border-b border-slate-200/60 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <AdSlot slot="header728x90" className="ad-header" label="Sponsored" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3 flex-wrap">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Scissors className="w-4.5 h-4.5 stroke-[2]" />
            </div>
            <div>
              <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100 leading-tight block">
                {SITE.name}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 leading-tight block">
                Cut and trim audio — 100% in your browser
              </span>
            </div>
          </Link>
          <nav className="flex items-center gap-3 text-xs sm:text-sm flex-wrap" aria-label="Main">
            <Link to="/" className="text-slate-600 dark:text-slate-300 hover:underline">
              Cutter
            </Link>
            <Link to="/how-to-cut-an-mp3-in-the-browser" className="text-slate-600 dark:text-slate-300 hover:underline">
              How-to
            </Link>
            <Link to="/about" className="text-slate-600 dark:text-slate-300 hover:underline">
              About
            </Link>
            <a href={SITE.hubUrl} className="text-slate-600 dark:text-slate-300 hover:underline">
              All tools
            </a>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200/70 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </nav>
        </div>
        {isHome ? <AdSlot slot="homeTop728x90" className="ad-home-top" /> : null}
      </header>

      <div className="site-body flex-1 flex max-w-5xl w-full mx-auto px-4 sm:px-6 gap-4">
        <main className="site-main flex-1 min-w-0 py-6">{children}</main>
        <aside className="site-sidebar hidden xl:block w-[170px] shrink-0 pt-6" aria-label="Sidebar">
          <AdSlot slot="sidebar160x600" className="ad-sidebar" />
          <AdSlot slot="sidebar160x300" className="ad-sidebar-secondary mt-4" />
        </aside>
      </div>

      <AdSlot slot="mobileSticky320x50" className="ad-mobile-sticky" label="Sponsored" />

      <footer className="border-t border-slate-200/60 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-500 space-y-2 max-w-5xl mx-auto px-4">
        <p>Processing runs locally in your browser. No uploads, no cloud import, no YouTube downloading.</p>
        <p>
          Based on{' '}
          <a href={SITE.upstreamRepo} className="underline hover:text-slate-700 dark:hover:text-slate-300" rel="noopener noreferrer">
            AudioSlice
          </a>{' '}
          (MIT). Uses{' '}
          <a href="https://wavesurfer.xyz/" className="underline" rel="noopener noreferrer">
            wavesurfer.js
          </a>
          , JSZip, FFmpeg, and ffmpeg.wasm.
        </p>
        <p>
          <Link to="/privacy" className="underline hover:text-slate-700 dark:hover:text-slate-300">
            Privacy
          </Link>
          {' · '}
          <Link to="/terms" className="underline">
            Terms
          </Link>
          {' · '}
          <Link to="/about" className="underline">
            About
          </Link>
          {' · '}
          <Link to="/contact" className="underline">
            Contact
          </Link>
          {' · '}
          <a href={SITE.hubUrl} className="underline">
            web-free.site
          </a>
        </p>
        <SponsoredSmartlink />
      </footer>
    </div>
  )
}