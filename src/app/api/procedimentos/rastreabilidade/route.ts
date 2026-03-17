// =============================================================================
// GET /api/procedimentos/rastreabilidade?lote=X — Prontuário HOF
// ✅ Auth obrigatória
// ✅ Multi-tenant (clinicaId da sessão)
// ✅ Busca por lote ANVISA — lista todos pacientes que receberam produto do lote
// ✅ Audit log de consulta de rastreabilidade
// Uso: alertas de recall, vigilância sanitária
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { registrarAuditLog, extrairContextoHttp } from '@/lib/audit'

// GET /api/procedimentos/rastreabilidade?lote=XYZ — Rastreia todos os usos de um lote
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const clinicaId = session.user.clinicaId
    const { searchParams } = new URL(request.url)
    const lote = searchParams.get('lote')

    if (!lote || lote.trim().length === 0) {
      return NextResponse.json(
        { error: 'Parâmetro lote é obrigatório.' },
        { status: 400 }
      )
    }

    // Buscar todos procedimentos com este lote na clínica
    const procedimentos = await prisma.procedimento.findMany({
      where: {
        lote: { equals: lote, mode: 'insensitive' },
        prontuario: {
          clinicaId,
          deletedAt: null,
        },
      },
      include: {
        prontuario: {
          select: {
            id: true,
            numero: true,
            dataAtendimento: true,
            status: true,
            paciente: {
              select: {
                id: true,
                nome: true,
                telefone: true,
                email: true,
              },
            },
            profissional: {
              select: { id: true, nome: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const resultado = {
      lote,
      totalOcorrencias: procedimentos.length,
      procedimentos: procedimentos.map((p) => ({
        procedimentoId: p.id,
        tipo: p.tipo,
        produto: p.produto,
        fabricante: p.fabricante,
        validadeProduto: p.validadeProduto,
        concentracao: p.concentracao,
        volume: p.volume,
        realizadoEm: p.createdAt,
        prontuario: {
          id: p.prontuario.id,
          numero: p.prontuario.numero,
          dataAtendimento: p.prontuario.dataAtendimento,
          status: p.prontuario.status,
        },
        paciente: p.prontuario.paciente,
        profissional: p.prontuario.profissional,
      })),
    }

    // Registrar consulta de rastreabilidade no audit log
    const { ip, userAgent } = extrairContextoHttp(request)
    await registrarAuditLog({
      clinicaId,
      userId: session.user.id,
      acao: 'RASTREABILIDADE_CONSULTADA',
      entidade: 'Procedimento',
      entidadeId: lote,
      ip,
      userAgent,
      dados: { lote, totalOcorrencias: procedimentos.length },
    })

    return NextResponse.json({ data: resultado })
  } catch (error) {
    console.error('[GET /api/procedimentos/rastreabilidade]', error)
    return NextResponse.json({ error: 'Erro interno ao consultar rastreabilidade.' }, { status: 500 })
  }
}
