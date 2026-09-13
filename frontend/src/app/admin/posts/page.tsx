'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { HiOutlineExternalLink, HiOutlineEye } from 'react-icons/hi'
import { adminApi } from '@/lib/adminApi'
import { getSiteBase } from '@/lib/site'

function formatViews(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.0', '')}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace('.0', '')}mil`
  return String(n)
}

export default function Posts() {
  const [items, setItems] = useState<any[]>([])
  const [q, setQ] = useState('')
  const [siteBase, setSiteBase] = useState('')
  const load = () => adminApi('/posts/admin/list').then(setItems)
  useEffect(() => { load(); setSiteBase(getSiteBase()) }, [])
  async function del(id: number) {
    if (!confirm('Excluir esta notícia definitivamente?')) return
    await adminApi(`/posts/${id}`, { method: 'DELETE' })
    load()
  }
  const rows = items.filter(p => p.title.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">Notícias</h1>
          <p className="text-slate-500">Gerencie publicações e rascunhos. Clique no título para abrir a notícia publicada.</p>
        </div>
        <Link href="/admin/posts/new" className="rounded-xl bg-sky-600 px-4 py-2 mt-4 font-bold text-white">+ Nova notícia</Link>
      </div>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Pesquisar por título..." className="w-full max-w-md rounded-xl border bg-white px-4 py-3" />
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="divide-y">
          {rows.map(p => (
            <div key={p.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.published ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {p.published ? 'Publicado' : 'Rascunho'}
                  </span>
                  <span className="text-xs text-slate-400">{p.category_name || 'Sem categoria'}</span>
                  {p.published && (
                    <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600" title={`${p.views ?? 0} visualizações`}>
                      <HiOutlineEye className="h-3.5 w-3.5" /> {formatViews(p.views ?? 0)}
                    </span>
                  )}
                </div>
                {p.published ? (
                  <a
                    href={`${siteBase}/post/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex items-center gap-1.5 truncate font-bold text-slate-900 hover:text-sky-700 hover:underline"
                    title="Abrir a notícia publicada em nova aba"
                  >
                    <span className="truncate">{p.title}</span>
                    <HiOutlineExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
                  </a>
                ) : (
                  <p className="mt-2 truncate font-bold text-slate-900" title="Publique a notícia para poder visualizá-la no site">
                    {p.title}
                  </p>
                )}
                <p className="text-xs text-slate-500">por {p.author_name || 'Autor'}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/posts/${p.id}/edit`} className="rounded-lg border px-3 py-2 text-sm font-semibold">Editar</Link>
                <button onClick={() => del(p.id)} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700">Excluir</button>
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="p-8 text-center text-sm text-slate-400">Nenhuma notícia encontrada.</p>
          )}
        </div>
      </div>
    </div>
  )
}
