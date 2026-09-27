import Link from 'next/link'

/** "há 5 min", "há 3 h", "ontem" ou a data curta */
export function timeAgo(d?: string) {
  if (!d) return ''
  const diff = Date.now() - new Date(d).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h} h`
  if (h < 48) return 'ontem'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', timeZone: 'America/Sao_Paulo' })
    .format(new Date(d))
    .replace('.', '')
}

type Props = {
  posts: any[]
  /** id do título, para acessibilidade (use valores diferentes se houver duas listas na página) */
  headingId?: string
  title?: string
  className?: string
}

/** Sessão "Mais recentes": lista ordenada pela data de publicação */
export default function RecentPostsList({ posts, headingId = 'mais-recentes', title = 'Mais recentes', className = '' }: Props) {
  if (!posts.length) return null
  return (
    <section aria-labelledby={headingId} className={className}>
      <div className="mb-2 border-b-2 border-slate-900 pb-3">
        <h2 id={headingId} className="text-2xl font-black tracking-tight">{title}</h2>
      </div>
      <ol className="divide-y">
        {posts.map((p: any) => (
          <li key={p.id}>
            <article className="group grid grid-cols-[64px_1fr] gap-4 py-5 sm:grid-cols-[80px_1fr_180px]">
              <time dateTime={p.published_at} className="pt-0.5 text-xs font-bold tabular-nums text-sky-700">
                {timeAgo(p.published_at)}
              </time>
              <div className="min-w-0">
                {p.category_name && (
                  <Link href={`/categoria/${p.category_slug}`} className="text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-sky-700">
                    {p.category_name}
                  </Link>
                )}
                <h3 className="mt-1 text-lg font-black leading-snug tracking-tight text-slate-950">
                  <Link href={`/post/${p.slug}`} className="group-hover:text-sky-700">{p.title}</Link>
                </h3>
                {p.excerpt && <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-slate-600">{p.excerpt}</p>}
              </div>
              {p.cover_url && (
                <Link href={`/post/${p.slug}`} className="col-start-2 overflow-hidden rounded-xl sm:col-start-auto" tabIndex={-1} aria-hidden="true">
                  <img src={p.cover_url} alt="" className="aspect-[16/10] w-full object-cover" loading="lazy" />
                </Link>
              )}
            </article>
          </li>
        ))}
      </ol>
    </section>
  )
}
