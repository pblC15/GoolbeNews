import slugify from 'slugify'

// gera slug base
function toSlugBase(text) {
  return slugify(text || '', { lower: true, strict: true, locale: 'pt' }).slice(0, 240)
}

// garante slug único (evita conflito no UNIQUE KEY)
async function ensureUniqueSlug(db, base, excludeId = null) {
  let slug = base || 'post'
  let i = 1
  // tenta o base; se existir, incrementa -2, -3...
  while (true) {
    const [rows] = await db.query(
      excludeId
        ? 'SELECT id FROM posts WHERE slug = ? AND id <> ? LIMIT 1'
        : 'SELECT id FROM posts WHERE slug = ? LIMIT 1',
      excludeId ? [slug, excludeId] : [slug]
    )
    if (!rows.length) return slug
    slug = `${base}-${++i}`
  }
}

/**
 * Cria post com slug único e published_at (NOW quando published=1)
 * retorna { id, slug }
 */
export async function createPost(db, { user_id, category_id, title, cover_url, excerpt, published }) {
  const base = toSlugBase(title)
  const slug = await ensureUniqueSlug(db, base)

  const isPublished = published ? 1 : 0
  const publishedAt = isPublished ? new Date() : null

  const [result] = await db.execute(
    `
      INSERT INTO posts
        (user_id, category_id, title, slug, cover_url, excerpt, published, published_at)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [user_id, category_id || null, title, slug, cover_url || null, excerpt || null, isPublished, publishedAt]
  )
  return { id: result.insertId, slug }
}

/**
 * Atualiza post. Se title/slug mudar, recalcula slug único.
 * Se published mudar, ajusta published_at coerente.
 * retorna { slug }
 */
export async function updatePost(db, id, fields = {}) {
  // pega atual (inclui published_at para manter quando não mudar publish)
  const [[curr]] = await db.query(
    'SELECT id, title, slug, published, published_at FROM posts WHERE id = ? LIMIT 1',
    [id]
  )
  if (!curr) throw new Error('Post não encontrado')

  // recalcula slug se necessário
  let nextSlug = curr.slug
  if (typeof fields.slug === 'string' && fields.slug.trim()) {
    nextSlug = await ensureUniqueSlug(db, toSlugBase(fields.slug), id)
  } else if (typeof fields.title === 'string' && fields.title.trim() && fields.title !== curr.title) {
    nextSlug = await ensureUniqueSlug(db, toSlugBase(fields.title), id)
  }

  // decide published/published_at
  let nextPublished = curr.published
  let nextPublishedAt = curr.published_at

  if (typeof fields.published === 'boolean') {
    nextPublished = fields.published ? 1 : 0
    nextPublishedAt = fields.published ? new Date() : null
  }

  // monta objeto de updates apenas com campos enviados
  const updates = {}

  if ('category_id' in fields) updates.category_id = fields.category_id ?? null
  if ('title' in fields) updates.title = fields.title
  if ('cover_url' in fields) updates.cover_url = fields.cover_url ?? null
  if ('excerpt' in fields) updates.excerpt = fields.excerpt ?? null

  // slug sempre coerente com o cálculo acima
  if (nextSlug !== curr.slug) updates.slug = nextSlug

  // se published foi enviado, aplica published e published_at
  if ('published' in fields) {
    updates.published = nextPublished
    updates.published_at = nextPublishedAt
  }

  // se nada para atualizar, retorna apenas o slug calculado
  const keys = Object.keys(updates)
  if (!keys.length) {
    return { slug: nextSlug }
  }

  const sets = keys.map(k => `${k} = ?`).join(', ')
  const values = keys.map(k => updates[k])

  await db.query(`UPDATE posts SET ${sets} WHERE id = ?`, [...values, id])
  return { slug: nextSlug }
}

/** Retorna post + nomes de categoria (padrão: só publicados) */
export async function getPostBySlugWithCategory(db, slug, { onlyPublished = true } = {}) {
  const [rows] = await db.query(
    `SELECT p.*, c.slug AS category_slug, c.name AS category_name, u.name AS author_name
       FROM posts p
  LEFT JOIN categories c ON c.id = p.category_id
  LEFT JOIN users u ON u.id = p.user_id
      WHERE p.slug = ? ${onlyPublished ? 'AND p.published = 1' : ''} 
      LIMIT 1`,
    [slug]
  )
  return rows[0] || null
}

/** Lista recentes com filtros (só publicados) */
export async function listRecentPosts(db, { limit = 12, categorySlug, q } = {}) {
  let sql = `SELECT p.id, p.title, p.slug, p.cover_url, p.excerpt, p.published_at,
                    c.slug AS category_slug, c.name AS category_name
               FROM posts p
          LEFT JOIN categories c ON c.id = p.category_id
              WHERE p.published = 1`
  const params = []

  if (categorySlug) { sql += ' AND c.slug = ?'; params.push(categorySlug) }
  if (q) { sql += ' AND (p.title LIKE ? OR p.excerpt LIKE ?)'; params.push(`%${q}%`, `%${q}%`) }

  sql += ' ORDER BY p.published_at DESC, p.id DESC LIMIT ?'
  params.push(Number(limit))

  const [rows] = await db.query(sql, params)
  return rows
}

export async function listAdminPosts(db) {
  const [rows] = await db.query(`
    SELECT p.id,p.title,p.slug,p.cover_url,p.excerpt,p.published,p.published_at,p.created_at,p.updated_at,
           c.name AS category_name,u.name AS author_name
      FROM posts p
 LEFT JOIN categories c ON c.id=p.category_id
 LEFT JOIN users u ON u.id=p.user_id
  ORDER BY p.created_at DESC,p.id DESC`)
  return rows
}

export async function getPostByIdAdmin(db, id) {
  const [rows] = await db.query(`SELECT p.*, c.name AS category_name FROM posts p LEFT JOIN categories c ON c.id=p.category_id WHERE p.id=? LIMIT 1`, [id])
  return rows[0] || null
}

export async function deletePost(db, id) {
  await db.query('DELETE FROM posts WHERE id=?', [id])
}
