// backend/src/models/postBlockModel.js

// sobrescreve blocks de um post (delete + bulk insert)
export async function replaceBlocks(db, postId, blocks = []) {
  
  console.log('[MODEL replaceBlocks] postId=', postId, 'blocks=', blocks.length)

  await db.query('DELETE FROM post_blocks WHERE post_id = ?', [postId])
  if (!Array.isArray(blocks) || !blocks.length) return

  const values = blocks.map((b, idx) => [postId, idx, b.type, JSON.stringify(b.data || {})])
  await db.query('INSERT INTO post_blocks (post_id, position, type, data) VALUES ?', [values])
}

export async function getBlocks(db, postId) {
  const [rows] = await db.query(
    'SELECT type, data, position FROM post_blocks WHERE post_id = ? ORDER BY position ASC, id ASC',
    [postId]
  )
  console.log('[MODEL getBlocks] postId=', postId, 'rows=', rows.length)

  return rows.map(r => {
    let data = r.data
    if (typeof data === 'string') {
      try { data = JSON.parse(data) } catch { /* deixa como está */ }
    }
    return { type: r.type, data }
  })
}