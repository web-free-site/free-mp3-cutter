import { FC } from 'react'
import { SeoPage, canonicalFor } from '../seo/pages'
import { SITE } from '../site'

interface Props {
  page: SeoPage
}

export const JsonLd: FC<Props> = ({ page }) => {
  const url = canonicalFor(page.path)
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebApplication',
      name: SITE.name,
      url,
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      inLanguage: 'en',
    },
  ]

  if (page.faq.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: page.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    })
  }

  const data = {
    '@context': 'https://schema.org',
    '@graph': graph,
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}