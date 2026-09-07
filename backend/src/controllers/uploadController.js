// backend/src/controllers/uploadController.js
import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import crypto from 'crypto'
import { insertMediaMeta } from '../models/mediaModel.js'

const allowImage = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const allowVideo = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
const allow = [...allowImage, ...allowVideo]

const videoExtByMime = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/ogg': 'ogv',
  'video/quicktime': 'mov',
}

export async function handleUpload(req, res) {
  try {
    const file = req.file
    if (!file) return res.status(400).json({ error: 'Arquivo obrigatório' })
    if (!allow.includes(file.mimetype)) return res.status(400).json({ error: 'Formato não suportado' })

    const baseDir = path.join(process.cwd(), 'uploads')
    await fs.mkdir(baseDir, { recursive: true })

    const id = crypto.randomUUID()
    const isVideo = allowVideo.includes(file.mimetype)
    const isGif = file.mimetype === 'image/gif'

    let width = null, height = null, filename

    if (isVideo) {
      // vídeos são gravados como estão, sem reprocessamento
      const ext = videoExtByMime[file.mimetype] || 'mp4'
      filename = `${id}.${ext}`
      const outPath = path.join(baseDir, filename)
      await fs.writeFile(outPath, file.buffer)
    } else if (isGif) {
      filename = `${id}.gif`
      const outPath = path.join(baseDir, filename)
      await fs.writeFile(outPath, file.buffer)
    } else {
      filename = `${id}.webp`
      const outPath = path.join(baseDir, filename)
      const result = await sharp(file.buffer)
        .resize({ width: 1600, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(outPath)
      width = result.width || null
      height = result.height || null
    }

    const BASE = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`
    const url = `${BASE}/uploads/${filename}`

    // opcional: gravar metadados
    let mediaId = null
    try {
      mediaId = await insertMediaMeta(req.db, { url, filename, mime: file.mimetype, size: file.size, width, height })
    } catch {}

    res.json({ success: 1, file: { url, mime: file.mimetype }, mediaId })
  } catch (e) {
    console.error('upload error', e)
    res.status(500).json({ error: 'Falha no upload' })
  }
}
