import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ShareButtons from '@/components/ShareButtons'
import NewsletterSignup from '@/components/NewsletterSignup'

export const revalidate = 60
const API = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_BASE ?? 'http://localhost:3000'

async function getPost(slug: string) {
  const r = await fetch(`${API}/api/posts/${slug}`, { next: { revalidate } })
  return r.ok ? r.json() : null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const p = await getPost(slug)
  if (!p) return {}

  const title = p.title
  const description = p.excerpt || `Leia "${p.title}" no GoolbeNews.`
  const url = `${SITE_URL}/post/${p.slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      images: p.cover_url ? [{ url: p.cover_url }] : undefined,
      publishedTime: p.published_at || undefined,
      authors: p.author_name ? [p.author_name] : undefined,
      section: p.category_name || undefined,
    },
    twitter: {
      card: p.cover_url ? 'summary_large_image' : 'summary',
      title,
      description,
      images: p.cover_url ? [p.cover_url] : undefined,
    },
  }
}

async function getRelated(categorySlug?: string, excludeId?: number) {
  if (!categorySlug) return []
  const r = await fetch(`${API}/api/posts?category=${encodeURIComponent(categorySlug)}&limit=4`, { next: { revalidate } })
  const rows = r.ok ? await r.json() : []
  return rows.filter((p: any) => p.id !== excludeId).slice(0, 3)
}

// @editorjs/list pode salvar cada item como string simples (formato antigo)
// ou como objeto { content, items, meta } (formato com suporte a sublistas/checklist).
// Esta função normaliza os dois formatos.
function normalizeListItem(item: any): { content: string; items: any[]; checked?: boolean } {
  if (typeof item === 'string') return { content: item, items: [] }
  return {
    content: item?.content ?? item?.text ?? '',
    items: Array.isArray(item?.items) ? item.items : [],
    checked: !!item?.meta?.checked,
  }
}

function ListItems({ items, style }: { items: any[]; style?: string }) {
  const Tag = (style === 'ordered' ? 'ol' : 'ul') as any
  const isChecklist = style === 'checklist'
  return (
    <Tag className={isChecklist ? 'list-none pl-0' : undefined}>
      {items.map((raw: any, j: number) => {
        const item = normalizeListItem(raw)
        return (
          <li key={j} className={isChecklist ? 'flex items-start gap-2' : undefined}>
            {isChecklist && (
              <input type="checkbox" checked={item.checked} readOnly className="mt-1.5" />
            )}
            <span dangerouslySetInnerHTML={{ __html: item.content }} />
            {item.items.length > 0 && <ListItems items={item.items} style={style} />}
          </li>
        )
      })}
    </Tag>
  )
}

function Blocks({ blocks = [] }: { blocks?: any[] }) {
  return (
    <div className="article-body">
      {blocks.map((b: any, i: number) => {
        if (b.type === 'header') {
          const level = Math.min(Math.max(b.data?.level ?? 2, 2), 4)
          const T = `h${level}` as any
          return <T key={i} dangerouslySetInnerHTML={{ __html: b.data?.text || '' }} />
        }
        if (b.type === 'paragraph') return <p key={i} dangerouslySetInnerHTML={{ __html: b.data?.text || '' }} />
        if (b.type === 'list') {
          return <ListItems key={i} items={b.data?.items || []} style={b.data?.style} />
        }
        if (b.type === 'quote') {
          return (
            <blockquote key={i}>
              <span dangerouslySetInnerHTML={{ __html: b.data?.text || '' }} />
              {b.data?.caption && <cite dangerouslySetInnerHTML={{ __html: b.data.caption }} />}
            </blockquote>
          )
        }
        if (b.type === 'image') {
          return (
            <figure key={i}>
              <img src={b.data?.file?.url} alt={b.data?.caption || 'Imagem da notícia'} />
              {b.data?.caption && <figcaption>{b.data.caption}</figcaption>}
            </figure>
          )
        }
        if (b.type === 'video') {
          return (
            <figure key={i}>
              <video src={b.data?.url} controls preload="metadata" />
              {b.data?.caption && <figcaption>{b.data.caption}</figcaption>}
            </figure>
          )
        }
        if (b.type === 'embed') {
          const isInstagram = b.data?.service === 'instagram'
          return (
            <div key={i}>
              <div className={isInstagram ? 'embed-wrap embed-instagram' : 'embed-wrap'}>
                <iframe src={b.data?.embed} title={b.data?.caption || 'Conteúdo incorporado'} allowFullScreen loading="lazy" />
              </div>
              {b.data?.caption && <p className="-mt-2 text-center text-sm text-slate-500">{b.data.caption}</p>}
            </div>
          )
        }
        return null
      })}
    </div>
  )
}

function AdSlot({ label, className = '' }: { label: string; className?: string }) {
  return <div className={`ad-slot my-2 ${className}`}>{label}</div>
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = await getPost(slug)
  if (!p) notFound()
  const related = await getRelated(p.category_slug, p.id)
  const published = p.published_at
    ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(p.published_at))
    : ''
  const postUrl = `${SITE_URL}/post/${p.slug}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: p.title,
    description: p.excerpt || undefined,
    image: p.cover_url ? [p.cover_url] : undefined,
    datePublished: p.published_at || undefined,
    dateModified: p.updated_at || p.published_at || undefined,
    author: [{ '@type': 'Person', name: p.author_name || 'Redação GoolbeNews' }],
    publisher: {
      '@type': 'Organization',
      name: 'GoolbeNews',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon.svg` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/post/${p.slug}` },
    articleSection: p.category_name || undefined,
  }

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="mx-auto max-w-4xl pb-7 pt-4">
        <Link href={`/categoria/${p.category_slug}`} className="text-xs font-black uppercase tracking-[.18em] text-sky-700">
          {p.category_name || 'Notícia'}
        </Link>
        <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-[-.035em] text-slate-950 sm:text-6xl">{p.title}</h1>
        {p.excerpt && <p className="mt-5 text-xl leading-8 text-slate-600">{p.excerpt}</p>}
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-4 text-sm text-slate-500">
          <span>Por <strong className="text-slate-800">{p.author_name || 'Redação GoolbeNews'}</strong></span>
          {published && <span>{published}</span>}
        </div>
        <ShareButtons url={postUrl} title={p.title} className="mt-5 border-t pt-5" />
      </header>

      {p.cover_url && (
        <figure className="mx-auto max-w-6xl">
          <img src={p.cover_url} alt={p.title} className="max-h-[680px] w-full rounded-3xl object-cover" />
        </figure>
      )}

      <div className="mx-auto max-w-3xl py-8">
        <AdSlot label="Espaço publicitário" />
        {p.blocks?.length ? <Blocks blocks={p.blocks} /> : <p className="text-slate-500">Conteúdo indisponível.</p>}

        <ShareButtons url={postUrl} title={p.title} className="mt-8 border-t pt-6" />

        <NewsletterSignup
          className="mt-10"
          title="Gostou desta notícia?"
          description="Inscreva-se para receber as próximas publicações do GoolbeNews diretamente no seu email."
          source={`post-${p.slug}`}
        />

        <AdSlot label="Espaço publicitário" className="mt-8" />

        {related.length > 0 && (
          <section className="mt-14 border-t pt-8">
            <h2 className="mb-5 text-xl font-black text-slate-950">Notícias relacionadas</h2>
            <div className="grid gap-5 sm:grid-cols-3">
              {related.map((r: any) => (
                <Link key={r.id} href={`/post/${r.slug}`} className="group block overflow-hidden rounded-2xl border bg-white transition hover:-translate-y-0.5 hover:shadow-md">
                  {r.cover_url && <img src={r.cover_url} alt={r.title} className="aspect-[16/9] w-full object-cover" />}
                  <div className="p-4">
                    <p className="line-clamp-3 text-sm font-bold leading-snug text-slate-900 group-hover:text-sky-700">{r.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  )
}
