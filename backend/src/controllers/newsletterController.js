import { z } from 'zod'
import {
  findSubscriberByEmail,
  listSubscribers,
  subscribeEmail,
  unsubscribeEmail,
} from '../models/newsletterModel.js'

const emailSchema = z.object({
  email: z.string().trim().toLowerCase().email('Informe um email válido.'),
  source: z.string().trim().max(60).optional(),
})

export async function subscribe(req, res) {
  const parse = emailSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.issues[0]?.message || 'Informe um email válido.' })
  }
  const { email, source } = parse.data
  try {
    const existing = await findSubscriberByEmail(req.db, email)
    await subscribeEmail(req.db, email, source)
    if (existing && existing.active === 1) {
      return res.status(200).json({ ok: true, message: 'Este email já está inscrito na nossa newsletter.' })
    }
    return res.status(201).json({
      ok: true,
      message: 'Inscrição confirmada! Você vai receber um email sempre que publicarmos uma nova notícia.',
    })
  } catch (e) {
    console.error('[newsletter] subscribe error', e.message)
    return res.status(500).json({ error: 'Não foi possível concluir a inscrição. Tente novamente em instantes.' })
  }
}

export async function unsubscribe(req, res) {
  const parse = emailSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.issues[0]?.message || 'Informe um email válido.' })
  }
  await unsubscribeEmail(req.db, parse.data.email)
  res.json({ ok: true })
}

export async function getAll(req, res) {
  res.json(await listSubscribers(req.db))
}
