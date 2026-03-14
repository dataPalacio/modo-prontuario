import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { gerarNumeroProntuario } from '@/lib/utils'

// GET /api/prontuarios — Lista prontuários
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const status = searchParams.get('status')
    const pacienteId = searchParams.get('pacienteId')
    // TODO: Extrair clinicaId da sessão autenticada

    const where = {
      deletedAt: null,
      ...(status && { status: status as never }),
      ...(pacienteId && { pacienteId }),
    }

    const [prontuarios, total] = await Promise.all([
      prisma.prontuario.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { dataAtendimento: 'desc' },
        include: {
          paciente: { select: { nome: true, cpf: true } },
          profissional: { select: { nome: true, conselho: true, numeroConselho: true } },
          procedimentos: true,
          _count: { select: { fotos: true, evolucoes: true } },
        },
      }),
      prisma.prontuario.count({ where }),
    ])

    return NextResponse.json({
      data: prontuarios,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('Erro ao listar prontuários:', error)
    return NextResponse.json(
      { error: 'Erro interno ao listar prontuários' },
      { status: 500 }
    )
  }
}

// POST /api/prontuarios — Cria novo prontuário
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // TODO: Validar com Zod schema
    // TODO: Extrair profissionalId e clinicaId da sessão

    // Gerar número sequencial
    const count = await prisma.prontuario.count()
    const numero = gerarNumeroProntuario(count + 1)

    const prontuario = await prisma.prontuario.create({
      data: {
        ...body,
        numero,
        dataAtendimento: new Date(body.dataAtendimento),
      },
      include: {
        paciente: true,
        profissional: true,
      },
    })

    // TODO: Registrar log de auditoria

    return NextResponse.json({ data: prontuario }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar prontuário:', error)
    return NextResponse.json(
      { error: 'Erro interno ao criar prontuário' },
      { status: 500 }
    )
  }
}
