export async function findUserByEmail(db, email) {
  const [rows] = await db.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email])
  return rows[0] || null
}

export async function findUserById(db, id) {
  const [rows] = await db.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id])
  return rows[0] || null
}

export async function listUsers(db) {
  const [rows] = await db.query(`
    SELECT u.id, u.name, u.email, u.role, u.active, u.avatar_url, u.profession, u.bio,
           u.created_at, u.updated_at,
           (SELECT COUNT(*) FROM posts p WHERE p.user_id = u.id) AS post_count
      FROM users u
  ORDER BY u.created_at DESC`)
  return rows
}

export async function createUser(db, { name, email, password_hash, role = 'editor', active = 1 }) {
  const [res] = await db.query('INSERT INTO users (name, email, password_hash, role, active) VALUES (?,?,?,?,?)', [name, email, password_hash, role, active])
  return res.insertId
}

// Atenção: "name" NÃO está na lista de campos permitidos de propósito.
// O nome do autor é definido apenas na criação da conta e não pode ser
// alterado depois (assinatura das matérias).
export async function updateUser(db, id, fields) {
  const allowed = ['email', 'password_hash', 'role', 'active', 'avatar_url', 'profession', 'bio']
  const entries = Object.entries(fields).filter(([k]) => allowed.includes(k))
  if (!entries.length) return
  const sets = entries.map(([k]) => `${k} = ?`).join(', ')
  await db.query(`UPDATE users SET ${sets} WHERE id = ?`, [...entries.map(([,v]) => v), id])
}

export async function countUserPosts(db, id) {
  const [[row]] = await db.query('SELECT COUNT(*) AS total FROM posts WHERE user_id = ?', [id])
  return Number(row.total)
}

export async function deleteUser(db, id) {
  await db.query('DELETE FROM users WHERE id = ?', [id])
}

/** Perfil público/editável do utilizador + categorias pelas quais é responsável */
export async function getUserProfile(db, id) {
  const [rows] = await db.query(
    `SELECT id, name, email, role, avatar_url, profession, bio, created_at
       FROM users WHERE id = ? LIMIT 1`,
    [id]
  )
  const user = rows[0]
  if (!user) return null
  user.categories = await getUserCategories(db, id)
  return user
}

export async function getUserCategories(db, userId) {
  const [rows] = await db.query(
    `SELECT c.id, c.name, c.slug
       FROM user_categories uc
       JOIN categories c ON c.id = uc.category_id
      WHERE uc.user_id = ?
   ORDER BY c.name`,
    [userId]
  )
  return rows
}

export async function setUserCategories(db, userId, categoryIds = []) {
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()
    await conn.query('DELETE FROM user_categories WHERE user_id = ?', [userId])
    if (categoryIds.length) {
      await conn.query(
        'INSERT IGNORE INTO user_categories (user_id, category_id) VALUES ?',
        [categoryIds.map(cid => [userId, cid])]
      )
    }
    await conn.commit()
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
}
