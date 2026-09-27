export async function createContactMessage(db, { name, email, subject, message }) {
  const [r] = await db.query(
    'INSERT INTO contact_messages (name, email, subject, message) VALUES (?,?,?,?)',
    [name, email, subject, message]
  )
  return r.insertId
}

export async function listContactMessages(db) {
  const [rows] = await db.query(
    'SELECT id, name, email, subject, message, read_at, created_at FROM contact_messages ORDER BY created_at DESC LIMIT 500'
  )
  return rows
}

export async function markContactMessageRead(db, id, read = true) {
  await db.query('UPDATE contact_messages SET read_at = ? WHERE id = ?', [read ? new Date() : null, id])
}

export async function deleteContactMessage(db, id) {
  await db.query('DELETE FROM contact_messages WHERE id = ?', [id])
}
