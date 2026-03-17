// =============================================================================
// GET/POST /api/procedimentos — Prontuário HOF
// ✅ Auth obrigatória
// ✅ Multi-tenant via prontuario.clinicaId
// ✅ Lote OBRIGATÓRIO (rastreabilidade ANVISA)
// ✅ Audit log em criação
// ✅ Prontuário ASSINADO não aceita novos procedimentos
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { registrarAuditLog, extrairContextoHttp, AUDIT_ACOES } from '@/lib/audit'
import { procedimentoSchema } from '@/lib/validations/procedimento.schema'
import { z } from 'zod'

// GET /api/procedimentos?prontuarioId=xxx — Lista procedimentos de um prontuário
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const clinicaId = session.user.clinicaId
    const { searchParams } = new URL(request.url)
    const prontuarioId = searchParams.get('prontuarioId')

    if (!prontuarioId) {
      return NextResponse.json(
        { error: 'Parâmetro prontuarioId é obrigatório.' },
        { status: 400 }
      )
    }

    // Verificar que o prontuário pertence à clínica
    const prontuario = await prisma.prontuario.findFirst({
      where: { id: prontuarioId, clinicaId, deletedAt: null },
      select: { id: true },
    })

    if (!prontuario) {
      return NextResponse.json({ error: 'Prontuário não encontrado.' }, { status: 404 })
    }

    const procedimentos = await prisma.procedimento.findMany({
      where: { prontuarioId },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ data: procedimentos })
  } catch (error) {
    console.error('[GET /api/procedimentos]', error)
    return NextResponse.json({ error: 'Erro interno ao listar procedimentos.' }, { status: 500 })
  }
}

// POST /api/procedimentos — Adiciona procedimento ao prontuário
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const clinicaId = session.user.clinicaId

    const body = await request.json()
    const validated = procedimentoSchema.parse(body)

    // Verificar que o prontuário pertence à clínica (cross-tenant protection)
    const prontuario = await prisma.prontuario.findFirst({
      where: { id: validated.prontuarioId, clinicaId, deletedAt: null },
      select: { id: true, status: true, numero: true },
    })

    if (!prontuario) {
      return NextResponse.json({ error: 'Prontuário não encontrado.' }, { status: 404 })
    }

    // Prontuário assinado não aceita novos procedimentos
    if (prontuario.status === 'ASSINADO' || prontuario.status === 'ARQUIVADO') {
      return NextResponse.json(
        { error: `Não é possível adicionar procedimentos a um prontuário com status ${prontuario.status}.` },
        { status: 422 }
      )
    }

    const procedimento = await prisma.procedimento.create({
      data: {
        prontuarioId: validated.prontuarioId,
        tipo: validated.tipo,
        regiaoAnatomica: validated.regiaoAnatomica,
        produto: validated.produto,
        fabricante: validated.fabricante,
        lote: validated.lote, // ⚠️ obrigatório — rastreabilidade ANVISA
        validadeProduto: validated.validadeProduto
          ? new Date(validated.validadeProduto as string)
          : null,
        concentracao: validated.concentracao,
        volume: validated.volume,
        tecnica: validated.tecnica,
        observacoes: validated.observacoes,
      },
    })

    // Atualizar status do prontuário para EM_ANDAMENTO se ainda ABERTO
    if (prontuario.status === 'ABERTO') {
      await prisma.prontuario.update({
        where: { id: validated.prontuarioId },
        data: { status: 'EM_ANDAMENTO' },
      })
    }

    // Registrar audit log
    const { ip, userAgent } = extrairContextoHttp(request)
    await registrarAuditLog({
      clinicaId,
      userId: session.user.id,
      acao: AUDIT_ACOES.PROCEDIMENTO_CRIADO,
      entidade: 'Procedimento',
      entidadeId: procedimento.id,
      ip,
      userAgent,
      dados: {
        tipo: procedimento.tipo,
        produto: procedimento.produto,
        lote: procedimento.lote,
        prontuarioNumero: prontuario.numero,
      },
    })

    return NextResponse.json({ data: procedimento }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('[POST /api/procedimentos]', error)
    return NextResponse.json({ error: 'Erro interno ao criar procedimento.' }, { status: 500 })
  }
}
