import { Router } from 'express'
import { getAll, subscribe, unsubscribe } from '../controllers/newsletterController.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'
import { rateLimit } from '../middleware/rateLimit.js'

const r = Router()

// no máximo 5 tentativas por minuto por IP
const limiter = rateLimit({ windowMs: 60_000, max: 5 })

// Públicas: qualquer visitante do site pode se inscrever/desinscrever.
r.post('/subscribe', limiter, subscribe)
r.post('/unsubscribe', limiter, unsubscribe)

// Apenas admins podem listar os inscritos (ex.: para exportar e disparar campanhas).
r.get('/', requireAuth, requireAdmin, getAll)

export default r
