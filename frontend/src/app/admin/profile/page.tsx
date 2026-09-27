'use client'
import { useEffect, useRef, useState } from 'react'
import { HiOutlineArrowsExpand, HiOutlineCamera, HiOutlineLockClosed, HiOutlineTrash } from 'react-icons/hi'
import { adminApi } from '@/lib/adminApi'
import AvatarCropper from '@/components/admin/AvatarCropper'

const BIO_MAX = 90
const PROFESSION_MAX = 80

type Profile = {
  id: number
  name: string
  email: string
  role: 'admin' | 'editor'
  avatar_url: string | null
  profession: string | null
  bio: string | null
  categories: { id: number; name: string; slug: string }[]
}

function Initials({ name, className }: { name: string; className: string }) {
  const txt = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  return <span className={`grid place-items-center rounded-full bg-slate-900 font-black text-white ${className}`}>{txt}</span>
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [cats, setCats] = useState<any[]>([])
  const [avatar, setAvatar] = useState<string | null>(null)
  const [profession, setProfession] = useState('')
  const [bio, setBio] = useState('')
  const [selected, setSelected] = useState<number[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  // arquivo aberto no editor de posição; o último escolhido fica guardado para "Ajustar posição"
  const [cropFile, setCropFile] = useState<File | null>(null)
  const [sourceFile, setSourceFile] = useState<File | null>(null)

  // troca de senha
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [pwFeedback, setPwFeedback] = useState<{ ok: boolean; text: string } | null>(null)
  const [pwSaving, setPwSaving] = useState(false)

  useEffect(() => {
    Promise.all([adminApi('/users/me'), adminApi('/categories')]).then(([p, c]) => {
      setProfile(p)
      setCats(c)
      setAvatar(p.avatar_url)
      setProfession(p.profession || '')
      setBio(p.bio || '')
      setSelected(p.categories.map((x: any) => x.id))
    })
  }, [])

  // 1) escolher o arquivo → abre o editor para posicionar
  function pickAvatar(file?: File) {
    if (fileRef.current) fileRef.current.value = ''
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return setFeedback({ ok: false, text: 'Escolha um arquivo de imagem (JPG, PNG ou WebP).' })
    if (file.size > 5 * 1024 * 1024) return setFeedback({ ok: false, text: 'A foto deve ter no máximo 5 MB.' })
    setFeedback(null)
    setSourceFile(file)
    setCropFile(file)
  }

  // 2) depois de posicionar → envia só o recorte (quadrado 400x400)
  async function uploadCropped(blob: Blob) {
    setUploading(true)
    setFeedback(null)
    try {
      const fd = new FormData()
      fd.append('file', new File([blob], 'avatar.jpg', { type: 'image/jpeg' }))
      const r = await adminApi('/upload?variant=avatar', { method: 'POST', body: fd })
      setAvatar(r.file.url)
      setCropFile(null)
      setFeedback({ ok: true, text: 'Foto posicionada. Clique em "Salvar perfil" para confirmar.' })
    } catch (e: any) {
      setFeedback({ ok: false, text: e.message })
    } finally {
      setUploading(false)
    }
  }

  async function save() {
    setSaving(true)
    setFeedback(null)
    try {
      const p = await adminApi('/users/me', {
        method: 'PUT',
        body: JSON.stringify({
          avatar_url: avatar || null,
          profession: profession.trim() || null,
          bio: bio.trim() || null,
          category_ids: selected,
        }),
      })
      setProfile(p)
      setFeedback({ ok: true, text: 'Perfil salvo. As alterações já aparecem nas suas notícias.' })
      // avisa o cabeçalho do painel para atualizar a foto
      window.dispatchEvent(new Event('profile-updated'))
    } catch (e: any) {
      setFeedback({ ok: false, text: e.message })
    } finally {
      setSaving(false)
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwFeedback(null)
    if (pw.next.length < 8) return setPwFeedback({ ok: false, text: 'A nova senha deve ter pelo menos 8 caracteres.' })
    if (pw.next !== pw.confirm) return setPwFeedback({ ok: false, text: 'A confirmação não é igual à nova senha.' })
    setPwSaving(true)
    try {
      await adminApi('/users/me/password', {
        method: 'PUT',
        body: JSON.stringify({ current_password: pw.current, new_password: pw.next }),
      })
      setPw({ current: '', next: '', confirm: '' })
      setPwFeedback({ ok: true, text: 'Senha alterada.' })
    } catch (e: any) {
      setPwFeedback({ ok: false, text: e.message })
    } finally {
      setPwSaving(false)
    }
  }

  const toggleCat = (id: number) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  if (!profile) return <p className="text-slate-500">Carregando perfil...</p>

  const selectedCats = cats.filter((c) => selected.includes(c.id))

  return (
    <div className="space-y-6">
      {cropFile && <AvatarCropper file={cropFile} onCancel={() => setCropFile(null)} onConfirm={uploadCropped} />}
      <div>
        <h1 className="text-3xl font-black">Meu perfil</h1>
        <p className="text-slate-500">Estas informações aparecem na sessão do autor, no final de cada notícia que você assina.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="space-y-6 rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
          {/* Foto */}
          <div className="flex flex-wrap items-center gap-5">
            <div className="relative">
              {avatar ? (
                <img src={avatar} alt="Foto do perfil" className="h-24 w-24 rounded-full object-cover ring-4 ring-slate-100" />
              ) : (
                <Initials name={profile.name} className="h-24 w-24 text-2xl ring-4 ring-slate-100" />
              )}
              {uploading && <span className="absolute inset-0 grid place-items-center rounded-full bg-white/80 text-xs font-semibold">Enviando...</span>}
            </div>
            <div className="space-y-2">
              <p className="font-bold">Foto do autor</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60">
                  <HiOutlineCamera className="h-4 w-4" /> {avatar ? 'Trocar foto' : 'Enviar foto'}
                </button>
                {sourceFile && avatar && (
                  <button type="button" onClick={() => setCropFile(sourceFile)} disabled={uploading} className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <HiOutlineArrowsExpand className="h-4 w-4" /> Ajustar posição
                  </button>
                )}
                {avatar && (
                  <button type="button" onClick={() => { setAvatar(null); setSourceFile(null) }} className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                    <HiOutlineTrash className="h-4 w-4" /> Remover
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500">JPG, PNG ou WebP até 5 MB. Depois de escolher, você posiciona a foto antes de enviar.</p>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => pickAvatar(e.target.files?.[0])} />
            </div>
          </div>

          {/* Nome (bloqueado) */}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold">
              Nome
              <div className="relative mt-1">
                <input value={profile.name} disabled className="w-full cursor-not-allowed rounded-xl border bg-slate-100 px-3 py-3 pr-10 text-slate-600" />
                <HiOutlineLockClosed className="absolute right-3 top-3.5 h-5 w-5 text-slate-400" />
              </div>
              <span className="mt-1 block text-xs font-normal text-slate-500">O nome assina as suas notícias e não pode ser alterado.</span>
            </label>
            <label className="block text-sm font-semibold">
              Email de acesso
              <input value={profile.email} disabled className="mt-1 w-full cursor-not-allowed rounded-xl border bg-slate-100 px-3 py-3 text-slate-600" />
              <span className="mt-1 block text-xs font-normal text-slate-500">Para alterar, fale com um administrador.</span>
            </label>
          </div>

          {/* Profissão */}
          <label className="block text-sm font-semibold">
            Profissão
            <input
              value={profession}
              onChange={(e) => setProfession(e.target.value.slice(0, PROFESSION_MAX))}
              maxLength={PROFESSION_MAX}
              placeholder="Ex.: Jornalista de economia"
              className="mt-1 w-full rounded-xl border px-3 py-3 outline-none focus:border-sky-500"
            />
          </label>

          {/* Descrição */}
          <label className="block text-sm font-semibold">
            Descrição breve
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX))}
              maxLength={BIO_MAX}
              rows={2}
              placeholder="Ex.: Cobre mercado financeiro e política monetária há 10 anos."
              className="mt-1 w-full resize-none rounded-xl border px-3 py-3 outline-none focus:border-sky-500"
            />
            <span className={`mt-1 block text-right text-xs font-normal tabular-nums ${bio.length >= BIO_MAX ? 'text-amber-600' : 'text-slate-400'}`}>
              {bio.length}/{BIO_MAX}
            </span>
          </label>

          {/* Categorias */}
          <fieldset>
            <legend className="text-sm font-semibold">Categorias pelas quais é responsável</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {cats.map((c) => {
                const on = selected.includes(c.id)
                return (
                  <label key={c.id} className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm transition ${on ? 'border-sky-600 bg-sky-600 text-white' : 'bg-white text-slate-700 hover:border-sky-300'}`}>
                    <input type="checkbox" className="sr-only" checked={on} onChange={() => toggleCat(c.id)} />
                    {c.name}
                  </label>
                )
              })}
              {!cats.length && <p className="text-sm text-slate-500">Nenhuma categoria cadastrada.</p>}
            </div>
          </fieldset>

          <div className="flex flex-wrap items-center gap-3 border-t pt-5">
            <button onClick={save} disabled={saving || uploading} className="rounded-xl bg-sky-600 px-5 py-2.5 font-semibold text-white hover:bg-sky-700 disabled:opacity-60">
              {saving ? 'Salvando...' : 'Salvar perfil'}
            </button>
            {feedback && <p role="status" className={`text-sm font-semibold ${feedback.ok ? 'text-emerald-600' : 'text-red-500'}`}>{feedback.text}</p>}
          </div>
        </section>

        <div className="space-y-6">
          {/* Pré-visualização */}
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="mb-3 text-sm font-bold text-slate-500">Como aparece nas notícias</p>
            <div className="flex gap-4 rounded-2xl bg-slate-100/70 p-4">
              {avatar ? <img src={avatar} alt="" className="h-14 w-14 shrink-0 rounded-full object-cover" /> : <Initials name={profile.name} className="h-14 w-14 shrink-0 text-base" />}
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-500">Escrito por</p>
                <p className="font-black leading-tight">{profile.name}</p>
                {profession.trim() && <p className="text-sm font-semibold text-sky-700">{profession}</p>}
                {bio.trim() && <p className="mt-1.5 text-sm leading-6 text-slate-600">{bio}</p>}
                {selectedCats.length > 0 && (
                  <p className="mt-2 text-xs text-slate-500">Cobre: {selectedCats.map((c) => c.name).join(', ')}</p>
                )}
              </div>
            </div>
          </section>

          {/* Senha */}
          <form onSubmit={changePassword} className="space-y-3 rounded-2xl border bg-white p-5 shadow-sm">
            <p className="font-bold">Alterar senha</p>
            <input type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} placeholder="Senha atual" className="w-full rounded-xl border px-3 py-3" required />
            <input type="password" autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} placeholder="Nova senha (mín. 8 caracteres)" className="w-full rounded-xl border px-3 py-3" required />
            <input type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} placeholder="Confirmar nova senha" className="w-full rounded-xl border px-3 py-3" required />
            <button disabled={pwSaving} className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60">
              {pwSaving ? 'Alterando...' : 'Alterar senha'}
            </button>
            {pwFeedback && <p role="status" className={`text-sm font-semibold ${pwFeedback.ok ? 'text-emerald-600' : 'text-red-500'}`}>{pwFeedback.text}</p>}
          </form>
        </div>
      </div>
    </div>
  )
}
