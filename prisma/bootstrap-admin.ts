import { config as loadEnv } from 'dotenv'
import bcrypt from 'bcryptjs'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import type { Pool as PgPool } from 'pg'
import { Pool } from 'pg'

loadEnv()
loadEnv({ path: '.env.local', override: true })

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL não definida para bootstrap de admin')
}

const pool: PgPool = new Pool({ connectionString })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool as any) })

async function main() {
  const adminEmail = (process.env.BOOTSTRAP_ADMIN_EMAIL || 'carlos@clinicapremium.com.br')
    .trim()
    .toLowerCase()
  const adminPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD || '123456'

  if (adminPassword.length < 6) {
    throw new Error('BOOTSTRAP_ADMIN_PASSWORD precisa ter pelo menos 6 caracteres')
  }

  const clinica = await prisma.clinica.upsert({
    where: { cnpj: '12345678000190' },
    create: {
      nome: 'Clínica Estética Orofacial Premium',
      cnpj: '12345678000190',
      endereco: 'Av. Paulista, 1000 - Cj 801 - Bela Vista, São Paulo - SP',
      telefone: '1132145678',
      email: 'contato@clinicapremium.com.br',
      plano: 'PRO',
    },
    update: {
      nome: 'Clínica Estética Orofacial Premium',
      endereco: 'Av. Paulista, 1000 - Cj 801 - Bela Vista, São Paulo - SP',
      telefone: '1132145678',
      email: 'contato@clinicapremium.com.br',
      plano: 'PRO',
      ativo: true,
    },
  })

  const senhaHash = await bcrypt.hash(adminPassword, 12)

  const profissional = await prisma.profissional.upsert({
    where: { email: adminEmail },
    create: {
      clinicaId: clinica.id,
      nome: 'Dr. Carlos Eduardo Mendes',
      email: adminEmail,
      senhaHash,
      conselho: 'CFO',
      numeroConselho: '12345',
      uf: 'SP',
      especialidade: 'Harmonização Orofacial',
      role: 'ADMIN',
      ativo: true,
    },
    update: {
      clinicaId: clinica.id,
      nome: 'Dr. Carlos Eduardo Mendes',
      senhaHash,
      conselho: 'CFO',
      numeroConselho: '12345',
      uf: 'SP',
      especialidade: 'Harmonização Orofacial',
      role: 'ADMIN',
      ativo: true,
    },
    select: {
      id: true,
      email: true,
      clinicaId: true,
      role: true,
      ativo: true,
    },
  })

  console.log('✅ Bootstrap admin concluído com sucesso')
  console.log({
    clinicaId: clinica.id,
    adminEmail: profissional.email,
    role: profissional.role,
    ativo: profissional.ativo,
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
  .catch(async (err) => {
    console.error('❌ Falha no bootstrap admin:', err)
    await prisma.$disconnect()
    await pool.end()
    process.exit(1)
  })
