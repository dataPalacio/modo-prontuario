require('dotenv').config()

const { Client } = require('pg')
const bcrypt = require('bcryptjs')

async function main() {
  const connectionString = process.env.DIRECT_SQL_URL || process.env.DIRECT_URL

  if (!connectionString) {
    throw new Error('Defina DIRECT_SQL_URL ou DIRECT_URL antes de executar o script')
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    family: 4,
    connectionTimeoutMillis: 15000,
  })

  await client.connect()

  const senhaHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || '123456', 12)

  await client.query('BEGIN')

  const clinicaSql = `
    INSERT INTO clinicas (id, nome, cnpj, email, telefone, plano, ativo, created_at, updated_at)
    VALUES (gen_random_uuid()::text, 'Clínica Estética Orofacial Premium', '12345678000190', 'contato@clinicapremium.com.br', '1132145678', 'PRO', true, now(), now())
    ON CONFLICT (cnpj)
    DO UPDATE SET nome = EXCLUDED.nome, ativo = true, updated_at = now()
    RETURNING id
  `

  const clinicaResult = await client.query(clinicaSql)
  const clinicaId = clinicaResult.rows[0].id

  const profissionalSql = `
    INSERT INTO profissionais (id, clinica_id, nome, email, senha_hash, conselho, numero_conselho, uf, role, ativo, created_at, updated_at)
    VALUES (gen_random_uuid()::text, $1, 'Administrador HOF', 'admin@clinicapremium.com.br', $2, 'CFO', '00001', 'SP', 'ADMIN', true, now(), now())
    ON CONFLICT (email)
    DO UPDATE SET
      clinica_id = EXCLUDED.clinica_id,
      nome = EXCLUDED.nome,
      senha_hash = EXCLUDED.senha_hash,
      role = 'ADMIN',
      ativo = true,
      updated_at = now()
  `

  await client.query(profissionalSql, [clinicaId, senhaHash])

  await client.query('COMMIT')
  await client.end()

  console.log('ADMIN_OK', 'admin@clinicapremium.com.br')
}

main().catch(async (error) => {
  console.error('ADMIN_SQL_ERROR', error.message)
  process.exit(1)
})
