import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { prisma } from '../src/lib/prisma.ts'

async function main() {
  const password = process.env.ADMIN_PASSWORD || '123456'
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@clinicapremium.com.br'

  const senhaHash = await bcrypt.hash(password, 12)

  const clinica = await prisma.clinica.upsert({
    where: { cnpj: '12345678000190' },
    update: {
      nome: 'Clínica Estética Orofacial Premium',
      ativo: true,
    },
    create: {
      nome: 'Clínica Estética Orofacial Premium',
      cnpj: '12345678000190',
      email: 'contato@clinicapremium.com.br',
      telefone: '1132145678',
      plano: 'PRO',
      ativo: true,
    },
  })

  const admin = await prisma.profissional.upsert({
    where: { email: adminEmail },
    update: {
      nome: 'Administrador HOF',
      role: 'ADMIN',
      ativo: true,
      clinicaId: clinica.id,
      senhaHash,
      conselho: 'CFO',
      numeroConselho: '00001',
      uf: 'SP',
    },
    create: {
      clinicaId: clinica.id,
      nome: 'Administrador HOF',
      email: adminEmail,
      senhaHash,
      conselho: 'CFO',
      numeroConselho: '00001',
      uf: 'SP',
      role: 'ADMIN',
      ativo: true,
    },
  })

  console.log('ADMIN_OK', JSON.stringify({
    email: admin.email,
    role: admin.role,
    clinicaId: admin.clinicaId,
  }))
}

main()
  .catch((error) => {
    console.error('ADMIN_ERROR', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
