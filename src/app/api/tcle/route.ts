// =============================================================================
// GET/POST /api/tcle — Prontuário HOF
// ✅ Auth obrigatória
// ✅ Multi-tenant via prontuario.clinicaId
// ✅ Versão do template TCLE registrada
// ✅ Audit log em criação
// ✅ TCLE é 1:1 com prontuário (único por prontuário)
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { registrarAuditLog, extrairContextoHttp } from '@/lib/audit'
import { z } from 'zod'

// Versão atual do template TCLE — incrementar ao alterar o template
const TCLE_VERSAO_ATUAL = '1.0.0'

const tcleCreateSchema = z.object({
  prontuarioId: z.string().cuid('ID de prontuário inválido'),
  conteudo: z.string().min(50, 'Conteúdo do TCLE deve ter ao menos 50 caracteres'),
  versao: z.string().optional(),
})

// GET /api/tcle?prontuarioId=xxx — Retorna TCLE de um prontuário
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

    const tcle = await prisma.tcle.findUnique({
      where: { prontuarioId },
    })

    if (!tcle) {
      return NextResponse.json({ error: 'TCLE não encontrado para este prontuário.' }, { status: 404 })
    }

    return NextResponse.json({ data: tcle })
  } catch (error) {
    console.error('[GET /api/tcle]', error)
    return NextResponse.json({ error: 'Erro interno ao buscar TCLE.' }, { status: 500 })
  }
}

// POST /api/tcle — Cria TCLE para um prontuário
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const clinicaId = session.user.clinicaId

    const body = await request.json()
    const validated = tcleCreateSchema.parse(body)

    // Verificar que o prontuário pertence à clínica (cross-tenant protection)
    const prontuario = await prisma.prontuario.findFirst({
      where: { id: validated.prontuarioId, clinicaId, deletedAt: null },
      select: { id: true, pacienteId: true, status: true, numero: true },
    })

    if (!prontuario) {
      return NextResponse.json({ error: 'Prontuário não encontrado.' }, { status: 404 })
    }

    if (prontuario.status === 'ASSINADO' || prontuario.status === 'ARQUIVADO') {
      return NextResponse.json(
        { error: 'Não é possível criar TCLE para prontuário assinado ou arquivado.' },
        { status: 422 }
      )
    }

    // Verificar se já existe TCLE para este prontuário
    const tcleExistente = await prisma.tcle.findUnique({
      where: { prontuarioId: validated.prontuarioId },
      select: { id: true },
    })

    if (tcleExistente) {
      return NextResponse.json(
        { error: 'Já existe um TCLE para este prontuário.' },
        { status: 409 }
      )
    }

    const tcle = await prisma.tcle.create({
      data: {
        prontuarioId: validated.prontuarioId,
        pacienteId: prontuario.pacienteId,
        conteudo: validated.conteudo,
        versao: validated.versao || TCLE_VERSAO_ATUAL,
      },
    })

    // Registrar criação no audit log
    const { ip, userAgent } = extrairContextoHttp(request)
    await registrarAuditLog({
      clinicaId,
      userId: session.user.id,
      acao: 'TCLE_CRIADO',
      entidade: 'Tcle',
      entidadeId: tcle.id,
      ip,
      userAgent,
      dados: { prontuarioNumero: prontuario.numero, versao: tcle.versao },
    })

    return NextResponse.json({ data: tcle }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('[POST /api/tcle]', error)
    return NextResponse.json({ error: 'Erro interno ao criar TCLE.' }, { status: 500 })
  }
}
