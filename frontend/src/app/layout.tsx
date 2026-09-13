// frontend/src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_BASE ?? 'http://localhost:3000'
const SITE_NAME = 'GoolbeNews'
const SITE_DESCRIPTION =
  'GoolbeNews traz notícias com contexto, sem ruído: cobertura clara e atualizada de Brasil e do mundo, esporte, economia, tecnologia e cultura.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Notícias com contexto, sem ruído`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ['notícias', 'últimas notícias', 'Brasil', 'GoolbeNews', 'jornalismo', 'atualidades'],
  authors: [{ name: SITE_NAME }],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: SITE_NAME,
    url: SITE_URL,
    title: `${SITE_NAME} — Notícias com contexto, sem ruído`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Notícias com contexto, sem ruído`,
    description: SITE_DESCRIPTION,
  },
  icons: { icon: '/icon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
