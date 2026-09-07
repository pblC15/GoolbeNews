import Link from 'next/link'
import PostCard from '@/components/PostCard'

export const revalidate = 60
const API = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000'

async function json(url: string) {
  const r = await fetch(url, { next: { revalidate } })
  return r.ok ? r.json() : []
}

function date(d?: string) {
  return d ? new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(d)) : ''
}

function AdSlot({ label, className = '' }: { label: string; className?: string }) {
  return <div className={`ad-slot ${className}`}>{label}</div>
}

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const [posts, cats] = await Promise.all([
    json(`${API}/api/posts?limit=18${q ? `&q=${encodeURIComponent(q)}` : ''}`),
    json(`${API}/api/categories`),
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
      </div>
    )
  }

  const hero = posts[0]
  const side = posts.slice(1, 5)
  const latest = posts.slice(5)

  return (
    <div className="space-y-14">
      <section>
        <div className="mb-5 flex flex-wrap gap-2 overflow-hidden">
          {cats.slice(0, 8).map((c: any) => (
            <Link key={c.id} href={`/categoria/${c.slug}`} className="rounded-full border bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-sky-300 hover:text-sky-700">
              {c.name}
            </Link>
          ))}
        </div>

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

      {hero && <AdSlot label="Espaço publicitário" />}

      {latest.length > 0 && (
        <section>
          <div className="mb-6 flex items-end justify-between border-b pb-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-sky-700">Atualização contínua</p>
              <h2 className="text-2xl font-black">Últimas notícias</h2>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.slice(0, 6).map((p: any) => <PostCard key={p.id} post={p} />)}
          </div>
          {latest.length > 6 && (
            <>
              <AdSlot label="Espaço publicitário" className="my-8" />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {latest.slice(6).map((p: any) => <PostCard key={p.id} post={p} />)}
              </div>
            </>
          )}
        </section>
      )}

      <footer className="border-t py-8 text-sm text-slate-500">
        <div className="flex flex-wrap justify-between gap-3">
          <p>© {new Date().getFullYear()} MeuNews</p>
          <p>Informação organizada para leitura rápida e clara.</p>
        </div>
      </footer>
    </div>
  )
}
