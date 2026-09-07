// backend/src/models/mediaModel.js

export async function insertMediaMeta(db, { url, filename, mime, size, width = null, height = null }) {
  const [r] = await db.query(
    'INSERT INTO media (url, filename, mime, size, width, height) VALUES (?,?,?,?,?,?)',
    [url, filename, mime, size, width, height]
  )
  return r.insertId
}
