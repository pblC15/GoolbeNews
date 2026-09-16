// backend/server.js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { createPool } from './src/db.js'
import authRoutes from './src/routes/authRoutes.js'
import categoryRoutes from './src/routes/categoryRoutes.js'
import postRoutes from './src/routes/postRoutes.js'
import uploadRoutes from './src/routes/uploadRoutes.js'
import userRoutes from './src/routes/userRoutes.js'
import newsletterRoutes from './src/routes/newsletterRoutes.js'

dotenv.config()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const ALLOW = (process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000']).map(s => s.trim())
 app.use(cors({
   origin(origin, cb) {
     // permite requests sem origin (ex.: curl, Postman) ou da whitelist
     if (!origin || ALLOW.includes(origin)) return cb(null, true)
     return cb(new Error('Not allowed by CORS'))
   },
   credentials: true,
}))
app.use(express.json({ limit: '10mb' }))

const pool = createPool()

// 🔎 Testa a conexão só no boot (não por request)
pool.query('SELECT 1')
  .then(() => console.log('[DB] OK'))
  .catch(err => console.error('[DB] FAIL', err.message))

// Anexa o pool na request para os routers/controllers usarem
app.use((req, _res, next) => {
  req.db = pool
  next()
})

// 👉 arquivos públicos
const uploadsDir = path.join(process.cwd(), 'uploads')
app.use('/uploads', express.static(uploadsDir, { maxAge: '30d', immutable: true }))

app.get('/health', (_req, res) => res.json({ ok: true }))

app.use('/api/auth', authRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/users', userRoutes)
app.use('/api/newsletter', newsletterRoutes)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`))
