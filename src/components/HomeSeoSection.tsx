import { FC } from 'react'
import { SEO_PAGES } from '../seo/pages'

export const HomeSeoSection: FC = () => {
  const page = SEO_PAGES[0]
  return (
    <section id="seo-prerender" className="seo-prerender max-w-3xl mx-auto mb-6 text-sm text-slate-600 dark:text-slate-400 space-y-2">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{page.h1}</h1>
      {page.paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </section>
  )
}