export async function findUserByEmail(db, email) {
  const [rows] = await db.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email])
  return rows[0] || null
}

export async function listUsers(db) {
  const [rows] = await db.query('SELECT id, name, email, role, active, created_at, updated_at FROM users ORDER BY created_at DESC')
  return rows
}

export async function createUser(db, { name, email, password_hash, role = 'editor', active = 1 }) {
  const [res] = await db.query('INSERT INTO users (name, email, password_hash, role, active) VALUES (?,?,?,?,?)', [name, email, password_hash, role, active])
  return res.insertId
}

export async function updateUser(db, id, fields) {
  const allowed = ['name', 'email', 'password_hash', 'role', 'active']
  const entries = Object.entries(fields).filter(([k]) => allowed.includes(k))
  if (!entries.length) return
  const sets = entries.map(([k]) => `${k} = ?`).join(', ')
  await db.query(`UPDATE users SET ${sets} WHERE id = ?`, [...entries.map(([,v]) => v), id])
}

export async function deleteUser(db, id) {
  await db.query('DELETE FROM users WHERE id = ?', [id])
}
