export async function subscribeEmail(db, email, source) {
  // idempotente: se já existir (mesmo que estivesse desativado), reativa.
  const [r] = await db.query(
    `INSERT INTO newsletter_subscribers (email, active, source)
     VALUES (?, 1, ?)
     ON DUPLICATE KEY UPDATE active = 1, source = COALESCE(VALUES(source), source), updated_at = CURRENT_TIMESTAMP`,
    [email, source || null]
  )
  return r.insertId
}

export async function findSubscriberByEmail(db, email) {
  const [rows] = await db.query('SELECT * FROM newsletter_subscribers WHERE email = ? LIMIT 1', [email])
  return rows[0] || null
}

export async function listSubscribers(db) {
  const [rows] = await db.query(
    'SELECT id, email, active, source, created_at FROM newsletter_subscribers ORDER BY created_at DESC'
  )
  return rows
}

export async function unsubscribeEmail(db, email) {
  await db.query('UPDATE newsletter_subscribers SET active = 0 WHERE email = ?', [email])
}
