// src/lib/site.ts

/**
 * Retorna a URL base do site público (front-end).
 *
 * - No navegador: usa a origem atual (window.location.origin), então
 *   automaticamente é "http://localhost:3000" em desenvolvimento e
 *   "https://goolbenews.com.br" (ou o domínio configurado) em produção,
 *   sem precisar trocar nada manualmente.
 * - No servidor (SSR/build): usa a variável de ambiente NEXT_PUBLIC_SITE_BASE
 *   como referência, com fallback para localhost.
 */
export function getSiteBase(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return process.env.NEXT_PUBLIC_SITE_BASE ?? 'http://localhost:3000'
}

/* ------------------------------------------------------------------ */
/* Informações institucionais — edite aqui e reflete no site inteiro. */
/* ------------------------------------------------------------------ */

export const SITE_NAME = 'GoolbeNews'

/** Email público de contato (aparece em Contato, Privacidade e Termos). */
export const CONTACT_EMAIL = 'contato@goolbenews.com.br'

/** Data da última revisão da Política de Privacidade e dos Termos de Uso. */
export const LEGAL_LAST_UPDATE = '27 de setembro de 2026'

/** Páginas institucionais — usadas no menu lateral, no rodapé e no sitemap. */
export const INSTITUTIONAL_LINKS = [
  { href: '/sobre', label: 'Sobre nós' },
  { href: '/contato', label: 'Contato' },
  { href: '/politica-de-privacidade', label: 'Política de Privacidade' },
  { href: '/termos-de-uso', label: 'Termos de Uso' },
] as const
