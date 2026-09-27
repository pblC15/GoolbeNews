import { z } from 'zod'
import {
  findSubscriberByEmail,
  listSubscribers,
  subscribeEmail,
  unsubscribeEmail,
} from '../models/newsletterModel.js'

// Email estrito: só letras, números e os símbolos comuns em endereços reais.
// Qualquer coisa como <script>, aspas, espaços, parênteses ou ponto e vírgula é recusada.
const EMAIL_RE = /^[a-z0-9](?:[a-z0-9._%+-]{0,62}[a-z0-9])?@(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/

// Origem da inscrição (ex.: "home", "post-minha-noticia"): apenas slug.
const SOURCE_RE = /^[a-z0-9-]{1,60}$/

const emailSchema = z
  .object({
    email: z
      .string({ error: 'Informe um email válido.' })
      .trim()
      .toLowerCase()
      .max(190, 'Email muito longo.')
      .regex(EMAIL_RE, 'Informe um email válido.'),
    source: z
      .string()
      .trim()
      .toLowerCase()
      .max(60)
      .regex(SOURCE_RE)
      .optional()
      .catch(undefined), // origem inválida é descartada, sem bloquear a inscrição
  })
  .strict() // campos extras no corpo da requisição = requisição recusada

function parseBody(req) {
  // só aceita JSON com objeto simples
  if (!req.is('application/json') || typeof req.body !== 'object' || Array.isArray(req.body) || !req.body) {
    return { success: false, error: { issues: [{ message: 'Requisição inválida.' }] } }
  }
  const result = emailSchema.safeParse(req.body)
  if (!result.success && result.error.issues.some((i) => i.code === 'unrecognized_keys')) {
    return { success: false, error: { issues: [{ message: 'Requisição inválida.' }] } }
  }
  return result
}

export async function subscribe(req, res) {
  const parse = parseBody(req)
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.issues[0]?.message || 'Informe um email válido.' })
  }
  const { email, source } = parse.data
  try {
    const existing = await findSubscriberByEmail(req.db, email)
    if (existing && Number(existing.active) === 1) {
      return res.status(409).json({ error: 'Este email já está cadastrado na nossa newsletter.' })
    }
    // novo email, ou email que tinha cancelado a inscrição (é reativado)
    await subscribeEmail(req.db, email, source)
    return res.status(201).json({
      ok: true,
      message: 'Email cadastrado com sucesso! Você vai receber as próximas notícias na sua caixa de entrada.',
    })
  } catch (e) {
    // dois envios simultâneos do mesmo email
    if (e?.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Este email já está cadastrado na nossa newsletter.' })
    }
    console.error('[newsletter] subscribe error', e.message)
    return res.status(500).json({ error: 'Não foi possível concluir a inscrição. Tente novamente em instantes.' })
  }
}

export async function unsubscribe(req, res) {
  const parse = parseBody(req)
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.issues[0]?.message || 'Informe um email válido.' })
  }
  await unsubscribeEmail(req.db, parse.data.email)
  res.json({ ok: true })
}

export async function getAll(req, res) {
  res.json(await listSubscribers(req.db))
}
