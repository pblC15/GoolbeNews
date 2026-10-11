import test from 'node:test'
import assert from 'node:assert/strict'
import { periodBounds, getDashboard } from '../src/controllers/dashboardController.js'
import { incrementPostViews } from '../src/models/postModel.js'

test('períodos cruzam anos e incluem o dia atual', () => {
  assert.deepEqual(periodBounds('week', new Date('2026-01-02T23:59:00Z')), { days: 7, start: '2025-12-27', end: '2026-01-03', previous: '2025-12-20' })
  assert.equal(periodBounds('month', new Date('2024-03-01T12:00:00Z')).start, '2024-02-01')
  assert.equal(periodBounds('year', new Date('2026-10-11T12:00:00Z')).days, 365)
})
test('rejeita filtro inválido antes de acessar o banco', async () => {
  const res = { status(code) { assert.equal(code, 400); return this }, json(body) { assert.ok(body.error) } }
  await getDashboard({ query: { period: 'invalid' } }, res)
})
test('soma audiência e separa corretamente o período anterior', async () => {
  const { start, previous } = periodBounds('week')
  const responses = [[{total: '2', published: '1', drafts: '1', views: '100', published_period: '1'}], [{total: '1'}], [{total: '3', editors: '2', active_editors: '1'}], [{total: '4', active: '3', new_subscribers: '1'}], [{unread: '2'}], [{date: previous, views: '7'}, {date: start, views: '12'}], [{started_at: '2026-01-01T00:00:00Z'}]]
  let index = 0
  const req = { query: {period: 'week'}, db: {async query() { return [responses[index++]] }} }
  await getDashboard(req, { json(body) { assert.equal(body.audience.current, 12); assert.equal(body.audience.previous, 7); assert.equal(body.posts.views, 100); assert.equal(body.newsletter.active, 3) }, status() { throw new Error('Erro inesperado') } })
})
for (const fail of [false, true]) test(`contador e histórico são atômicos: falha=${fail}`, async () => {
  const events = []
  const db = {async getConnection() { return {
    async beginTransaction() { events.push('begin') },
    async query() { events.push('query'); if (fail && events.length === 3) throw new Error('database'); return [{affectedRows: 1}] },
    async commit() { events.push('commit') }, async rollback() { events.push('rollback') }, release() {events.push('release')},
  } }}
  if (fail) await assert.rejects(incrementPostViews(db, 1))
  else await incrementPostViews(db, 1)
  assert.deepEqual(events, ['begin', 'query', 'query', fail ? 'rollback' : 'commit', 'release'])
})
