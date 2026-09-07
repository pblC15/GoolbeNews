'use client'
import { usePathname } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'
export default function AdminLayout({children}:{children:React.ReactNode}){const p=usePathname(); return p==='/admin/login'?<>{children}</>:<AdminShell>{children}</AdminShell>}
