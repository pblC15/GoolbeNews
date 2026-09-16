'use client'
import { useState } from 'react'
import { FaWhatsapp, FaFacebookF, FaXTwitter } from 'react-icons/fa6'
import { HiLink, HiCheck } from 'react-icons/hi'

type Props = {
  url: string
  title: string
  className?: string
}

export default function ShareButtons({ url, title, className = '' }: Props) {
  const [copied, setCopied] = useState(false)

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const links = [
    {
      name: 'WhatsApp',
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      icon: FaWhatsapp,
      className: 'bg-[#25D366] hover:bg-[#1DA851]',
    },
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: FaFacebookF,
      className: 'bg-[#1877F2] hover:bg-[#145FCB]',
    },
    {
      name: 'X',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: FaXTwitter,
      className: 'bg-slate-950 hover:bg-slate-800',
    },
  ]

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback silencioso para navegadores sem clipboard API
    }
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="mr-1 text-xs font-black uppercase tracking-[.15em] text-slate-500">Compartilhar</span>
      {links.map((l) => (
        <a
          key={l.name}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Compartilhar no ${l.name}`}
          title={`Compartilhar no ${l.name}`}
          className={`flex h-10 w-10 items-center justify-center rounded-full text-white shadow-sm transition ${l.className}`}
        >
          <l.icon className="h-4 w-4" />
        </a>
      ))}
      <button
        type="button"
        onClick={copyLink}
        aria-label="Copiar link da notícia"
        title="Copiar link"
        className={`flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-bold transition ${
          copied
            ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
            : 'border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:text-sky-700'
        }`}
      >
        {copied ? <HiCheck className="h-4 w-4" /> : <HiLink className="h-4 w-4" />}
        {copied ? 'Link copiado!' : 'Copiar link'}
      </button>
    </div>
  )
}
