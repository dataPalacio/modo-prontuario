// =============================================================================
// DELETE /api/evolucoes/[id] — Prontuário HOF
// ✅ Auth obrigatória
// ✅ Multi-tenant via prontuario.clinicaId
// ✅ Não permite remover de prontuários assinados/arquivados
// ✅ Audit log em exclusão
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { registrarAuditLog, extrairContextoHttp } from '@/lib/audit'

// DELETE /api/evolucoes/[id] — Remove evolução (apenas em prontuários abertos/em andamento)
export async function DELETE(
  request: NextRequest,
  context: RouteContext<'/api/evolucoes/[id]'>
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const clinicaId = session.user.clinicaId
    const { id } = await context.params

    const evolucao = await prisma.evolucao.findUnique({
      where: { id },
      include: {
        prontuario: {
          select: { id: true, numero: true, clinicaId: true, status: true },
        },
      },
    })

    if (!evolucao) {
      return NextResponse.json({ error: 'Evolução não encontrada.' }, { status: 404 })
    }

    // Verificar cross-tenant
    if (evolucao.prontuario.clinicaId !== clinicaId) {
      return NextResponse.json({ error: 'Evolução não encontrada.' }, { status: 404 })
    }

    // Não permite remover de prontuários assinados ou arquivados
    if (
      evolucao.prontuario.status === 'ASSINADO' ||
      evolucao.prontuario.status === 'ARQUIVADO'
    ) {
      return NextResponse.json(
        { error: 'Não é possível remover evoluções de prontuário assinado ou arquivado.' },
        { status: 422 }
      )
    }

    await prisma.evolucao.delete({ where: { id } })

    // Registrar remoção no audit log
    const { ip, userAgent } = extrairContextoHttp(request)
    await registrarAuditLog({
      clinicaId,
      userId: session.user.id,
      acao: 'EVOLUCAO_REMOVIDA',
      entidade: 'Evolucao',
      entidadeId: id,
      ip,
      userAgent,
      dados: { prontuarioNumero: evolucao.prontuario.numero },
    })

    return NextResponse.json({ message: 'Evolução removida com sucesso.' })
  } catch (error) {
    console.error('[DELETE /api/evolucoes/[id]]', error)
    return NextResponse.json({ error: 'Erro interno ao remover evolução.' }, { status: 500 })
  }
}
