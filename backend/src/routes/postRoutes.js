import { Router } from 'express'
import { adminGet, adminList, bySlug, create, recent, remove, update } from '../controllers/postController.js'
import { requireAuth } from '../middleware/auth.js'
const r=Router()
r.get('/admin/list', requireAuth, adminList)
r.get('/admin/:id', requireAuth, adminGet)
r.get('/',recent)
r.get('/:slug',bySlug)
r.post('/',requireAuth,create)
r.put('/:id',requireAuth,update)
r.delete('/:id',requireAuth,remove)
export default r
