// frontend/src/components/CategoryDrawer.tsx
'use client'
import { Drawer, DrawerHeader, DrawerItems } from 'flowbite-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'


export default function CategoryDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [cats, setCats] = useState<any[]>([])

    useEffect(() => { api('/categories').then(setCats).catch(()=>{}) }, [])
    
    return (
    <Drawer open={open} onClose={onClose} position="left">
        <DrawerHeader title="Categorias" />
        <DrawerItems>
            <ul className="space-y-2">
                {cats.map(c => (
                <li key={c.id}>
                    <Link href={`/categoria/${c.slug}`} onClick={onClose} className="block rounded px-2 py-1 hover:bg-gray-100">{c.name}</Link>
                </li>
                ))}
            </ul>
        </DrawerItems>
    </Drawer>
    )
}