'use client'
import { useState } from 'react'
import { HiCheck } from 'react-icons/hi'

type Fields = { name: string; email: string; subject: string; message: string }
type Errors = Partial<Record<keyof Fields, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const blank: Fields = { name: '', email: '', subject: '', message: '' }

function validate(f: Fields): Errors {
  const e: Errors = {}
  if (f.name.trim().length < 2) e.name = 'Informe o seu nome.'
  if (!EMAIL_RE.test(f.email.trim())) e.email = 'Informe um email válido, por exemplo: nome@email.com'
  if (f.subject.trim().length < 3) e.subject = 'Informe o assunto.'
  if (f.message.trim().length < 10) e.message = 'A mensagem deve ter pelo menos 10 caracteres.'
  return e
}

export default function ContactForm() {
  const [f, setF] = useState<Fields>(blank)
  const [errors, setErrors] = useState<Errors>({})
  const [serverError, setServerError] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  // campo invisível contra robôs de spam
  const [website, setWebsite] = useState('')

  function set<K extends keyof Fields>(k: K, v: string) {
    setF((prev) => ({ ...prev, [k]: v }))
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: undefined }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate(f)
    setErrors(errs)
    setServerError('')
    if (Object.keys(errs).length) return
    setSending(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, website }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Não foi possível enviar a mensagem.')
      setSent(true)
    } catch (err: any) {
      setServerError(err?.name === 'TypeError' ? 'Sem ligação ao servidor. Tente novamente em instantes.' : err.message)
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div role="status" className="nl-success flex items-start gap-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-6 text-white">
        <span className="nl-success-icon grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-emerald-600">
          <HiCheck className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <p className="text-lg font-black">Mensagem enviada</p>
          <p className="mt-1 text-sm text-emerald-50">Obrigado pelo contato, {f.name.split(' ')[0]}. Respondemos para {f.email} assim que possível.</p>
        </div>
      </div>
    )
  }

  const input = (k: keyof Fields) =>
    `mt-1.5 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-500 ${
      errors[k] ? 'border-red-500' : 'border-slate-200'
    }`
  const err = (k: keyof Fields) =>
    errors[k] ? <p id={`contact-${k}-error`} className="mt-1.5 text-xs font-semibold text-red-500">{errors[k]}</p> : null
  const aria = (k: keyof Fields) => ({
    'aria-invalid': !!errors[k],
    'aria-describedby': errors[k] ? `contact-${k}-error` : undefined,
  })

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-bold text-slate-800">
          Nome
          <input value={f.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" maxLength={120} className={input('name')} {...aria('name')} />
          {err('name')}
        </label>
        <label className="block text-sm font-bold text-slate-800">
          Email
          <input type="email" inputMode="email" value={f.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" maxLength={190} className={input('email')} {...aria('email')} />
          {err('email')}
        </label>
      </div>
      <label className="block text-sm font-bold text-slate-800">
        Assunto
        <input value={f.subject} onChange={(e) => set('subject', e.target.value)} maxLength={160} className={input('subject')} {...aria('subject')} />
        {err('subject')}
      </label>
      <label className="block text-sm font-bold text-slate-800">
        Mensagem
        <textarea value={f.message} onChange={(e) => set('message', e.target.value)} rows={6} maxLength={5000} className={`${input('message')} resize-y`} {...aria('message')} />
        {err('message')}
      </label>

      {/* armadilha para robôs: invisível para pessoas */}
      <div className="hidden" aria-hidden="true">
        <label>Site<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
      </div>

      {serverError && <p role="alert" className="text-sm font-semibold text-red-500">{serverError}</p>}

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={sending} className="rounded-xl bg-sky-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-sky-700 disabled:opacity-60">
          {sending ? 'Enviando...' : 'Enviar mensagem'}
        </button>
        <p className="text-xs text-slate-500">Usamos estes dados apenas para responder ao seu contato.</p>
      </div>
    </form>
  )
}
