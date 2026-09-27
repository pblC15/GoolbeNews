import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ShareButtons from '@/components/ShareButtons'
import NewsletterSignup from '@/components/NewsletterSignup'
import RecentPostsList from '@/components/RecentPostsList'
// [ADSENSE] Anúncios desativados até a aprovação do Google AdSense. Para reativar,
// descomente os imports abaixo e os blocos marcados com [ADSENSE] nesta página.
// import AdUnit from '@/components/ads/AdUnit'
// import { AD_SLOTS } from '@/lib/ads'

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

/** 5 notícias mais recentes pela data de publicação, sem a notícia atual */
async function getRecent(excludeId?: number) {
  const r = await fetch(`${API}/api/posts?limit=6&sort=recent`, { next: { revalidate } })
  const rows = r.ok ? await r.json() : []
  return (Array.isArray(rows) ? rows : []).filter((p: any) => p.id !== excludeId).slice(0, 5)
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

/** Foto do autor; sem foto, mostra as iniciais do nome */
function AuthorAvatar({ name, url, size }: { name: string; url?: string | null; size: 'sm' | 'lg' }) {
  const cls = size === 'sm' ? 'h-9 w-9 text-xs' : 'h-16 w-16 text-lg'
  if (url) return <img src={url} alt="" className={`${cls} shrink-0 rounded-full object-cover ring-2 ring-white`} />
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  return (
    <span aria-hidden="true" className={`${cls} grid shrink-0 place-items-center rounded-full bg-slate-900 font-black text-white`}>
      {initials || 'G'}
    </span>
  )
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = await getPost(slug)
  if (!p) notFound()
  const [related, recent] = await Promise.all([getRelated(p.category_slug, p.id), getRecent(p.id)])
  const published = p.published_at
    ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(p.published_at))
    : ''
  const postUrl = `${SITE_URL}/post/${p.slug}`
  const authorName = p.author_name || 'Redação GoolbeNews'
  const authorCategories: { id: number; name: string; slug: string }[] = Array.isArray(p.author_categories) ? p.author_categories : []
  const hasAuthorInfo = !!(p.author_profession || p.author_bio || authorCategories.length || p.author_avatar)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: p.title,
    description: p.excerpt || undefined,
    image: p.cover_url ? [p.cover_url] : undefined,
    datePublished: p.published_at || undefined,
    dateModified: p.updated_at || p.published_at || undefined,
    author: [{
      '@type': 'Person',
      name: authorName,
      jobTitle: p.author_profession || undefined,
      description: p.author_bio || undefined,
      image: p.author_avatar || undefined,
    }],
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
        <div className="mt-6 flex items-center gap-3 border-t pt-4 text-sm text-slate-500">
          <AuthorAvatar name={authorName} url={p.author_avatar} size="sm" />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5">
            <span>
              Por <strong className="text-slate-800">{authorName}</strong>
              {p.author_profession && <span className="text-slate-400">, {p.author_profession}</span>}
            </span>
            {published && <time dateTime={p.published_at}>{published}</time>}
          </div>
        </div>
        <ShareButtons url={postUrl} title={p.title} className="mt-5 border-t pt-5" />
      </header>

      {p.cover_url && (
        <figure className="mx-auto max-w-6xl">
          <img src={p.cover_url} alt={p.title} className="max-h-[680px] w-full rounded-3xl object-cover" />
        </figure>
      )}

      <div className="mx-auto max-w-3xl py-8">
        {/* [ADSENSE] <AdUnit slot={AD_SLOTS.postTop} layout="in-article" className="my-6" /> */}
        {p.blocks?.length ? <Blocks blocks={p.blocks} /> : <p className="text-slate-500">Conteúdo indisponível.</p>}

        <ShareButtons url={postUrl} title={p.title} className="mt-8 border-t pt-6" />

        {/* Sessão do autor */}
        {hasAuthorInfo && (
          <aside aria-label="Sobre o autor" className="mt-10 flex gap-4 rounded-2xl bg-slate-100/70 p-5 sm:gap-5 sm:p-6">
            <AuthorAvatar name={authorName} url={p.author_avatar} size="lg" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-500">Escrito por</p>
              <p className="text-lg font-black leading-tight text-slate-950">{authorName}</p>
              {p.author_profession && <p className="text-sm font-semibold text-sky-700">{p.author_profession}</p>}
              {p.author_bio && <p className="mt-2 text-sm leading-6 text-slate-600">{p.author_bio}</p>}
              {authorCategories.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 text-xs text-slate-500">Cobre:</span>
                  {authorCategories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/categoria/${c.slug}`}
                      className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:text-sky-700 hover:ring-sky-300"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </aside>
        )}

        {/* mesma newsletter da home (validação, erros e animação de sucesso) */}
        <NewsletterSignup
          className="mt-10"
          variant="dark"
          title="Gostou desta notícia?"
          description="Inscreva-se para receber as próximas publicações do GoolbeNews diretamente no seu email."
          source={`post-${p.slug}`}
        />

        {/* [ADSENSE] <AdUnit slot={AD_SLOTS.postBottom} layout="in-article" className="mt-8" /> */}

        {/* Mais recentes vem sempre antes de Notícias relacionadas */}
        <RecentPostsList posts={recent} className="mt-14" />

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
