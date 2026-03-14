import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/pacientes — Lista pacientes da clínica
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const search = searchParams.get('search') || ''
    // TODO: Extrair clinicaId da sessão autenticada
    const clinicaId = searchParams.get('clinicaId') || ''

    const where = {
      clinicaId,
      ativo: true,
      deletedAt: null,
      ...(search && {
        OR: [
          { nome: { contains: search, mode: 'insensitive' as const } },
          { cpf: { contains: search } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const [pacientes, total] = await Promise.all([
      prisma.paciente.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { nome: 'asc' },
      }),
      prisma.paciente.count({ where }),
    ])

    return NextResponse.json({
      data: pacientes,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('Erro ao listar pacientes:', error)
    return NextResponse.json(
      { error: 'Erro interno ao listar pacientes' },
      { status: 500 }
    )
  }
}

// POST /api/pacientes — Cadastra novo paciente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // TODO: Validar com Zod schema
    // TODO: Criptografar CPF antes de salvar
    // TODO: Extrair clinicaId da sessão autenticada

    const paciente = await prisma.paciente.create({
      data: {
        ...body,
        // clinicaId: session.user.clinicaId,
      },
    })

    return NextResponse.json({ data: paciente }, { status: 201 })
  } catch (error) {
    console.error('Erro ao cadastrar paciente:', error)
    return NextResponse.json(
      { error: 'Erro interno ao cadastrar paciente' },
      { status: 500 }
    )
  }
}
