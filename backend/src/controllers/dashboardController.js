export const PERIOD_DAYS = { week: 7, month: 30, year: 365 }
export function periodBounds(period, now = new Date()) {
  const days = PERIOD_DAYS[period]
  if (!days) throw new Error('Período inválido')
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))
  const start = new Date(end.getTime() - days * 86400000)
  const previous = new Date(start.getTime() - days * 86400000)
  return { days, start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10), previous: previous.toISOString().slice(0, 10) }
}
export async function getDashboard(req, res) {
  const period = req.query.period || 'month'
  if (!Object.hasOwn(PERIOD_DAYS, period)) return res.status(400).json({ error: 'Período inválido' })
  const { days, start, end, previous } = periodBounds(period)
  try {
    const results = await Promise.all([
      req.db.query(`SELECT COUNT(*) total, COALESCE(SUM(published = 1),0) published,
        COALESCE(SUM(published = 0),0) drafts, COALESCE(SUM(views),0) views,
        COALESCE(SUM(published = 1 AND published_at >= ? AND published_at < ?),0) published_period FROM posts`, [start, end]),
      req.db.query('SELECT COUNT(*) total FROM categories'),
      req.db.query(`SELECT COUNT(*) total, COALESCE(SUM(role = 'editor'),0) editors,
        COALESCE(SUM(role = 'editor' AND active = 1),0) active_editors FROM users`),
      req.db.query(`SELECT COUNT(*) total, COALESCE(SUM(active = 1),0) active,
        COALESCE(SUM(created_at >= ? AND created_at < ?),0) new_subscribers FROM newsletter_subscribers`, [start, end]),
      req.db.query('SELECT COUNT(*) unread FROM contact_messages WHERE read_at IS NULL'),
      req.db.query(`SELECT DATE_FORMAT(view_date,'%Y-%m-%d') date, views FROM site_view_daily
        WHERE view_date >= ? AND view_date < ? ORDER BY view_date`, [previous, end]),
      req.db.query('SELECT started_at FROM analytics_metadata WHERE id = 1'),
    ])
    const [posts, categories, users, newsletter, messages, daily, metadata] = results.map(([rows]) => rows)
    const series = daily.filter(row => row.date >= start).map(row => ({ date: row.date, views: Number(row.views) }))
    const current = series.reduce((sum, row) => sum + row.views, 0)
    const previousViews = daily.filter(row => row.date < start).reduce((sum, row) => sum + Number(row.views), 0)
    const numberRow = row => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, Number(value)]))
    res.json({ posts: numberRow(posts[0]), categories: Number(categories[0].total), users: numberRow(users[0]),
      newsletter: numberRow(newsletter[0]), unread_messages: Number(messages[0].unread),
      audience: { period, days, start, end, current, previous: previousViews, series,
        started_at: metadata[0]?.started_at || null } })
  } catch (error) {
    console.error('[dashboard]', error.message)
    res.status(500).json({ error: 'Não foi possível carregar as estatísticas. Verifique se a migração do dashboard foi aplicada.' })
  }
}
