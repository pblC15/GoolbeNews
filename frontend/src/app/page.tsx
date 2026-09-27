import Link from 'next/link'
import PostCard from '@/components/PostCard'
import NewsletterSignup from '@/components/NewsletterSignup'
import RecentPostsList from '@/components/RecentPostsList'
// [ADSENSE] Anúncios desativados até a aprovação do Google AdSense. Para reativar,
// descomente os imports abaixo e os blocos marcados com [ADSENSE] nesta página.
// import AdUnit from '@/components/ads/AdUnit'
// import { AD_SLOTS } from '@/lib/ads'

export const revalidate = 60
const API = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000'

async function json(url: string) {
  const r = await fetch(url, { next: { revalidate } })
  return r.ok ? r.json() : []
}

function views(n: number) {
  return new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

function date(d?: string) {
  return d ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(d)) : ''
}

function CategorySection({ cat, posts }: { cat: any; posts: any[] }) {
  const [lead, ...rest] = posts
  const headingId = `cat-${cat.slug}`
  return (
    <section aria-labelledby={headingId}>
      {/* título com a linha fazendo a divisão */}
      <div className="mb-6 flex items-center gap-4">
        <h2 id={headingId} className="shrink-0 text-2xl font-black tracking-tight text-slate-950">
          <Link href={`/categoria/${cat.slug}`} className="hover:text-sky-700">{cat.name}</Link>
        </h2>
        <span className="h-px flex-1 bg-slate-300" aria-hidden="true" />
        <Link href={`/categoria/${cat.slug}`} className="shrink-0 text-sm font-semibold text-sky-700 hover:text-sky-900">
          Ver todas
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <article className="group sm:col-span-2 lg:row-span-2">
          {lead.cover_url && (
            <Link href={`/post/${lead.slug}`} className="block overflow-hidden rounded-2xl">
              <img src={lead.cover_url} alt={lead.title} loading="lazy" className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
            </Link>
          )}
          <h3 className="mt-4 text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-3xl">
            <Link href={`/post/${lead.slug}`} className="hover:text-sky-700">{lead.title}</Link>
          </h3>
          {lead.excerpt && <p className="mt-2 line-clamp-3 leading-7 text-slate-600">{lead.excerpt}</p>}
          <p className="mt-3 text-xs text-slate-400">{date(lead.published_at)}</p>
        </article>

        {rest.map((p: any) => (
          <article key={p.id} className="group">
            {p.cover_url && (
              <Link href={`/post/${p.slug}`} className="block overflow-hidden rounded-xl" tabIndex={-1} aria-hidden="true">
                <img src={p.cover_url} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
              </Link>
            )}
            <h3 className="mt-3 line-clamp-3 font-black leading-snug text-slate-950">
              <Link href={`/post/${p.slug}`} className="hover:text-sky-700">{p.title}</Link>
            </h3>
            <p className="mt-1.5 text-[11px] text-slate-400">{date(p.published_at)}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const [posts, cats, popular] = await Promise.all([
    // sort=recent → ordenado pela data de publicação (mais nova primeiro).
    // Na home: 5 para o destaque + 5 para "Mais recentes"
    json(`${API}/api/posts?limit=${q ? 18 : 10}&sort=recent${q ? `&q=${encodeURIComponent(q)}` : ''}`),
    json(`${API}/api/categories`),
    // sort=views → ordenado pela coluna posts.views (mais lidas primeiro)
    q ? Promise.resolve([]) : json(`${API}/api/posts?limit=3&sort=views`),
  ])

  if (q) {
    return (
      <div className="space-y-6">
        <div className="border-b pb-5">
          <p className="text-sm font-bold uppercase tracking-wider text-sky-700">Pesquisa</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">Resultados para “{q}”</h1>
          <p className="mt-2 text-slate-500">{posts.length} notícia(s) encontrada(s)</p>
        </div>
        {posts.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p: any) => <PostCard key={p.id} post={p} />)}
          </div>
        ) : (
          <div className="rounded-2xl border bg-white p-10 text-center text-slate-500">Nenhuma notícia encontrada. Tente outras palavras.</div>
        )}
        <NewsletterSignup className="mt-4" />
      </div>
    )
  }

  const hero = posts[0]
  const side = posts.slice(1, 5)
  // "Mais recentes": no máximo 5 notícias, logo depois das que estão no destaque
  const latest = posts.slice(5, 10)
  // só entram no ranking notícias que já tiveram pelo menos uma leitura
  const mostRead = (Array.isArray(popular) ? popular : []).filter((p: any) => Number(p.views) > 0).slice(0, 3)

  // As 3 categorias com mais notícias publicadas, cada uma com as suas 5 mais recentes
  const topCats = (Array.isArray(cats) ? cats : [])
    .filter((c: any) => Number(c.published_count) > 0)
    .sort((a: any, b: any) => Number(b.published_count) - Number(a.published_count) || a.name.localeCompare(b.name))
    .slice(0, 3)
  const catSections = (
    await Promise.all(
      topCats.map(async (c: any) => ({
        cat: c,
        posts: await json(`${API}/api/posts?category=${encodeURIComponent(c.slug)}&limit=5&sort=recent`),
      }))
    )
  ).filter((s) => Array.isArray(s.posts) && s.posts.length > 0)

  return (
    <div className="space-y-14">
      <section>
        {/* Categorias: só no desktop (no celular ficam no menu hambúrguer) */}
        {cats.length > 0 && (
          <nav aria-label="Categorias" className="mb-5 hidden flex-wrap gap-1.5 md:flex">
            {cats.map((c: any) => (
              <Link key={c.id} href={`/categoria/${c.slug}`} className="rounded-full border bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:border-sky-300 hover:text-sky-700">
                {c.name}
              </Link>
            ))}
          </nav>
        )}

        {!hero ? (
          <div className="rounded-2xl border bg-white p-12 text-center text-slate-500">Ainda não há notícias publicadas.</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <article className="group overflow-hidden rounded-3xl bg-slate-950 text-white">
              <Link href={`/post/${hero.slug}`} className="block overflow-hidden">
                {hero.cover_url && (
                  <img src={hero.cover_url} className="aspect-[16/8.5] w-full object-cover opacity-90 transition duration-500 group-hover:scale-[1.02]" alt={hero.title} />
                )}
              </Link>
              <div className="p-6 sm:p-8">
                <span className="text-xs font-bold uppercase tracking-[.15em] text-sky-300">{hero.category_name}</span>
                <h1 className="mt-3 text-3xl font-black leading-[1.05] tracking-tight sm:text-5xl">
                  <Link href={`/post/${hero.slug}`}>{hero.title}</Link>
                </h1>
                {hero.excerpt && <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">{hero.excerpt}</p>}
                <p className="mt-5 text-xs text-slate-400">{date(hero.published_at)}</p>
              </div>
            </article>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {side.map((p: any) => (
                <article key={p.id} className="grid grid-cols-[120px_1fr] overflow-hidden rounded-2xl border bg-white transition hover:shadow-md sm:grid-cols-1 lg:grid-cols-[140px_1fr]">
                  {p.cover_url && (
                    <Link href={`/post/${p.slug}`}>
                      <img src={p.cover_url} className="h-full min-h-28 w-full object-cover" alt={p.title} />
                    </Link>
                  )}
                  <div className="p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700">{p.category_name}</span>
                    <h2 className="mt-1 line-clamp-3 font-black leading-snug">
                      <Link href={`/post/${p.slug}`} className="hover:text-sky-700">{p.title}</Link>
                    </h2>
                    <p className="mt-2 text-[11px] text-slate-400">{date(p.published_at)}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* [ADSENSE] {hero && <AdUnit slot={AD_SLOTS.homeTop} />} */}

      {(latest.length > 0 || mostRead.length > 0) && (
        <div className={`grid items-start gap-10 ${mostRead.length ? 'lg:grid-cols-[1fr_340px]' : ''}`}>
          <RecentPostsList posts={latest} />
          {/* [ADSENSE] anúncio depois da lista: <AdUnit slot={AD_SLOTS.homeFeed} className="my-8" /> */}

          {mostRead.length > 0 && (
            <aside aria-labelledby="mais-lidas" className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">
              <h2 id="mais-lidas" className="text-2xl font-black tracking-tight">Mais lidas</h2>
              <ol className="mt-5 space-y-5">
                {mostRead.map((p: any, i: number) => (
                  <li key={p.id} className="grid grid-cols-[40px_1fr] items-start gap-3">
                    <span className="text-4xl font-black leading-none text-sky-600/80 tabular-nums" aria-hidden="true">{i + 1}</span>
                    <div className={`min-w-0 ${i < mostRead.length - 1 ? 'border-b pb-5' : ''}`}>
                      <h3 className="font-black leading-snug text-slate-950">
                        <Link href={`/post/${p.slug}`} className="hover:text-sky-700">{p.title}</Link>
                      </h3>
                      <p className="mt-1.5 text-xs text-slate-500">
                        {p.category_name ? `${p.category_name}, ` : ''}{views(Number(p.views))} {Number(p.views) === 1 ? 'leitura' : 'leituras'}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </aside>
          )}
        </div>
      )}

      <NewsletterSignup source="home" variant="dark" />

      {/* Sessões por categoria: as 3 com mais notícias publicadas */}
      {catSections.map(({ cat, posts: cp }) => (
        <CategorySection key={cat.id} cat={cat} posts={cp} />
      ))}
    </div>
  )
}
