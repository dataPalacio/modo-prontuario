import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const expectedToken = process.env.BOOTSTRAP_TOKEN
    const providedToken = request.headers.get('x-bootstrap-token')

    if (!expectedToken || providedToken !== expectedToken) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const adminEmail = (process.env.BOOTSTRAP_ADMIN_EMAIL || 'carlos@clinicapremium.com.br')
      .trim()
      .toLowerCase()
    const adminPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD || '123456'

    if (adminPassword.length < 8) {
      return NextResponse.json(
        { error: 'BOOTSTRAP_ADMIN_PASSWORD deve ter ao menos 8 caracteres.' },
        { status: 400 }
      )
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
      select: { id: true, nome: true },
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
        role: true,
        ativo: true,
        clinicaId: true,
      },
    })

    return NextResponse.json({
      ok: true,
      clinica,
      profissional,
    })
  } catch (error) {
    console.error('[bootstrap-admin] erro:', error)
    return NextResponse.json(
      { error: 'Falha ao executar bootstrap admin.' },
      { status: 500 }
    )
  }
}
