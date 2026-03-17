// =============================================================================
// GET /api/audit — Prontuário HOF
// ✅ Auth obrigatória (apenas ADMIN)
// ✅ Multi-tenant (clinicaId da sessão)
// ✅ Paginação + filtros por entidade, ação, período e usuário
// LGPD/CFM: Logs de auditoria são obrigatórios e imutáveis
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET /api/audit — Lista logs de auditoria da clínica (somente ADMIN)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    // Somente ADMIN pode visualizar logs de auditoria
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Permissão negada. Apenas administradores podem acessar logs de auditoria.' },
        { status: 403 }
      )
    }

    const clinicaId = session.user.clinicaId
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(100, parseInt(searchParams.get('pageSize') || '50'))
    const entidade = searchParams.get('entidade') // ex: Prontuario, Paciente
    const acao = searchParams.get('acao')           // ex: PRONTUARIO_ASSINADO
    const userId = searchParams.get('userId')
    const dataInicio = searchParams.get('dataInicio')
    const dataFim = searchParams.get('dataFim')

    const where = {
      clinicaId, // ⚠️ isolamento multi-tenant
      ...(entidade && { entidade }),
      ...(acao && { acao }),
      ...(userId && { userId }),
      ...(dataInicio || dataFim
        ? {
            createdAt: {
              ...(dataInicio && { gte: new Date(dataInicio) }),
              ...(dataFim && { lte: new Date(dataFim) }),
            },
          }
        : {}),
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          profissional: {
            select: { id: true, nome: true, email: true, role: true },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ])

    return NextResponse.json({
      data: logs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('[GET /api/audit]', error)
    return NextResponse.json({ error: 'Erro interno ao buscar logs de auditoria.' }, { status: 500 })
  }
}
