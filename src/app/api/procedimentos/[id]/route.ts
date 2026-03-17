// =============================================================================
// GET/DELETE /api/procedimentos/[id] — Prontuário HOF
// ✅ Auth obrigatória
// ✅ Multi-tenant via prontuario.clinicaId
// ✅ Delete físico permitido apenas em prontuários ABERTOS/EM_ANDAMENTO
// ✅ Audit log em exclusão
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { registrarAuditLog, extrairContextoHttp, AUDIT_ACOES } from '@/lib/audit'

// GET /api/procedimentos/[id] — Retorna procedimento individual
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

    const procedimento = await prisma.procedimento.findUnique({
      where: { id },
      include: {
        prontuario: {
          select: { id: true, numero: true, clinicaId: true, status: true },
        },
      },
    })

    if (!procedimento) {
      return NextResponse.json({ error: 'Procedimento não encontrado.' }, { status: 404 })
    }

    // Verificar que o prontuário pertence à clínica (cross-tenant protection)
    if (procedimento.prontuario.clinicaId !== clinicaId) {
      return NextResponse.json({ error: 'Procedimento não encontrado.' }, { status: 404 })
    }

    return NextResponse.json({ data: procedimento })
  } catch (error) {
    console.error('[GET /api/procedimentos/[id]]', error)
    return NextResponse.json({ error: 'Erro interno ao buscar procedimento.' }, { status: 500 })
  }
}

// DELETE /api/procedimentos/[id] — Remove procedimento (apenas em prontuários abertos)
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

    const procedimento = await prisma.procedimento.findUnique({
      where: { id },
      include: {
        prontuario: {
          select: { id: true, numero: true, clinicaId: true, status: true },
        },
      },
    })

    if (!procedimento) {
      return NextResponse.json({ error: 'Procedimento não encontrado.' }, { status: 404 })
    }

    // Verificar cross-tenant
    if (procedimento.prontuario.clinicaId !== clinicaId) {
      return NextResponse.json({ error: 'Procedimento não encontrado.' }, { status: 404 })
    }

    // Não permite remover procedimentos de prontuários assinados/arquivados
    if (
      procedimento.prontuario.status === 'ASSINADO' ||
      procedimento.prontuario.status === 'ARQUIVADO'
    ) {
      return NextResponse.json(
        { error: 'Não é possível remover procedimentos de prontuário assinado ou arquivado.' },
        { status: 422 }
      )
    }

    await prisma.procedimento.delete({ where: { id } })

    // Registrar remoção no audit log
    const { ip, userAgent } = extrairContextoHttp(request)
    await registrarAuditLog({
      clinicaId,
      userId: session.user.id,
      acao: 'PROCEDIMENTO_REMOVIDO',
      entidade: 'Procedimento',
      entidadeId: id,
      ip,
      userAgent,
      dados: {
        tipo: procedimento.tipo,
        lote: procedimento.lote,
        prontuarioNumero: procedimento.prontuario.numero,
      },
    })

    return NextResponse.json({ message: 'Procedimento removido com sucesso.' })
  } catch (error) {
    console.error('[DELETE /api/procedimentos/[id]]', error)
    return NextResponse.json({ error: 'Erro interno ao remover procedimento.' }, { status: 500 })
  }
}
