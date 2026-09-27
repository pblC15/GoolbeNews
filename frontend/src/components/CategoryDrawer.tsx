// frontend/src/components/CategoryDrawer.tsx
'use client'
import { Drawer, DrawerHeader, DrawerItems } from 'flowbite-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { INSTITUTIONAL_LINKS } from '@/lib/site'

export default function CategoryDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [cats, setCats] = useState<any[]>([])

  useEffect(() => { api('/categories').then(setCats).catch(() => {}) }, [])

  return (
    <Drawer open={open} onClose={onClose} position="left">
      <DrawerHeader title="Menu" />
      <DrawerItems>
        <nav aria-label="Menu principal" className="space-y-6">
          <div>
            <p className="mb-2 px-2 text-xs font-bold text-slate-400">Categorias</p>
            <ul className="space-y-1">
              {cats.map(c => (
                <li key={c.id}>
                  <Link href={`/categoria/${c.slug}`} onClick={onClose} className="block rounded px-2 py-1.5 hover:bg-gray-100">{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t pt-5">
            <p className="mb-2 px-2 text-xs font-bold text-slate-400">Institucional</p>
            <ul className="space-y-1">
              {INSTITUTIONAL_LINKS.map(l => (
                <li key={l.href}>
                  <Link href={l.href} onClick={onClose} className="block rounded px-2 py-1.5 text-slate-600 hover:bg-gray-100">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </DrawerItems>
    </Drawer>
  )
}
