'use client'
import { useEffect, useId } from 'react'
import { ADSENSE_CLIENT_ID } from '@/lib/ads'

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

type Props = {
  /** ID do bloco de anúncio criado no painel do AdSense (data-ad-slot). */
  slot: string
  /** 'auto' para banners responsivos; 'fluid' para anúncios "in-article". */
  format?: string
  /** Usado junto com format="fluid" para anúncios dentro do texto da notícia. */
  layout?: 'in-article'
  className?: string
  label?: string
}

export default function AdUnit({ slot, format = 'auto', layout, className = '', label = 'Publicidade' }: Props) {
  // useId garante uma <ins> nova (e portanto um push() novo) a cada
  // navegação entre páginas, mesmo quando o mesmo slot é reutilizado.
  const uid = useId()

  useEffect(() => {
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // Bloqueador de anúncios ou script ainda não carregado: ignora.
    }
  }, [uid])

  return (
    <div className={`ad-slot-wrap ${className}`}>
      <span className="ad-slot-label">{label}</span>
      <ins
        key={uid}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={layout === 'in-article' ? 'fluid' : format}
        data-ad-layout={layout}
        data-full-width-responsive="true"
      />
    </div>
  )
}
