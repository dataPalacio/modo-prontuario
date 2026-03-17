// =============================================================================
// GET /api/dashboard/stats — Prontuário HOF
// ✅ Auth obrigatória
// ✅ Multi-tenant (clinicaId da sessão)
// ✅ Métricas reais via queries Prisma
// Retorna: totais, prontuários recentes, distribuição por status
// =============================================================================

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET /api/dashboard/stats — Métricas reais do dashboard
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const clinicaId = session.user.clinicaId

    // Executar todas as queries em paralelo para performance
    const [
      totalPacientes,
      totalProntuarios,
      prontuariosPorStatus,
      prontuariosRecentes,
      totalProcedimentos,
      procedimentosPorTipo,
      evolucoesPendentesRetorno,
      atividadeUltimos30Dias,
    ] = await Promise.all([
      // Total de pacientes ativos
      prisma.paciente.count({
        where: { clinicaId, deletedAt: null, ativo: true },
      }),

      // Total de prontuários
      prisma.prontuario.count({
        where: { clinicaId, deletedAt: null },
      }),

      // Distribuição por status
      prisma.prontuario.groupBy({
        by: ['status'],
        where: { clinicaId, deletedAt: null },
        _count: { id: true },
      }),

      // Últimos 10 prontuários
      prisma.prontuario.findMany({
        where: { clinicaId, deletedAt: null },
        take: 10,
        orderBy: { dataAtendimento: 'desc' },
        include: {
          paciente: { select: { id: true, nome: true } },
          profissional: { select: { id: true, nome: true } },
          _count: { select: { procedimentos: true } },
        },
      }),

      // Total de procedimentos realizados
      prisma.procedimento.count({
        where: { prontuario: { clinicaId, deletedAt: null } },
      }),

      // Top procedimentos por tipo
      prisma.procedimento.groupBy({
        by: ['tipo'],
        where: { prontuario: { clinicaId, deletedAt: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),

      // Evoluções com retorno necessário ainda não agendado
      prisma.evolucao.count({
        where: {
          retornoNecessario: true,
          dataRetorno: { gt: new Date() },
          prontuario: { clinicaId, deletedAt: null },
        },
      }),

      // Prontuários criados nos últimos 30 dias (atividade)
      prisma.prontuario.count({
        where: {
          clinicaId,
          deletedAt: null,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ])

    // Formatar distribuição por status em mapa legível
    const statusMap = prontuariosPorStatus.reduce(
      (acc, item) => {
        acc[item.status] = item._count.id
        return acc
      },
      {} as Record<string, number>
    )

    return NextResponse.json({
      data: {
        totais: {
          pacientes: totalPacientes,
          prontuarios: totalProntuarios,
          procedimentos: totalProcedimentos,
          retornosPendentes: evolucoesPendentesRetorno,
          prontuariosUltimos30Dias: atividadeUltimos30Dias,
        },
        prontuariosPorStatus: {
          ABERTO: statusMap['ABERTO'] || 0,
          EM_ANDAMENTO: statusMap['EM_ANDAMENTO'] || 0,
          ASSINADO: statusMap['ASSINADO'] || 0,
          ARQUIVADO: statusMap['ARQUIVADO'] || 0,
        },
        prontuariosRecentes,
        topProcedimentos: procedimentosPorTipo.map((p) => ({
          tipo: p.tipo,
          total: p._count.id,
        })),
      },
    })
  } catch (error) {
    console.error('[GET /api/dashboard/stats]', error)
    return NextResponse.json({ error: 'Erro interno ao buscar estatísticas.' }, { status: 500 })
  }
}
