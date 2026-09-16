'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { HiOutlineMail } from 'react-icons/hi'
import { api } from '@/lib/api'

export default function Footer() {
  const pathname = usePathname()
  const [cats, setCats] = useState<any[]>([])

  useEffect(() => {
    api('/categories').then(setCats).catch(() => {})
  }, [])

  // Mantém o rodapé fora do painel administrativo, exceto na tela de login,
  // onde o utilizador precisa conseguir voltar/navegar pelo site público.
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') return null

  return (
    <footer className="mt-16 border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="text-xl font-black tracking-[-.04em] text-slate-950">
              Goolbe<span className="text-sky-600">News</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-slate-500">
              Notícias com contexto, sem ruído: cobertura clara e atualizada de Brasil e do mundo.
            </p>
          </div>

          {cats.length > 0 && (
            <div>
              <p className="text-xs font-black uppercase tracking-[.15em] text-slate-400">Categorias</p>
              <ul className="mt-4 space-y-2.5">
                {cats.slice(0, 8).map((c: any) => (
                  <li key={c.id}>
                    <Link href={`/categoria/${c.slug}`} className="text-sm text-slate-600 hover:text-sky-700">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className="text-xs font-black uppercase tracking-[.15em] text-slate-400">Institucional</p>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/" className="text-sm text-slate-600 hover:text-sky-700">
                  Página inicial
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-sm text-slate-600 hover:text-sky-700">
                  Área editorial
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[.15em] text-slate-400">Newsletter</p>
            <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-slate-500">
              <HiOutlineMail className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
              Inscreva-se em qualquer notícia do site para receber as próximas publicações por email.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} GoolbeNews. Todos os direitos reservados.</p>
          <p>Informação organizada para leitura rápida e clara.</p>
        </div>
      </div>
    </footer>
  )
}
