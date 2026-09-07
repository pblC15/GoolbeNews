import { Router } from 'express'
import { create, getAll, remove, update } from '../controllers/categoryController.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'
const r=Router(); r.get('/',getAll); r.post('/',requireAuth,requireAdmin,create); r.put('/:id',requireAuth,requireAdmin,update); r.delete('/:id',requireAuth,requireAdmin,remove); export default r
