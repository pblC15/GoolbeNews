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
