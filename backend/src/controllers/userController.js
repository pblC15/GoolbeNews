import bcrypt from 'bcryptjs'
import { z } from 'zod'
import {
  countUserPosts, createUser, deleteUser, findUserById, getUserProfile,
  listUsers, setUserCategories, updateUser,
} from '../models/userModel.js'

const userSchema = z.object({
  name: z.string().trim().min(2), email: z.string().trim().toLowerCase().email(), password: z.string().min(8),
  role: z.enum(['admin','editor']).default('editor'), active: z.boolean().default(true)
})

// Campos do "Meu perfil". O nome não entra aqui: não pode ser alterado.
const profileSchema = z.object({
  avatar_url: z.string().url('URL da foto inválida').max(1000).nullable().optional(),
  profession: z.string().trim().max(80, 'A profissão deve ter no máximo 80 caracteres').nullable().optional(),
  bio: z.string().trim().max(90, 'A descrição deve ter no máximo 90 caracteres').nullable().optional(),
  category_ids: z.array(z.number().int().positive()).max(50).optional(),
})

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Informe a senha atual'),
  new_password: z.string().min(8, 'A nova senha deve ter pelo menos 8 caracteres'),
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
  const isSelf = id === Number(req.user.id)
  const body = req.body || {}
  const fields = {}
  // body.name é ignorado de propósito: o nome não pode ser alterado.
  if (typeof body.email === 'string' && body.email.trim()) fields.email = body.email.trim().toLowerCase()
  if (['admin','editor'].includes(body.role)) {
    if (isSelf && body.role !== req.user.role) return res.status(400).json({ error: 'Não é possível alterar o seu próprio perfil de acesso' })
    fields.role = body.role
  }
  if (typeof body.active === 'boolean') {
    if (isSelf && !body.active) return res.status(400).json({ error: 'Não é possível desativar a sua própria conta' })
    fields.active = body.active ? 1 : 0
  }
  if (body.password) {
    if (String(body.password).length < 8) return res.status(400).json({ error: 'A senha deve ter pelo menos 8 caracteres' })
    fields.password_hash = await bcrypt.hash(body.password, 12)
  }
  try {
    await updateUser(req.db, id, fields)
    res.json({ ok: true })
  } catch (e) {
    if (e?.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Este email já está cadastrado' })
    res.status(500).json({ error: 'Erro ao atualizar utilizador' })
  }
}

export async function remove(req, res) {
  const id = Number(req.params.id)
  if (id === Number(req.user.id)) return res.status(400).json({ error: 'Não é possível excluir o próprio utilizador autenticado' })
  const total = await countUserPosts(req.db, id)
  if (total > 0) {
    return res.status(409).json({
      error: `Este utilizador assina ${total} notícia(s) e não pode ser excluído. Desative a conta em vez de excluir.`,
    })
  }
  await deleteUser(req.db, id)
  res.json({ ok: true })
}

/* ---------- Meu perfil (qualquer utilizador autenticado) ---------- */

export async function getMe(req, res) {
  const profile = await getUserProfile(req.db, Number(req.user.id))
  if (!profile) return res.status(404).json({ error: 'Utilizador não encontrado' })
  res.json(profile)
}

export async function updateMe(req, res) {
  const p = profileSchema.safeParse(req.body || {})
  if (!p.success) return res.status(400).json({ error: p.error.issues[0]?.message || 'Dados inválidos' })
  const id = Number(req.user.id)
  const { category_ids, ...rest } = p.data
  const fields = {}
  for (const [k, v] of Object.entries(rest)) {
    if (v === undefined) continue
    fields[k] = typeof v === 'string' && !v ? null : v
  }
  try {
    await updateUser(req.db, id, fields)
    if (Array.isArray(category_ids)) await setUserCategories(req.db, id, [...new Set(category_ids)])
    res.json(await getUserProfile(req.db, id))
  } catch (e) {
    console.error('[users] updateMe error', e.message)
    if (e?.code === 'ER_NO_REFERENCED_ROW_2') return res.status(400).json({ error: 'Categoria inválida' })
    res.status(500).json({ error: 'Erro ao salvar o perfil' })
  }
}

export async function changeMyPassword(req, res) {
  const p = passwordSchema.safeParse(req.body || {})
  if (!p.success) return res.status(400).json({ error: p.error.issues[0]?.message || 'Dados inválidos' })
  const user = await findUserById(req.db, Number(req.user.id))
  if (!user) return res.status(404).json({ error: 'Utilizador não encontrado' })
  if (!await bcrypt.compare(p.data.current_password, user.password_hash)) {
    return res.status(400).json({ error: 'A senha atual está incorreta' })
  }
  await updateUser(req.db, user.id, { password_hash: await bcrypt.hash(p.data.new_password, 12) })
  res.json({ ok: true })
}
