export default function sitemap() {
  const base = 'https://algograss.com'
  const now = new Date().toISOString()

  const pages = [
    { url: '/',                    priority: 1.0,  changeFrequency: 'weekly' },
    { url: '/scan',                priority: 0.95, changeFrequency: 'weekly' },
    { url: '/pricing',             priority: 0.9,  changeFrequency: 'monthly' },
    { url: '/signup',              priority: 0.9,  changeFrequency: 'monthly' },
    { url: '/login',               priority: 0.7,  changeFrequency: 'monthly' },
    { url: '/about',               priority: 0.8,  changeFrequency: 'monthly' },
    { url: '/security',            priority: 0.7,  changeFrequency: 'monthly' },
    { url: '/blog',                priority: 0.85, changeFrequency: 'weekly' },
    { url: '/blog/gdpr-checklist-2025',         priority: 0.8, changeFrequency: 'monthly' },
    { url: '/blog/cookie-banner-guide',         priority: 0.8, changeFrequency: 'monthly' },
    { url: '/blog/privacy-policy-requirements', priority: 0.8, changeFrequency: 'monthly' },
    { url: '/blog/uk-gdpr-vs-eu-gdpr',          priority: 0.8, changeFrequency: 'monthly' },
    { url: '/blog/ico-fines-guide',             priority: 0.8, changeFrequency: 'monthly' },
    { url: '/blog/data-processing-agreement',   priority: 0.8, changeFrequency: 'monthly' },
    { url: '/blog/eu-ai-act-guide',             priority: 0.8, changeFrequency: 'monthly' },
    { url: '/blog/ico-enforcement-2025',        priority: 0.8, changeFrequency: 'monthly' },
    { url: '/blog/gdpr-for-saas',               priority: 0.8, changeFrequency: 'monthly' },
    { url: '/contact',             priority: 0.6,  changeFrequency: 'monthly' },
    { url: '/privacy-policy',      priority: 0.5,  changeFrequency: 'yearly'  },
    { url: '/terms',               priority: 0.5,  changeFrequency: 'yearly'  },
    { url: '/cookie-policy',       priority: 0.5,  changeFrequency: 'yearly'  },
  ]

  return pages.map(p => ({
    url: `${base}${p.url}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }))
}
