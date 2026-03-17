// =============================================================================
// GET/PUT/DELETE /api/agenda/[id] — Prontuário HOF
// ✅ Auth obrigatória
// ✅ Multi-tenant (clinicaId da sessão)
// ✅ Audit log em atualização e cancelamento
// ✅ Status REALIZADO/CANCELADO/FALTOU são finais
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { registrarAuditLog, extrairContextoHttp } from '@/lib/audit'
import { z } from 'zod'

const agendamentoUpdateSchema = z.object({
  dataHora: z.string().datetime().optional(),
  duracaoMinutos: z.number().int().min(15).max(480).optional(),
  tipo: z.enum(['CONSULTA', 'RETORNO', 'PROCEDIMENTO', 'AVALIACAO']).optional(),
  status: z.enum(['AGENDADO', 'CONFIRMADO', 'REALIZADO', 'CANCELADO', 'FALTOU']).optional(),
  observacoes: z.string().optional().nullable(),
  prontuarioId: z.string().cuid().optional().nullable(),
})

// GET /api/agenda/[id] — Retorna agendamento individual
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const clinicaId = session.user.clinicaId
    const { id } = await params

    const agendamento = await prisma.agendamento.findFirst({
      where: { id, clinicaId },
      include: {
        paciente: { select: { id: true, nome: true, telefone: true, email: true } },
        profissional: { select: { id: true, nome: true } },
      },
    })

    if (!agendamento) {
      return NextResponse.json({ error: 'Agendamento não encontrado.' }, { status: 404 })
    }

    return NextResponse.json({ data: agendamento })
  } catch (error) {
    console.error('[GET /api/agenda/[id]]', error)
    return NextResponse.json({ error: 'Erro interno ao buscar agendamento.' }, { status: 500 })
  }
}

// PUT /api/agenda/[id] — Atualiza agendamento
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const clinicaId = session.user.clinicaId
    const { id } = await params

    const existente = await prisma.agendamento.findFirst({
      where: { id, clinicaId },
      select: { id: true, status: true, dataHora: true },
    })

    if (!existente) {
      return NextResponse.json({ error: 'Agendamento não encontrado.' }, { status: 404 })
    }

    // Status finais não podem ser alterados
    if (
      existente.status === 'CANCELADO' ||
      existente.status === 'REALIZADO' ||
      existente.status === 'FALTOU'
    ) {
      return NextResponse.json(
        { error: `Agendamento com status ${existente.status} não pode ser alterado.` },
        { status: 422 }
      )
    }

    const body = await request.json()
    const validated = agendamentoUpdateSchema.parse(body)

    const agendamento = await prisma.agendamento.update({
      where: { id },
      data: {
        ...validated,
        ...(validated.dataHora && { dataHora: new Date(validated.dataHora) }),
      },
      include: {
        paciente: { select: { id: true, nome: true } },
        profissional: { select: { id: true, nome: true } },
      },
    })

    // Registrar atualização no audit log
    const { ip, userAgent } = extrairContextoHttp(request)
    await registrarAuditLog({
      clinicaId,
      userId: session.user.id,
      acao: validated.status === 'CANCELADO' ? 'AGENDAMENTO_CANCELADO' : 'AGENDAMENTO_ATUALIZADO',
      entidade: 'Agendamento',
      entidadeId: id,
      ip,
      userAgent,
      dados: {
        statusAntes: existente.status,
        statusDepois: agendamento.status,
        dataHora: agendamento.dataHora.toISOString(),
      },
    })

    return NextResponse.json({ data: agendamento })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('[PUT /api/agenda/[id]]', error)
    return NextResponse.json({ error: 'Erro interno ao atualizar agendamento.' }, { status: 500 })
  }
}

// DELETE /api/agenda/[id] — Cancela agendamento (sem delete físico)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const clinicaId = session.user.clinicaId
    const { id } = await params

    const existente = await prisma.agendamento.findFirst({
      where: { id, clinicaId },
      select: { id: true, status: true, dataHora: true },
    })

    if (!existente) {
      return NextResponse.json({ error: 'Agendamento não encontrado.' }, { status: 404 })
    }

    if (existente.status === 'REALIZADO') {
      return NextResponse.json(
        { error: 'Agendamento realizado não pode ser cancelado.' },
        { status: 422 }
      )
    }

    // Cancelar via status, não excluir fisicamente
    await prisma.agendamento.update({
      where: { id },
      data: { status: 'CANCELADO' },
    })

    const { ip, userAgent } = extrairContextoHttp(request)
    await registrarAuditLog({
      clinicaId,
      userId: session.user.id,
      acao: 'AGENDAMENTO_CANCELADO',
      entidade: 'Agendamento',
      entidadeId: id,
      ip,
      userAgent,
      dados: { dataHora: existente.dataHora.toISOString() },
    })

    return NextResponse.json({ message: 'Agendamento cancelado com sucesso.' })
  } catch (error) {
    console.error('[DELETE /api/agenda/[id]]', error)
    return NextResponse.json({ error: 'Erro interno ao cancelar agendamento.' }, { status: 500 })
  }
}
