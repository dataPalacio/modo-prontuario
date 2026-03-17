// =============================================================================
// GET/DELETE /api/fotos/[id] — Prontuário HOF
// ✅ Auth obrigatória
// ✅ Multi-tenant via prontuario.clinicaId
// ✅ Audit log em exclusão
// ✅ Não permite excluir fotos de prontuários ASSINADOS/ARQUIVADOS
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { registrarAuditLog, extrairContextoHttp } from '@/lib/audit'

// GET /api/fotos/[id] — Retorna foto individual
export async function GET(
  request: NextRequest,
  context: RouteContext<'/api/fotos/[id]'>
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const clinicaId = session.user.clinicaId
    const { id } = await context.params

    const foto = await prisma.fotoClinica.findUnique({
      where: { id },
      include: {
        prontuario: {
          select: { id: true, numero: true, clinicaId: true, pacienteId: true },
        },
      },
    })

    if (!foto || foto.prontuario.clinicaId !== clinicaId) {
      return NextResponse.json({ error: 'Foto não encontrada.' }, { status: 404 })
    }

    return NextResponse.json({ data: foto })
  } catch (error) {
    console.error('[GET /api/fotos/[id]]', error)
    return NextResponse.json({ error: 'Erro interno ao buscar foto.' }, { status: 500 })
  }
}

// DELETE /api/fotos/[id] — Remove foto (apenas em prontuários editáveis)
export async function DELETE(
  request: NextRequest,
  context: RouteContext<'/api/fotos/[id]'>
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const clinicaId = session.user.clinicaId
    const { id } = await context.params

    const foto = await prisma.fotoClinica.findUnique({
      where: { id },
      include: {
        prontuario: {
          select: {
            id: true,
            numero: true,
            clinicaId: true,
            status: true,
          },
        },
      },
    })

    if (!foto || foto.prontuario.clinicaId !== clinicaId) {
      return NextResponse.json({ error: 'Foto não encontrada.' }, { status: 404 })
    }

    if (
      foto.prontuario.status === 'ASSINADO' ||
      foto.prontuario.status === 'ARQUIVADO'
    ) {
      return NextResponse.json(
        { error: 'Não é possível excluir fotos de prontuário assinado ou arquivado.' },
        { status: 422 }
      )
    }

    await prisma.fotoClinica.delete({ where: { id } })

    // Registrar exclusão no audit log
    const { ip, userAgent } = extrairContextoHttp(request)
    await registrarAuditLog({
      clinicaId,
      userId: session.user.id,
      acao: 'FOTO_REMOVIDA',
      entidade: 'FotoClinica',
      entidadeId: id,
      ip,
      userAgent,
      dados: { tipo: foto.tipo, prontuarioNumero: foto.prontuario.numero },
    })

    return NextResponse.json({ message: 'Foto removida com sucesso.' })
  } catch (error) {
    console.error('[DELETE /api/fotos/[id]]', error)
    return NextResponse.json({ error: 'Erro interno ao remover foto.' }, { status: 500 })
  }
}
