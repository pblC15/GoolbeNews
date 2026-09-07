// backend/src/db.js
import mysql from 'mysql2/promise'

let _pool

export function createPool() {
  if (_pool) return _pool

  const cfg = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_DATABASE || 'blognews',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
    timezone: 'Z',
    namedPlaceholders: true,
  }

  // log básico para confirmar leitura do .env (sem senha!)
  console.log('[DB] host=%s port=%d user=%s db=%s',
    cfg.host, cfg.port, cfg.user, cfg.database)

  _pool = mysql.createPool(cfg)
  return _pool
}
