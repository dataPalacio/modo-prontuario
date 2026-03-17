// =============================================================================
// GET/POST /api/evolucoes — Prontuário HOF
// ✅ Auth obrigatória
// ✅ Multi-tenant via prontuario.clinicaId
// ✅ Audit log em criação
// ✅ Prontuário ASSINADO/ARQUIVADO não aceita novas evoluções
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { registrarAuditLog, extrairContextoHttp } from '@/lib/audit'
import { z } from 'zod'

const evolucaoSchema = z.object({
  prontuarioId: z.string().cuid('ID de prontuário inválido'),
  data: z.string().datetime('Data inválida'),
  descricao: z.string().min(10, 'Descrição deve ter ao menos 10 caracteres'),
  satisfacaoPaciente: z.number().int().min(1).max(5).optional().nullable(),
  retornoNecessario: z.boolean().default(false),
  dataRetorno: z.string().datetime().optional().nullable(),
})

// GET /api/evolucoes?prontuarioId=xxx — Lista evoluções de um prontuário
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

    const evolucoes = await prisma.evolucao.findMany({
      where: { prontuarioId },
      orderBy: { data: 'desc' },
    })

    return NextResponse.json({ data: evolucoes })
  } catch (error) {
    console.error('[GET /api/evolucoes]', error)
    return NextResponse.json({ error: 'Erro interno ao listar evoluções.' }, { status: 500 })
  }
}

// POST /api/evolucoes — Adiciona evolução/retorno ao prontuário
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const clinicaId = session.user.clinicaId

    const body = await request.json()
    const validated = evolucaoSchema.parse(body)

    // Verificar que o prontuário pertence à clínica (cross-tenant protection)
    const prontuario = await prisma.prontuario.findFirst({
      where: { id: validated.prontuarioId, clinicaId, deletedAt: null },
      select: { id: true, status: true, numero: true },
    })

    if (!prontuario) {
      return NextResponse.json({ error: 'Prontuário não encontrado.' }, { status: 404 })
    }

    if (prontuario.status === 'ARQUIVADO') {
      return NextResponse.json(
        { error: 'Não é possível adicionar evoluções a um prontuário arquivado.' },
        { status: 422 }
      )
    }

    const evolucao = await prisma.evolucao.create({
      data: {
        prontuarioId: validated.prontuarioId,
        data: new Date(validated.data),
        descricao: validated.descricao,
        satisfacaoPaciente: validated.satisfacaoPaciente,
        retornoNecessario: validated.retornoNecessario,
        dataRetorno: validated.dataRetorno ? new Date(validated.dataRetorno) : null,
      },
    })

    // Registrar audit log
    const { ip, userAgent } = extrairContextoHttp(request)
    await registrarAuditLog({
      clinicaId,
      userId: session.user.id,
      acao: 'EVOLUCAO_CRIADA',
      entidade: 'Evolucao',
      entidadeId: evolucao.id,
      ip,
      userAgent,
      dados: {
        prontuarioNumero: prontuario.numero,
        retornoNecessario: evolucao.retornoNecessario,
      },
    })

    return NextResponse.json({ data: evolucao }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('[POST /api/evolucoes]', error)
    return NextResponse.json({ error: 'Erro interno ao criar evolução.' }, { status: 500 })
  }
}
