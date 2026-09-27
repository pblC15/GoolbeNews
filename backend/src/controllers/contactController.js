import { z } from 'zod'
import {
  createContactMessage, deleteContactMessage, listContactMessages, markContactMessageRead,
} from '../models/contactModel.js'

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Informe o seu nome.').max(120, 'Nome muito longo.'),
  email: z.string().trim().toLowerCase().max(190, 'Email muito longo.').email('Informe um email válido.'),
  subject: z.string().trim().min(3, 'Informe o assunto.').max(160, 'Assunto muito longo (máx. 160 caracteres).'),
  message: z.string().trim().min(10, 'A mensagem deve ter pelo menos 10 caracteres.').max(5000, 'Mensagem muito longa (máx. 5000 caracteres).'),
  // campo "armadilha" invisível: pessoas não preenchem, robôs de spam sim
  website: z.string().optional(),
})

export async function send(req, res) {
  const p = contactSchema.safeParse(req.body || {})
  if (!p.success) return res.status(400).json({ error: p.error.issues[0]?.message || 'Dados inválidos.' })
  const { website, ...data } = p.data
  // robô: finge sucesso e não grava nada
  if (website) return res.status(201).json({ ok: true })
  try {
    await createContactMessage(req.db, data)
    res.status(201).json({ ok: true })
  } catch (e) {
    console.error('[contact] send error', e.message)
    res.status(500).json({ error: 'Não foi possível enviar a mensagem. Tente novamente em instantes.' })
  }
}

export async function getAll(req, res) {
  res.json(await listContactMessages(req.db))
}

export async function markRead(req, res) {
  const id = Number(req.params.id)
  if (!id) return res.status(400).json({ error: 'ID inválido' })
  await markContactMessageRead(req.db, id, req.body?.read !== false)
  res.json({ ok: true })
}

export async function remove(req, res) {
  const id = Number(req.params.id)
  if (!id) return res.status(400).json({ error: 'ID inválido' })
  await deleteContactMessage(req.db, id)
  res.json({ ok: true })
}
