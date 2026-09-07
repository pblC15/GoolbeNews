import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { createUser, deleteUser, listUsers, updateUser } from '../models/userModel.js'

const userSchema = z.object({
  name: z.string().min(2), email: z.string().email(), password: z.string().min(8),
  role: z.enum(['admin','editor']).default('editor'), active: z.boolean().default(true)
})

export async function getAll(req, res) { res.json(await listUsers(req.db)) }

export async function create(req, res) {
  const p = userSchema.safeParse(req.body)
  if (!p.success) return res.status(400).json({ error: 'Dados de utilizador inválidos' })
  try {
    const password_hash = await bcrypt.hash(p.data.password, 12)
    const id = await createUser(req.db, { ...p.data, password_hash, active: p.data.active ? 1 : 0 })
    res.status(201).json({ id })
  } catch (e) {
    if (e?.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Este email já está cadastrado' })
    res.status(500).json({ error: 'Erro ao criar utilizador' })
  }
}

export async function update(req, res) {
  const id = Number(req.params.id)
  if (!id) return res.status(400).json({ error: 'ID inválido' })
  const body = req.body || {}
  const fields = {}
  if (typeof body.name === 'string' && body.name.trim()) fields.name = body.name.trim()
  if (typeof body.email === 'string' && body.email.trim()) fields.email = body.email.trim()
  if (['admin','editor'].includes(body.role)) fields.role = body.role
  if (typeof body.active === 'boolean') fields.active = body.active ? 1 : 0
  if (body.password) {
    if (String(body.password).length < 8) return res.status(400).json({ error: 'A senha deve ter pelo menos 8 caracteres' })
    fields.password_hash = await bcrypt.hash(body.password, 12)
  }
  await updateUser(req.db, id, fields)
  res.json({ ok: true })
}

export async function remove(req, res) {
  const id = Number(req.params.id)
  if (id === Number(req.user.id)) return res.status(400).json({ error: 'Não é possível excluir o próprio utilizador autenticado' })
  await deleteUser(req.db, id)
  res.json({ ok: true })
}
