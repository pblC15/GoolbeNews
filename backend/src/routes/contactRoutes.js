import { Router } from 'express'
import { getAll, markRead, remove, send } from '../controllers/contactController.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'
import { rateLimit } from '../middleware/rateLimit.js'

const r = Router()

// Pública: formulário da página /contato
r.post('/', rateLimit({ windowMs: 10 * 60_000, max: 5, message: 'Muitas mensagens enviadas. Tente novamente em alguns minutos.' }), send)

// Apenas administradores leem e gerem as mensagens
r.get('/', requireAuth, requireAdmin, getAll)
r.patch('/:id/read', requireAuth, requireAdmin, markRead)
r.delete('/:id', requireAuth, requireAdmin, remove)

export default r
