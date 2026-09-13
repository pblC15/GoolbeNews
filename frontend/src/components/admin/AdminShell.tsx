'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { HiOutlineHome, HiOutlineDocumentText, HiOutlineFolder, HiOutlineUsers, HiOutlineLogout, HiOutlinePlusCircle, HiOutlineExternalLink } from 'react-icons/hi'
import { adminApi } from '@/lib/adminApi'
import { getSiteBase } from '@/lib/site'

const nav = [
  ['/admin', 'Visão geral', HiOutlineHome],
  ['/admin/posts', 'Notícias', HiOutlineDocumentText],
  ['/admin/categories', 'Categorias', HiOutlineFolder],
  ['/admin/users', 'Utilizadores', HiOutlineUsers],
] as const

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [siteBase, setSiteBase] = useState('')

  useEffect(() => {
    adminApi('/auth/me').then((d) => setUser(d.user)).catch(() => {})
    setSiteBase(getSiteBase())
  }, [])

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="border-r bg-slate-950 text-white lg:sticky lg:top-0 lg:min-h-screen">
        <div className="flex items-center justify-between px-5 py-5">
          <Link href="/admin" className="text-xl font-black tracking-tight">Goolbe<span className="text-sky-400">News</span> Admin</Link>
        </div>
        <nav className="px-3 pb-5">
          {nav.map(([href, label, Icon]) => (
            <Link key={href} href={href} className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${path === href || (href !== '/admin' && path.startsWith(href)) ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
              <Icon className="h-5 w-5" />{label}
            </Link>
          ))}
          <a
            href={siteBase}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 px-3 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
          >
            <HiOutlineExternalLink className="h-5 w-5" /> Ver site publicado
          </a>
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 sm:px-7">
          <div>
            <p className="text-xs text-slate-500">Painel editorial</p>
            <p className="font-semibold text-slate-900">{user?.name || 'Carregando...'}</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={siteBase}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:flex"
            >
              <HiOutlineExternalLink /> Ver site
            </a>
            <Link href="/admin/posts/new" className="hidden items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 sm:flex">
              <HiOutlinePlusCircle /> Nova notícia
            </Link>
            <button onClick={logout} className="rounded-xl border px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
              <HiOutlineLogout className="inline mr-1" />Sair
            </button>
          </div>
        </header>
        <main className="p-4 sm:p-7">{children}</main>
      </div>
    </div>
  )
}
