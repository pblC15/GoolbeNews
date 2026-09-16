'use client'
import { useState } from 'react'
import { HiOutlineMail, HiCheckCircle } from 'react-icons/hi'

type Props = {
  title?: string
  description?: string
  source?: string
  variant?: 'light' | 'dark'
  className?: string
}

export default function NewsletterSignup({
  title = 'Receba as notícias no seu email',
  description = 'Inscreva-se e seja avisado assim que publicarmos uma nova notícia. Sem spam.',
  source = 'site',
  variant = 'light',
  className = '',
}: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    setMessage('')
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE
      const res = await fetch(`${base}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Não foi possível concluir a inscrição.')
      setStatus('success')
      setMessage(data.message || 'Inscrição confirmada!')
      setEmail('')
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message || 'Erro ao inscrever. Tente novamente.')
    }
  }

  const dark = variant === 'dark'

  return (
    <section
      className={`rounded-3xl border p-6 sm:p-8 ${
        dark ? 'border-slate-800 bg-slate-950 text-white' : 'border-slate-200 bg-white'
      } ${className}`}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span
            className={`mt-0.5 rounded-full p-2 ${dark ? 'bg-sky-500/15 text-sky-300' : 'bg-sky-50 text-sky-600'}`}
          >
            <HiOutlineMail className="h-5 w-5" />
          </span>
          <div>
            <h3 className={`text-lg font-black tracking-tight ${dark ? 'text-white' : 'text-slate-950'}`}>
              {title}
            </h3>
            <p className={`mt-1 text-sm ${dark ? 'text-slate-300' : 'text-slate-500'}`}>{description}</p>
          </div>
        </div>

        <form onSubmit={submit} className="flex w-full max-w-md shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
          <label className="sr-only" htmlFor={`newsletter-email-${source}`}>
            Email
          </label>
          <input
            id={`newsletter-email-${source}`}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            disabled={status === 'loading'}
            className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition sm:w-64 ${
              dark
                ? 'border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:border-sky-400'
                : 'border-slate-200 bg-slate-50 focus:border-sky-500 focus:bg-white'
            }`}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full shrink-0 rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-700 disabled:opacity-60 sm:w-auto"
          >
            {status === 'loading' ? 'A enviar...' : 'Inscrever-me'}
          </button>
        </form>
      </div>

      {message && (
        <p
          className={`mt-4 flex items-center gap-2 text-sm font-semibold ${
            status === 'error' ? 'text-red-500' : dark ? 'text-emerald-300' : 'text-emerald-600'
          }`}
        >
          {status === 'success' && <HiCheckCircle className="h-4 w-4 shrink-0" />}
          {message}
        </p>
      )}
    </section>
  )
}
