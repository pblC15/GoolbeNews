'use client'
import { useEffect, useState } from 'react'
import { HiOutlineLockClosed } from 'react-icons/hi'
import { adminApi } from '@/lib/adminApi'

const blank = { name: '', email: '', password: '', role: 'editor', active: true }

export default function Users() {
  const [items, setItems] = useState<any[]>([])
  const [form, setForm] = useState<any>(blank)
  const [editing, setEditing] = useState<any>(null)
  const [me, setMe] = useState<number | null>(null)

  const load = () => adminApi('/users').then(setItems)
  useEffect(() => {
    load()
    adminApi('/auth/me').then((d) => setMe(Number(d.user?.id))).catch(() => {})
  }, [])

  async function save() {
    try {
      // ao editar, o nome não é enviado: ele não pode ser alterado depois de criado
      const b = editing
        ? { email: editing.email, role: editing.role, active: !!editing.active, password: editing.password || undefined }
        : form
      await adminApi(editing ? `/users/${editing.id}` : '/users', { method: editing ? 'PUT' : 'POST', body: JSON.stringify(b) })
      setForm(blank)
      setEditing(null)
      load()
    } catch (e: any) {
      alert(e.message)
    }
  }

  async function del(u: any) {
    if (!confirm(`Excluir o utilizador ${u.name}?`)) return
    try {
      await adminApi(`/users/${u.id}`, { method: 'DELETE' })
      load()
    } catch (e: any) {
      alert(e.message)
    }
  }

  const f = editing || form
  const setF = (v: any) => (editing ? setEditing(v) : setForm(v))
  const isSelf = editing && editing.id === me

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Utilizadores</h1>
        <p className="text-slate-500">Controle quem pode publicar e administrar o portal.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <section className="h-fit rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="font-bold">{editing ? 'Editar utilizador' : 'Novo utilizador'}</h2>
          <div className="mt-4 space-y-3">
            <div>
              <div className="relative">
                <input
                  value={f.name}
                  onChange={(e) => setF({ ...f, name: e.target.value })}
                  placeholder="Nome (assinatura das notícias)"
                  disabled={!!editing}
                  className={`w-full rounded-xl border px-3 py-3 ${editing ? 'cursor-not-allowed bg-slate-100 pr-10 text-slate-600' : ''}`}
                />
                {editing && <HiOutlineLockClosed className="absolute right-3 top-3.5 h-5 w-5 text-slate-400" />}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {editing ? 'O nome não pode ser alterado depois de criado.' : 'Confira a grafia: depois de criado, o nome não pode ser alterado.'}
              </p>
            </div>
            <input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="Email" className="w-full rounded-xl border px-3 py-3" />
            <input type="password" value={f.password || ''} onChange={(e) => setF({ ...f, password: e.target.value })} placeholder={editing ? 'Nova senha (opcional)' : 'Senha (mín. 8 caracteres)'} className="w-full rounded-xl border px-3 py-3" />
            <select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} disabled={isSelf} className="w-full rounded-xl border px-3 py-3 disabled:bg-slate-100">
              <option value="editor">Editor</option>
              <option value="admin">Administrador</option>
            </select>
            <label className="flex gap-2 text-sm">
              <input type="checkbox" checked={!!f.active} disabled={isSelf} onChange={(e) => setF({ ...f, active: e.target.checked })} /> Conta ativa
            </label>
            {isSelf && <p className="text-xs text-slate-500">Não é possível alterar o próprio acesso nem desativar a própria conta.</p>}
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={save} className="rounded-xl bg-sky-600 px-4 py-2 font-semibold text-white">{editing ? 'Atualizar' : 'Criar'}</button>
            {editing && <button onClick={() => setEditing(null)} className="rounded-xl border px-4 py-2">Cancelar</button>}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="divide-y">
            {items.map((u) => (
              <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
                  ) : (
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-slate-900 text-sm font-black text-white">
                      {String(u.name).split(/\s+/).slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold">{u.name}{u.profession && <span className="font-normal text-slate-500">, {u.profession}</span>}</p>
                    <p className="text-sm text-slate-500">{u.email}</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs">{u.role}</span>
                      <span className={`rounded px-2 py-0.5 text-xs ${u.active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{u.active ? 'Ativo' : 'Inativo'}</span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs">{Number(u.post_count) || 0} notícia(s)</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditing({ ...u, active: !!u.active, password: '' })} className="rounded-lg border px-3 py-2 text-sm">Editar</button>
                  {Number(u.post_count) > 0 ? (
                    <button disabled title="Quem assina notícias não pode ser excluído. Desative a conta." className="cursor-not-allowed rounded-lg border px-3 py-2 text-sm text-slate-300">Excluir</button>
                  ) : (
                    <button onClick={() => del(u)} className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700">Excluir</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
