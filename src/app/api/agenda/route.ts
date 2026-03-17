// =============================================================================
// GET/POST /api/agenda — Prontuário HOF
// ✅ Auth obrigatória
// ✅ Multi-tenant (clinicaId da sessão)
// ✅ Detecção de conflito de horário
// ✅ Paginação e filtros por período, profissional, status
// ✅ Audit log em criação
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { registrarAuditLog, extrairContextoHttp } from '@/lib/audit'
import { z } from 'zod'

const agendamentoSchema = z.object({
  pacienteId: z.string().cuid('ID de paciente inválido'),
  profissionalId: z.string().cuid('ID de profissional inválido'),
  dataHora: z.string().datetime('Data e hora inválidas'),
  duracaoMinutos: z.number().int().min(15).max(480).default(60),
  tipo: z.enum(['CONSULTA', 'RETORNO', 'PROCEDIMENTO', 'AVALIACAO']),
  observacoes: z.string().optional(),
})

// GET /api/agenda — Lista agendamentos da clínica
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const clinicaId = session.user.clinicaId
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(100, parseInt(searchParams.get('pageSize') || '20'))
    const profissionalId = searchParams.get('profissionalId')
    const pacienteId = searchParams.get('pacienteId')
    const status = searchParams.get('status')
    const dataInicio = searchParams.get('dataInicio')
    const dataFim = searchParams.get('dataFim')

    const where = {
      clinicaId,
      ...(profissionalId && { profissionalId }),
      ...(pacienteId && { pacienteId }),
      ...(status && { status: status as never }),
      ...(dataInicio || dataFim
        ? {
            dataHora: {
              ...(dataInicio && { gte: new Date(dataInicio) }),
              ...(dataFim && { lte: new Date(dataFim) }),
            },
          }
        : {}),
    }

    const [agendamentos, total] = await Promise.all([
      prisma.agendamento.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { dataHora: 'asc' },
        include: {
          paciente: { select: { id: true, nome: true, telefone: true } },
          profissional: { select: { id: true, nome: true } },
        },
      }),
      prisma.agendamento.count({ where }),
    ])

    return NextResponse.json({
      data: agendamentos,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('[GET /api/agenda]', error)
    return NextResponse.json({ error: 'Erro interno ao listar agendamentos.' }, { status: 500 })
  }
}

// POST /api/agenda — Cria agendamento com detecção de conflito
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const clinicaId = session.user.clinicaId

    const body = await request.json()
    const validated = agendamentoSchema.parse(body)

    // Verificar que o paciente pertence à clínica
    const paciente = await prisma.paciente.findFirst({
      where: { id: validated.pacienteId, clinicaId, deletedAt: null },
      select: { id: true, nome: true },
    })

    if (!paciente) {
      return NextResponse.json({ error: 'Paciente não encontrado.' }, { status: 404 })
    }

    // Verificar que o profissional pertence à clínica
    const profissional = await prisma.profissional.findFirst({
      where: { id: validated.profissionalId, clinicaId, ativo: true },
      select: { id: true, nome: true },
    })

    if (!profissional) {
      return NextResponse.json({ error: 'Profissional não encontrado.' }, { status: 404 })
    }

    // Detectar conflito de horário para o profissional
    const dataHoraInicio = new Date(validated.dataHora)
    const dataHoraFim = new Date(
      dataHoraInicio.getTime() + validated.duracaoMinutos * 60 * 1000
    )

    const conflito = await prisma.agendamento.findFirst({
      where: {
        clinicaId,
        profissionalId: validated.profissionalId,
        status: { in: ['AGENDADO', 'CONFIRMADO'] },
        AND: [
          { dataHora: { lt: dataHoraFim } },
          {
            dataHora: {
              gte: new Date(
                dataHoraInicio.getTime() - 479 * 60 * 1000 // máx duração 8h
              ),
            },
          },
        ],
      },
      select: {
        id: true,
        dataHora: true,
        duracaoMinutos: true,
        paciente: { select: { nome: true } },
      },
    })

    if (conflito) {
      const conflitoFim = new Date(
        conflito.dataHora.getTime() + conflito.duracaoMinutos * 60 * 1000
      )
      // Verificar sobreposição real
      if (dataHoraInicio < conflitoFim) {
        return NextResponse.json(
          {
            error: `Conflito de horário. ${profissional.nome} já possui agendamento com ${conflito.paciente.nome} às ${conflito.dataHora.toISOString()}.`,
          },
          { status: 409 }
        )
      }
    }

    const agendamento = await prisma.agendamento.create({
      data: {
        clinicaId,
        pacienteId: validated.pacienteId,
        profissionalId: validated.profissionalId,
        dataHora: dataHoraInicio,
        duracaoMinutos: validated.duracaoMinutos,
        tipo: validated.tipo,
        observacoes: validated.observacoes,
      },
      include: {
        paciente: { select: { id: true, nome: true, telefone: true } },
        profissional: { select: { id: true, nome: true } },
      },
    })

    // Registrar audit log
    const { ip, userAgent } = extrairContextoHttp(request)
    await registrarAuditLog({
      clinicaId,
      userId: session.user.id,
      acao: 'AGENDAMENTO_CRIADO',
      entidade: 'Agendamento',
      entidadeId: agendamento.id,
      ip,
      userAgent,
      dados: {
        tipo: agendamento.tipo,
        dataHora: agendamento.dataHora.toISOString(),
        pacienteNome: paciente.nome,
        profissionalNome: profissional.nome,
      },
    })

    return NextResponse.json({ data: agendamento }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('[POST /api/agenda]', error)
    return NextResponse.json({ error: 'Erro interno ao criar agendamento.' }, { status: 500 })
  }
}
