// backend/src/controllers/postController.js
import { z } from 'zod'
import {
  createPost,
  updatePost,
  listRecentPosts,
  getPostBySlugWithCategory,
  listAdminPosts, getPostByIdAdmin, deletePost,
  incrementPostViews,
} from '../models/postModel.js'
import { replaceBlocks, getBlocks } from '../models/postBlockModel.js'

const postSchema = z.object({
  title: z.string().min(4),
  category_id: z.number().optional().nullable(),
  cover_url: z.string().url().optional().nullable(),
  excerpt: z.string().max(500).optional().nullable(),
  published: z.boolean().default(false),
  blocks: z.array(z.object({ type: z.string(), data: z.any() })).default([])
})

export async function create(req, res) {
  const parsed = postSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'payload inválido' })

  const userId = req.user.id
  const { title, category_id, cover_url, excerpt, published, blocks } = parsed.data

  console.log('[API create] recebidos blocks:', Array.isArray(blocks) ? blocks.length : blocks)

  try {
    // slug único e published_at tratados no model
    const { id, slug } = await createPost(req.db, {
      user_id: userId,
      category_id: category_id || null,
      title,
      cover_url: cover_url || null,
      excerpt: excerpt || null,
      published: !!published,
    })

    if (Array.isArray(blocks) && blocks.length) {
      console.log('[API create] chamando replaceBlocks com', blocks.length)
      await replaceBlocks(req.db, id, blocks)
    }

    res.status(201).json({ id, slug })
  } catch (e) {
    console.error('[API create] erro:', e)
    res.status(400).json({ error: e.message || 'Erro ao criar post' })
  }
}

export async function update(req, res) {
  const id = Number(req.params.id)
  if (!id) return res.status(400).json({ error: 'id inválido' })

  const parsed = postSchema.partial().safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'payload inválido' })

  const { blocks, ...cols } = parsed.data

  try {
    // o model recalcula slug se title mudou e ajusta published_at
    const { slug } = await updatePost(req.db, id, cols)

    if (Array.isArray(blocks)) {
      await replaceBlocks(req.db, id, blocks)
    }

    res.json({ ok: true, slug })
  } catch (e) {
    res.status(400).json({ error: e.message || 'Erro ao atualizar post' })
  }
}

export async function recent(req, res) {
  const { slug, includeBlocks, q, category, limit } = req.query;
  try {
    if (slug) {
      const post = await getPostBySlugWithCategory(req.db, slug, { onlyPublished: true })
      if (!post) return res.json([])
      if (includeBlocks) {
        const blocks = await getBlocks(req.db, post.id)
        return res.json([{ ...post, blocks }])
      }
      return res.json([post])
    }

    // COMPLETE o “resto da listagem normal” pra evitar edge-case
    const lim = Number(limit) > 0 ? Number(limit) : 12
    const rows = await listRecentPosts(req.db, {
      limit: lim,
      categorySlug: category || undefined,
      q: q || undefined,
    })
    return res.json(rows)
  } catch (e) {
    console.error('[API recent] ERRO:', e) // <— adicione isto
    return res.status(500).json({ error: 'Erro ao buscar posts' })
  }
}

export async function bySlug(req, res) {
  const slug = req.params.slug
  try {
    const post = await getPostBySlugWithCategory(req.db, slug, { onlyPublished: true })
    if (!post) return res.status(404).json({ error: 'not found' })

    const blocks = await getBlocks(req.db, post.id)
    console.log('[API bySlug]', slug, 'retornando blocks:', blocks.length)

    // conta a visualização sem atrasar a resposta ao leitor
    incrementPostViews(req.db, post.id).catch(e => console.error('[views] erro ao incrementar', e))

    res.json({ ...post, blocks })
  } catch (e) {
    console.error('[API bySlug] ERRO:', e) // <— adicione isto
    res.status(500).json({ error: 'Erro ao buscar post' })
  }
}


export async function adminList(req,res){
  try { res.json(await listAdminPosts(req.db)) } catch(e){ res.status(500).json({error:'Erro ao listar notícias'}) }
}
export async function adminGet(req,res){
  try { const post=await getPostByIdAdmin(req.db,Number(req.params.id)); if(!post) return res.status(404).json({error:'Notícia não encontrada'}); post.blocks=await getBlocks(req.db,post.id); res.json(post) } catch(e){ res.status(500).json({error:'Erro ao buscar notícia'}) }
}
export async function remove(req,res){
  try { await deletePost(req.db,Number(req.params.id)); res.json({ok:true}) } catch(e){ res.status(500).json({error:'Erro ao excluir notícia'}) }
}
