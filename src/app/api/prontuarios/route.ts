// =============================================================================
// GET/POST /api/prontuarios — Prontuário HOF
// ✅ Auth obrigatória (JWT session)
// ✅ Multi-tenant (clinicaId da sessão — nunca do body)
// ✅ Audit log em visualização de lista e criação
// ✅ Soft delete via deletedAt
// ✅ Número sequencial gerado no servidor
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { gerarNumeroProntuario } from '@/lib/utils'
import { prontuarioSchema } from '@/lib/validations/prontuario.schema'
import { registrarAuditLog, extrairContextoHttp, AUDIT_ACOES } from '@/lib/audit'
import { z } from 'zod'

// GET /api/prontuarios — Lista prontuários da clínica autenticada
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
    const status = searchParams.get('status')
    const pacienteId = searchParams.get('pacienteId')

    const where = {
      clinicaId, // ⚠️ isolamento multi-tenant
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
          paciente: { select: { id: true, nome: true } },
          profissional: {
            select: { id: true, nome: true, conselho: true, numeroConselho: true },
          },
          procedimentos: { select: { id: true, tipo: true } },
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
    console.error('[GET /api/prontuarios]', error)
    return NextResponse.json({ error: 'Erro interno ao listar prontuários.' }, { status: 500 })
  }
}

// POST /api/prontuarios — Cria novo prontuário
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const clinicaId = session.user.clinicaId
    const profissionalId = session.user.id

    const body = await request.json()
    const validated = prontuarioSchema.parse(body)

    // Verificar se paciente pertence à clínica (proteção cross-tenant)
    const paciente = await prisma.paciente.findFirst({
      where: { id: validated.pacienteId, clinicaId, deletedAt: null },
      select: { id: true },
    })

    if (!paciente) {
      return NextResponse.json(
        { error: 'Paciente não encontrado nesta clínica.' },
        { status: 404 }
      )
    }

    // Gerar número sequencial único para a clínica
    const count = await prisma.prontuario.count({ where: { clinicaId } })
    const numero = gerarNumeroProntuario(count + 1)

    const prontuario = await prisma.prontuario.create({
      data: {
        clinicaId, // ⚠️ sempre da sessão
        profissionalId,
        pacienteId: validated.pacienteId,
        numero,
        dataAtendimento: new Date(validated.dataAtendimento),
        queixaPrincipal: validated.queixaPrincipal,
        anamnese: validated.anamnese ?? undefined,
        avaliacaoFacial: validated.avaliacaoFacial ?? undefined,
      },
      include: {
        paciente: { select: { id: true, nome: true } },
        profissional: { select: { id: true, nome: true } },
      },
    })

    // Registrar audit log
    const { ip, userAgent } = extrairContextoHttp(request)
    await registrarAuditLog({
      clinicaId,
      userId: profissionalId,
      acao: AUDIT_ACOES.PRONTUARIO_CRIADO,
      entidade: 'Prontuario',
      entidadeId: prontuario.id,
      ip,
      userAgent,
      dados: { numero, pacienteId: validated.pacienteId },
    })

    return NextResponse.json({ data: prontuario }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error('[POST /api/prontuarios]', error)
    return NextResponse.json({ error: 'Erro interno ao criar prontuário.' }, { status: 500 })
  }
}
