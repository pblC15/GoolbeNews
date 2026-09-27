import { Router } from 'express'
import { changeMyPassword, create, getAll, getMe, remove, update, updateMe } from '../controllers/userController.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'
const r = Router()

// "Meu perfil": disponível para qualquer utilizador autenticado (admin ou editor)
r.get('/me', requireAuth, getMe)
r.put('/me', requireAuth, updateMe)
r.put('/me/password', requireAuth, changeMyPassword)

// Gestão de utilizadores: apenas administradores
r.get('/', requireAuth, requireAdmin, getAll)
r.post('/', requireAuth, requireAdmin, create)
r.put('/:id', requireAuth, requireAdmin, update)
r.delete('/:id', requireAuth, requireAdmin, remove)
export default r
