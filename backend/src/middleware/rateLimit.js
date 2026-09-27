// Limitador de requisições simples, em memória (sem dependências).
// Protege rotas públicas (newsletter, contato) contra robôs e envios em massa.
//
// Observação: se o backend estiver atrás de um proxy/reverse proxy (Nginx,
// Cloudflare, etc.), ative `app.set('trust proxy', 1)` no server.js para que
// req.ip seja o IP real do visitante e não o do proxy.

export function rateLimit({ windowMs = 60_000, max = 5, message = 'Muitas tentativas. Aguarde um minuto e tente novamente.' } = {}) {
  const hits = new Map() // ip -> { count, reset }

  // limpeza periódica para a memória não crescer indefinidamente
  setInterval(() => {
    const now = Date.now()
    for (const [ip, h] of hits) if (h.reset <= now) hits.delete(ip)
  }, windowMs).unref()

  return (req, res, next) => {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown'
    const now = Date.now()
    let h = hits.get(ip)
    if (!h || h.reset <= now) {
      h = { count: 0, reset: now + windowMs }
      hits.set(ip, h)
    }
    h.count++
    if (h.count > max) {
      res.set('Retry-After', String(Math.ceil((h.reset - now) / 1000)))
      return res.status(429).json({ error: message })
    }
    next()
  }
}
