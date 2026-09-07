// backend/scripts/hash.mjs
import bcrypt from 'bcryptjs'

const pwd = process.argv[2]
if (!pwd) {
  console.error('Uso: node scripts/hash.mjs <nova-senha>')
  process.exit(1)
}

const hash = await bcrypt.hash(pwd, 10)
console.log(hash)