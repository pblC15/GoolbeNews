import { Router } from 'express'
import multer from 'multer'
import { handleUpload } from '../controllers/uploadController.js'
import { requireAuth } from '../middleware/auth.js'
const r=Router()
// limite maior para permitir upload de vídeos além de imagens
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:80*1024*1024}})
r.post('/',requireAuth,upload.single('file'),handleUpload)
export default r
