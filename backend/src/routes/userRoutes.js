import { Router } from 'express'
import { create, getAll, remove, update } from '../controllers/userController.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'
const r = Router()
r.use(requireAuth, requireAdmin)
r.get('/', getAll)
r.post('/', create)
r.put('/:id', update)
r.delete('/:id', remove)
export default r
