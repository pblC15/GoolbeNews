'use client'
import { useEffect, useId, useRef, useState } from 'react'
import { HiOutlineMail, HiCheck } from 'react-icons/hi'

type Props = {
  title?: string
  description?: string
  source?: string
  variant?: 'light' | 'dark'
  className?: string
}

// Mesma regra do servidor: só caracteres válidos em endereços de email reais.
// Recusa <, >, aspas, espaços, ponto e vírgula etc. (tentativas de injetar scripts).
const EMAIL_RE = /^[a-z0-9](?:[a-z0-9._%+-]{0,62}[a-z0-9])?@(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/
const EMAIL_MAX = 190

/** Origem da inscrição enviada ao servidor: apenas letras minúsculas, números e hífen */
function toSourceSlug(v: string) {
  return v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9-]+/g, '-').replace(/-{2,}/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'site'
}

export default function NewsletterSignup({
  title = 'Receba as notícias no seu email',
  description = 'Inscreva-se e seja avisado assim que publicarmos uma nova notícia. Sem spam.',
  source = 'site',
  variant = 'light',
  className = '',
}: Props) {
  const uid = useId()
  const inputId = `newsletter-email-${uid}`
  const errorId = `newsletter-error-${uid}`
  const successRef = useRef<HTMLDivElement>(null)

  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // leva o foco para a mensagem de sucesso (leitores de tela anunciam a mudança)
  useEffect(() => {
    if (status === 'success') successRef.current?.focus()
  }, [status])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const value = email.trim().toLowerCase()

    // validação no navegador antes de chamar a API
    if (!value) {
      setStatus('error')
      setError('Informe o seu email.')
      return
    }
    if (value.length > EMAIL_MAX || !EMAIL_RE.test(value)) {
      setStatus('error')
      setError('Informe um email válido, por exemplo: nome@email.com')
      return
    }

    setStatus('loading')
    setError('')
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE
      const res = await fetch(`${base}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value, source: toSourceSlug(source) }),
      })
      const data = await res.json().catch(() => ({}))
      // 409 = email já cadastrado; 400 = email inválido; 429 = muitas tentativas; 500 = falha no servidor
      if (!res.ok) throw new Error(data.error || 'Não foi possível concluir a inscrição. Tente novamente.')
      setSuccessMessage(data.message || 'Email cadastrado com sucesso!')
      setStatus('success')
    } catch (err: any) {
      setStatus('error')
      setError(
        err?.name === 'TypeError'
          ? 'Sem ligação ao servidor. Verifique a sua internet e tente novamente.'
          : err.message
      )
    }
  }

  // ---------- Estado de sucesso: substitui todo o conteúdo da sessão ----------
  // Não há como reenviar: a sessão fica sem ação até a página ser recarregada.
  if (status === 'success') {
    return (
      <section className={`nl-success overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-6 text-white sm:p-8 ${className}`}>
        <div
          ref={successRef}
          tabIndex={-1}
          role="status"
          className="flex flex-col items-center gap-4 py-2 text-center outline-none sm:flex-row sm:text-left"
        >
          <span className="nl-success-icon grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white text-emerald-600 shadow-lg shadow-emerald-900/20">
            <HiCheck className="h-8 w-8" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-xl font-black tracking-tight">Inscrição confirmada</h3>
            <p className="mt-1 text-sm text-emerald-50">{successMessage}</p>
          </div>
        </div>
      </section>
    )
  }

  const dark = variant === 'dark'
  const hasError = status === 'error' && !!error

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

        <form
          onSubmit={submit}
          noValidate
          className="flex w-full max-w-md shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-start"
        >
          <div className="w-full sm:w-64">
            <label className="sr-only" htmlFor={inputId}>
              Email
            </label>
            <input
              id={inputId}
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={EMAIL_MAX}
              spellCheck={false}
              autoCapitalize="none"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (status === 'error') { setStatus('idle'); setError('') }
              }}
              placeholder="seu@email.com"
              disabled={status === 'loading'}
              aria-invalid={hasError}
              aria-describedby={hasError ? errorId : undefined}
              className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                dark
                  ? 'bg-slate-900 text-white placeholder:text-slate-500 focus:border-sky-400'
                  : 'bg-slate-50 focus:border-sky-500 focus:bg-white'
              } ${hasError ? 'border-red-500' : dark ? 'border-slate-700' : 'border-slate-200'}`}
            />
            {hasError && (
              <p id={errorId} role="alert" className="mt-1.5 text-xs font-semibold text-red-500">
                {error}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full shrink-0 rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-700 disabled:opacity-60 sm:w-auto"
          >
            {status === 'loading' ? 'Enviando...' : 'Inscrever-me'}
          </button>
        </form>
      </div>
    </section>
  )
}
