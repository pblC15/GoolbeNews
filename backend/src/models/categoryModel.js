export async function listCategories(db) {
  const [rows] = await db.query(`SELECT c.*, COUNT(p.id) AS post_count FROM categories c LEFT JOIN posts p ON p.category_id=c.id GROUP BY c.id ORDER BY c.name`)
  return rows
}
export async function createCategory(db, { name, slug }) {
  const [r] = await db.query('INSERT INTO categories (name, slug) VALUES (?,?)', [name, slug]); return r.insertId
}
export async function updateCategory(db, id, {name, slug}) { await db.query('UPDATE categories SET name=?, slug=? WHERE id=?', [name, slug, id]) }
export async function deleteCategory(db, id) { await db.query('DELETE FROM categories WHERE id=?', [id]) }
