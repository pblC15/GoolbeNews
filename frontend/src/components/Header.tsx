'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { HiMenu, HiSearch, HiOutlineViewGridAdd } from 'react-icons/hi'
import CategoryDrawer from './CategoryDrawer'
import HeaderLiveInfo from './HeaderLiveInfo'

export default function Header() {
  const [open, setOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsAdmin(typeof window !== 'undefined' && !!localStorage.getItem('token'))
  }, [pathname])

  if (pathname.startsWith('/admin')) return null

  return (
    <>
      <div className="bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 text-xs">
          <HeaderLiveInfo />
          {isAdmin ? (
            <Link href="/admin" className="flex shrink-0 items-center gap-1.5 rounded-full bg-sky-600/90 px-3 py-1 font-semibold text-white hover:bg-sky-500">
              <HiOutlineViewGridAdd className="h-3.5 w-3.5" /> Editora
            </Link>
          ) : (
            <Link href="/admin/login" className="shrink-0 text-slate-300 hover:text-white">Área editorial</Link>
          )}
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center gap-3 px-4">
          <button aria-label="Abrir categorias" onClick={() => setOpen(true)} className="rounded-full p-2.5 hover:bg-slate-100">
            <HiMenu className="h-6 w-6" />
          </button>
          <Link href="/" className="mr-auto text-2xl font-black tracking-[-.04em] text-slate-950">
            Goolbe<span className="text-sky-600">News</span>
          </Link>
          <form action="/" className="relative hidden sm:block">
            <HiSearch className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input name="q" placeholder="Pesquisar notícias" className="w-72 rounded-full border bg-slate-50 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-sky-500 focus:bg-white" />
          </form>
        </div>
        <CategoryDrawer open={open} onClose={() => setOpen(false)} />
      </header>
    </>
  )
}
