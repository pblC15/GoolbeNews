// frontend/src/app/layout.tsx
import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ADSENSE_CLIENT_ID } from '@/lib/ads'

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
  // Confirma a propriedade do site para o Google AdSense (recomendado pelo Google
  // além do ads.txt em /ads.txt).
  other: { 'google-adsense-account': ADSENSE_CLIENT_ID },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-gray-50">
        <Script
          id="adsbygoogle-loader"
          async
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
          crossOrigin="anonymous"
        />
        <Header />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
