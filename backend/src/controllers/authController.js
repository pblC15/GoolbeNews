import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { findUserByEmail } from '../models/userModel.js'
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) })
export async function login(req, res) {
  const parse = loginSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: 'Email ou senha inválidos' })
  const user = await findUserByEmail(req.db, parse.data.email.toLowerCase())
  if (!user || user.active === 0) return res.status(401).json({ error: 'Credenciais inválidas' })
  if (!await bcrypt.compare(parse.data.password, user.password_hash)) return res.status(401).json({ error: 'Credenciais inválidas' })
  const token = jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: '8h' })
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
}
export async function me(req, res) { res.json({ user: req.user }) }
