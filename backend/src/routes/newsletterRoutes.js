import { Router } from 'express'
import { getAll, subscribe, unsubscribe } from '../controllers/newsletterController.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'

const r = Router()

// Públicas: qualquer visitante do site pode se inscrever/desinscrever.
r.post('/subscribe', subscribe)
r.post('/unsubscribe', unsubscribe)

// Apenas admins podem listar os inscritos (ex.: para exportar e disparar campanhas).
r.get('/', requireAuth, requireAdmin, getAll)

export default r
