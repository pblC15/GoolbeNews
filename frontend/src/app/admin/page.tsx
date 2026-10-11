'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/adminApi'
import { HiOutlineEye, HiOutlineUsers, HiOutlineMail, HiOutlineDocumentText, HiOutlineFolder, HiOutlineInbox } from 'react-icons/hi'

type DashboardData = {
  posts: { total: number; published: number; drafts: number; views: number; published_period: number }
  categories: number
  users: { total: number; editors: number; active_editors: number }
  newsletter: { total: number; active: number; new_subscribers: number }
  unread_messages: number
  audience: { days: number; start: string; end: string; current: number; previous: number; series: { date: string; views: number }[]; started_at: string | null }
}
const format = (value: number) => value.toLocaleString('pt-BR')
const periods = [{ value: 'week', label: 'Semanal', detail: 'Últimos 7 dias' }, { value: 'month', label: 'Mensal', detail: 'Últimos 30 dias' }, { value: 'year', label: 'Anual', detail: 'Últimos 365 dias' }]
const dateLabel = (date: string) => new Date(`${date}T00:00:00Z`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' })

export default function Dashboard() {
  const [period, setPeriod] = useState('month')
  const [data, setData] = useState<DashboardData | null>(null)
  const [editorPosts, setEditorPosts] = useState<{ published: number }[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    let alive = true
    setLoading(true); setError('')
    async function load() {
      try {
        const user = await adminApi('/users/me')
        if (user.role !== 'admin') {
          const posts = await adminApi('/posts/admin/list')
          if (alive) setEditorPosts(posts)
        } else {
          const stats = await adminApi(`/dashboard?period=${period}`)
          if (alive) setData(stats)
        }
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : 'Erro ao carregar estatísticas')
      } finally { if (alive) setLoading(false) }
    }
    load()
    return () => { alive = false }
  }, [period, retry])

  if (editorPosts) return <div className="space-y-5"><h1 className="text-3xl font-black">Visão geral</h1><p className="text-slate-500">Acompanhe a produção editorial na aba de notícias.</p><div className="grid gap-4 sm:grid-cols-3">{[['Notícias', editorPosts.length], ['Publicadas', editorPosts.filter(p => p.published).length], ['Rascunhos', editorPosts.filter(p => !p.published).length]].map(([label, value]) => <div key={label} className="rounded-2xl border bg-white p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>)}</div><Link className="font-semibold text-sky-700" href="/admin/posts">Gerenciar notícias →</Link></div>

  const audience = data?.audience
  const partial = !!audience && (!audience.started_at || audience.started_at.slice(0, 10) >= audience.start)
  const previousPartial = !!audience && (!audience.started_at || new Date(audience.started_at).getTime() > new Date(`${audience.start}T00:00:00Z`).getTime() - audience.days * 86400000)
  const growth = audience && audience.previous > 0 ? (audience.current - audience.previous) / audience.previous * 100 : null
  const buckets = new Map<string, number>()
  if (audience) {
    const values = new Map(audience.series.map(row => [row.date, row.views]))
    for (let i = 0; i < audience.days; i++) {
      const day = new Date(new Date(`${audience.start}T00:00:00Z`).getTime() + i * 86400000).toISOString().slice(0, 10)
      const key = period === 'year' ? day.slice(0, 7) : day
      buckets.set(key, (buckets.get(key) || 0) + (values.get(day) || 0))
    }
  }
  const max = Math.max(1, ...buckets.values())
  const cards = data ? [
    { label: 'Notícias cadastradas', value: data.posts.total, detail: `${format(data.posts.published)} publicadas · ${format(data.posts.drafts)} rascunhos`, icon: HiOutlineDocumentText, href: '/admin/posts' },
    { label: 'Editores', value: data.users.editors, detail: `${format(data.users.active_editors)} ativos · ${format(data.users.total)} usuários no total`, icon: HiOutlineUsers, href: '/admin/users' },
    { label: 'Visualizações acumuladas', value: data.posts.views, detail: 'Total registrado nas notícias existentes', icon: HiOutlineEye },
    { label: 'E-mails na newsletter', value: data.newsletter.total, detail: `${format(data.newsletter.active)} inscrições ativas`, icon: HiOutlineMail },
    { label: 'Categorias', value: data.categories, detail: 'Organização do conteúdo editorial', icon: HiOutlineFolder, href: '/admin/categories' },
    { label: 'Mensagens não lidas', value: data.unread_messages, detail: 'Contatos que aguardam sua atenção', icon: HiOutlineInbox, href: '/admin/messages' },
    { label: 'Publicadas no período', value: data.posts.published_period, detail: 'Notícias atualmente publicadas', icon: HiOutlineDocumentText },
    { label: 'Novos e-mails no período', value: data.newsletter.new_subscribers, detail: 'Novos cadastros, incluindo inativos', icon: HiOutlineMail },
  ] : []

  return <div className="space-y-7">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-black tracking-tight text-slate-950">Visão geral</h1><p className="mt-1 text-slate-500">Audiência, equipe e resultados da sua redação.</p></div><label className="text-sm font-semibold text-slate-600">Período<select value={period} onChange={e => setPeriod(e.target.value)} className="ml-3 rounded-xl border bg-white px-4 py-2">{periods.map(p => <option key={p.value} value={p.value}>{p.label} — {p.detail}</option>)}</select></label></div>
    {error ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">{error}<button onClick={() => setRetry(v => v + 1)} className="ml-3 underline">Tentar novamente</button></div> : loading ? <div role="status" className="rounded-2xl border bg-white p-8 text-slate-500">Carregando estatísticas…</div> : data && <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, detail, icon: Icon, href }) => <div key={label} className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-2"><p className="text-sm font-medium text-slate-500">{label}</p><Icon className="h-5 w-5 shrink-0 text-sky-600" /></div><p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{format(value)}</p><p className="mt-2 text-xs text-slate-500">{detail}</p>{href && <Link href={href} className="mt-3 inline-block text-xs font-semibold text-sky-700">Gerenciar →</Link>}</div>)}</div>
      <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-wrap justify-between gap-4"><div><h2 className="text-lg font-bold text-slate-950">Audiência das notícias</h2><p className="mt-1 text-sm text-slate-500">{periods.find(p => p.value === period)?.detail} · Datas em UTC · Inclui hoje</p></div><div><p className="text-4xl font-black text-sky-700">{format(data.audience.current)}</p><p className="text-xs text-slate-500">visualizações no período</p></div></div>
        <div className="mt-5 grid gap-4 border-y py-4 sm:grid-cols-3"><div><p className="text-xs text-slate-500">Período anterior</p><p className="mt-1 font-bold">{format(data.audience.previous)} visualizações</p></div><div><p className="text-xs text-slate-500">Variação da audiência</p><p className={`mt-1 font-bold ${growth !== null && growth < 0 ? 'text-amber-700' : 'text-emerald-700'}`}>{previousPartial ? 'Histórico insuficiente' : growth === null ? 'Sem base para comparação' : `${growth > 0 ? '+' : ''}${growth.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`}</p></div><div><p className="text-xs text-slate-500">Média acumulada por notícia</p><p className="mt-1 font-bold">{data.posts.total ? format(Math.round(data.posts.views / data.posts.total)) : '0'} visualizações</p></div></div>
        {partial && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Histórico parcial: o acompanhamento por data começou em {data.audience.started_at ? dateLabel(data.audience.started_at.slice(0, 10)) : 'data ainda não registrada'}. As visualizações anteriores permanecem apenas no total acumulado.</p>}
        <div className="mt-6 overflow-x-auto"><div className="flex h-52 items-end gap-1 border-b border-slate-200 pb-1" style={{ minWidth: period === 'week' ? 280 : 560 }}>{[...buckets].map(([day, value]) => <div key={day} className="group relative flex h-full min-w-0 flex-1 items-end justify-center" title={`${day}: ${format(value)} visualizações`}><div className="w-full rounded-t bg-sky-500 transition-colors hover:bg-sky-700" style={{ height: `${value ? Math.max(2, value / max * 100) : 0}%` }} /><span className="sr-only">{day}: {format(value)} visualizações</span></div>)}</div><div className="mt-2 flex justify-between text-xs text-slate-500"><span>{dateLabel(data.audience.start)}</span><span>{period === 'year' ? 'Totais agrupados por mês' : 'Totais por dia'}</span><span>{dateLabel(new Date(new Date(`${data.audience.end}T00:00:00Z`).getTime() - 86400000).toISOString().slice(0, 10))}</span></div></div>
        {data.audience.current === 0 && <p className="mt-4 text-sm text-slate-500">Nenhuma visualização registrada neste período.</p>}
        <p className="mt-4 text-xs text-slate-500">Visualizações são acessos contabilizados pela API, incluindo acessos repetidos; não representam visitantes únicos.</p>
      </section>
    </>}
  </div>
}
