import type { APIRoute } from 'astro'

const getRobotsTxt = (sitemapURL: URL) => `
User-agent: *
Allow: /
Disallow: /functions
Disallow: /hidden
# Hey you! Yes, you! I'm looking at you!
Sitemap: ${sitemapURL.href}

# DuckDuckGo lists font files in search results
User-agent: DuckDuckBot
Disallow: /*.ttf$
Disallow: /*.woff$
Disallow: /*.woff2$
`

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL('sitemap-index.xml', site)
  return new Response(getRobotsTxt(sitemapURL))
}
