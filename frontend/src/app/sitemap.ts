import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_BASE ?? 'http://localhost:3000'
const API = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000'

async function safeJson(url: string) {
  try {
    const r = await fetch(url, { next: { revalidate: 3600 } })
    return r.ok ? r.json() : []
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, categories] = await Promise.all([
    safeJson(`${API}/api/posts?limit=1000`),
    safeJson(`${API}/api/categories`),
  ])

  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'hourly', priority: 1 },
  ]

  const categoryEntries: MetadataRoute.Sitemap = (Array.isArray(categories) ? categories : []).map((c: any) => ({
    url: `${SITE_URL}/categoria/${c.slug}`,
    changeFrequency: 'hourly',
    priority: 0.6,
  }))

  const postEntries: MetadataRoute.Sitemap = (Array.isArray(posts) ? posts : []).map((p: any) => ({
    url: `${SITE_URL}/post/${p.slug}`,
    lastModified: p.published_at ? new Date(p.published_at) : undefined,
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  return [...staticEntries, ...categoryEntries, ...postEntries]
}
