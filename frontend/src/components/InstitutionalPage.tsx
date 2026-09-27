import Link from 'next/link'
import { INSTITUTIONAL_LINKS } from '@/lib/site'
import NewsletterSignup from '@/components/NewsletterSignup'

type Props = {
  /** caminho da página atual, para destacar no menu lateral */
  current: string
  title: string
  intro?: string
  updatedAt?: string
  children: React.ReactNode
}

/** Estrutura comum de Sobre nós, Contato, Política de Privacidade e Termos de Uso */
export default function InstitutionalPage({ current, title, intro, updatedAt, children }: Props) {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 py-4 lg:grid-cols-[220px_1fr]">
      <nav aria-label="Páginas institucionais" className="order-2 lg:order-1">
        <p className="mb-3 text-xs font-bold text-slate-400">Institucional</p>
        <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
          {INSTITUTIONAL_LINKS.map((l) => {
            const active = l.href === current
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? 'page' : undefined}
                  className={`block rounded-lg px-3 py-2 text-sm transition ${
                    active
                      ? 'bg-slate-900 font-bold text-white'
                      : 'text-slate-600 ring-1 ring-slate-200 hover:bg-white hover:text-sky-700 lg:ring-0'
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <article className="order-1 min-w-0 lg:order-2">
        <header className="border-b pb-6">
          <h1 className="text-4xl font-black leading-tight tracking-[-.03em] text-slate-950 sm:text-5xl">{title}</h1>
          {intro && <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">{intro}</p>}
          {updatedAt && <p className="mt-4 text-sm text-slate-400">Última atualização: {updatedAt}</p>}
        </header>
        <div className="max-w-3xl pt-2">{children}</div>
      </article>

      <div className="order-3 lg:col-span-2">
        <NewsletterSignup source={current.replace(/^\//, '')} variant="dark" />
      </div>
    </div>
  )
}
