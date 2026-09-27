'use client'
import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/adminApi'

type Msg = { id: number; name: string; email: string; subject: string; message: string; read_at: string | null; created_at: string }

const fmt = (d: string) => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(d))

export default function MessagesPage() {
  const [items, setItems] = useState<Msg[] | null>(null)
  const [open, setOpen] = useState<number | null>(null)
  const [error, setError] = useState('')

  const load = () => adminApi('/contact').then(setItems).catch((e) => setError(e.message))
  useEffect(() => { load() }, [])

  async function toggle(m: Msg) {
    const opening = open !== m.id
    setOpen(opening ? m.id : null)
    // abrir uma mensagem não lida marca-a como lida
    if (opening && !m.read_at) {
      await adminApi(`/contact/${m.id}/read`, { method: 'PATCH', body: JSON.stringify({ read: true }) }).catch(() => {})
      setItems((list) => list?.map((x) => (x.id === m.id ? { ...x, read_at: new Date().toISOString() } : x)) ?? null)
    }
  }

  async function markUnread(m: Msg) {
    await adminApi(`/contact/${m.id}/read`, { method: 'PATCH', body: JSON.stringify({ read: false }) })
    setItems((list) => list?.map((x) => (x.id === m.id ? { ...x, read_at: null } : x)) ?? null)
    setOpen(null)
  }

  async function del(m: Msg) {
    if (!confirm(`Excluir a mensagem de ${m.name}?`)) return
    try { await adminApi(`/contact/${m.id}`, { method: 'DELETE' }); load() } catch (e: any) { alert(e.message) }
  }

  const unread = items?.filter((m) => !m.read_at).length ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Mensagens</h1>
        <p className="text-slate-500">
          Recebidas pela página de Contato do site{items ? `. ${unread} não lida${unread === 1 ? '' : 's'}.` : '.'}
        </p>
      </div>

      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {!items && !error && <p className="text-slate-500">Carregando...</p>}
      {items && !items.length && (
        <div className="rounded-2xl border bg-white p-10 text-center text-slate-500">Ainda não chegaram mensagens.</div>
      )}

      {items && items.length > 0 && (
        <section className="divide-y overflow-hidden rounded-2xl border bg-white shadow-sm">
          {items.map((m) => (
            <div key={m.id}>
              <button onClick={() => toggle(m)} aria-expanded={open === m.id} className="flex w-full items-start gap-3 p-4 text-left hover:bg-slate-50">
                <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${m.read_at ? 'bg-transparent' : 'bg-sky-600'}`} aria-label={m.read_at ? 'Lida' : 'Não lida'} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className={`truncate ${m.read_at ? 'text-slate-700' : 'font-bold text-slate-950'}`}>{m.subject}</p>
                    <time className="shrink-0 text-xs text-slate-400">{fmt(m.created_at)}</time>
                  </div>
                  <p className="truncate text-sm text-slate-500">{m.name}, {m.email}</p>
                </div>
              </button>
              {open === m.id && (
                <div className="border-t bg-slate-50 px-4 py-4 pl-9">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{m.message}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a href={`mailto:${m.email}?subject=${encodeURIComponent('Re: ' + m.subject)}`} className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-700">Responder por email</a>
                    <button onClick={() => markUnread(m)} className="rounded-lg border bg-white px-3 py-2 text-sm">Marcar como não lida</button>
                    <button onClick={() => del(m)} className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-red-700">Excluir</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
