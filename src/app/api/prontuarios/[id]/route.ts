// =============================================================================
// GET/PUT/DELETE /api/prontuarios/[id] — Prontuário HOF
// ✅ Auth obrigatória (JWT session)
// ✅ Multi-tenant (clinicaId da sessão)
// ✅ Audit log em visualização, edição e arquivamento
// ✅ Soft delete via deletedAt (nunca delete físico — CFM 1.638/2002)
// ✅ Prontuário ASSINADO é imutável (apenas arquivamento permitido)
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { registrarAuditLog, extrairContextoHttp, AUDIT_ACOES } from '@/lib/audit'
import { z } from 'zod'

const prontuarioUpdateSchema = z.object({
  dataAtendimento: z.string().datetime().or(z.date()).optional(),
  queixaPrincipal: z.string().min(5, 'Queixa principal deve ter ao menos 5 caracteres').optional(),
  anamnese: z.record(z.string(), z.unknown()).optional(),
  avaliacaoFacial: z.record(z.string(), z.unknown()).optional(),
  status: z.enum(['ABERTO', 'EM_ANDAMENTO']).optional(), // ASSINADO e ARQUIVADO via endpoints específicos
})

// GET /api/prontuarios/[id] — Retorna prontuário com todos os relacionamentos
export async function GET(
  request: NextRequest,
  context: RouteContext<'/api/prontuarios/[id]'>
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const clinicaId = session.user.clinicaId
    const { id } = await context.params

    const prontuario = await prisma.prontuario.findFirst({
      where: { id, clinicaId, deletedAt: null }, // ⚠️ clinicaId obrigatório
      include: {
        paciente: {
          select: {
            id: true,
            nome: true,
            dataNasc: true,
            sexo: true,
            telefone: true,
            email: true,
          },
        },
        profissional: {
          select: {
            id: true,
            nome: true,
            conselho: true,
            numeroConselho: true,
            uf: true,
            especialidade: true,
            assinaturaUrl: true,
          },
        },
        procedimentos: {
          orderBy: { createdAt: 'asc' },
        },
        evolucoes: {
          orderBy: { data: 'desc' },
        },
        fotos: {
          orderBy: { createdAt: 'asc' },
        },
        tcle: true,
      },
    })

    if (!prontuario) {
      return NextResponse.json({ error: 'Prontuário não encontrado.' }, { status: 404 })
    }

    // Registrar visualização no audit log (obrigatório CFM)
    const { ip, userAgent } = extrairContextoHttp(request)
    await registrarAuditLog({
      clinicaId,
      userId: session.user.id,
      acao: AUDIT_ACOES.PRONTUARIO_VISUALIZADO,
      entidade: 'Prontuario',
      entidadeId: id,
      ip,
      userAgent,
    })

    return NextResponse.json({ data: prontuario })
  } catch (error) {
    console.error('[GET /api/prontuarios/[id]]', error)
    return NextResponse.json({ error: 'Erro interno ao buscar prontuário.' }, { status: 500 })
  }
}

// PUT /api/prontuarios/[id] — Atualiza prontuário (somente ABERTO ou EM_ANDAMENTO)
export async function PUT(
  request: NextRequest,
  context: RouteContext<'/api/prontuarios/[id]'>
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const clinicaId = session.user.clinicaId
    const { id } = await context.params

    const existente = await prisma.prontuario.findFirst({
      where: { id, clinicaId, deletedAt: null },
      select: { id: true, status: true, profissionalId: true, queixaPrincipal: true },
    })

    if (!existente) {
      return NextResponse.json({ error: 'Prontuário não encontrado.' }, { status: 404 })
    }

    // Prontuário assinado ou arquivado não pode ser editado
    if (existente.status === 'ASSINADO' || existente.status === 'ARQUIVADO') {
      return NextResponse.json(
        { error: `Prontuário com status ${existente.status} não pode ser editado.` },
        { status: 422 }
      )
    }

    // Apenas o profissional que criou ou ADMIN pode editar
    if (
      existente.profissionalId !== session.user.id &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: 'Apenas o profissional responsável ou administrador pode editar este prontuário.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validated = prontuarioUpdateSchema.parse(body)

    const updateData: Record<string, unknown> = {
      ...validated,
      ...(validated.dataAtendimento && { dataAtendimento: new Date(validated.dataAtendimento) }),
    }

    const prontuario = await prisma.prontuario.update({
      where: { id },
      data: updateData,
      include: {
        paciente: { select: { id: true, nome: true } },
        profissional: { select: { id: true, nome: true } },
      },
    })

    // Registrar edição no audit log
    const { ip, userAgent } = extrairContextoHttp(request)
    await registrarAuditLog({
      clinicaId,
      userId: session.user.id,
      acao: AUDIT_ACOES.PRONTUARIO_EDITADO,
      entidade: 'Prontuario',
      entidadeId: id,
      ip,
      userAgent,
      dados: {
        antes: { queixaPrincipal: existente.queixaPrincipal },
        depois: { queixaPrincipal: prontuario.queixaPrincipal },
      },
    })

    return NextResponse.json({ data: prontuario })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('[PUT /api/prontuarios/[id]]', error)
    return NextResponse.json({ error: 'Erro interno ao atualizar prontuário.' }, { status: 500 })
  }
}

// DELETE /api/prontuarios/[id] — Arquiva prontuário (soft delete — CFM exige retenção 20 anos)
export async function DELETE(
  request: NextRequest,
  context: RouteContext<'/api/prontuarios/[id]'>
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    // Somente ADMIN pode arquivar prontuários
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Permissão negada. Apenas administradores podem arquivar prontuários.' },
        { status: 403 }
      )
    }

    const clinicaId = session.user.clinicaId
    const { id } = await context.params

    const existente = await prisma.prontuario.findFirst({
      where: { id, clinicaId, deletedAt: null },
      select: { id: true, numero: true, status: true },
    })

    if (!existente) {
      return NextResponse.json({ error: 'Prontuário não encontrado.' }, { status: 404 })
    }

    // Soft delete — nunca deletar fisicamente (CFM 1.638/2002 — retenção 20 anos)
    await prisma.prontuario.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'ARQUIVADO',
      },
    })

    // Registrar arquivamento no audit log
    const { ip, userAgent } = extrairContextoHttp(request)
    await registrarAuditLog({
      clinicaId,
      userId: session.user.id,
      acao: AUDIT_ACOES.PRONTUARIO_ARQUIVADO,
      entidade: 'Prontuario',
      entidadeId: id,
      ip,
      userAgent,
      dados: { numero: existente.numero },
    })

    return NextResponse.json({ message: 'Prontuário arquivado com sucesso.' })
  } catch (error) {
    console.error('[DELETE /api/prontuarios/[id]]', error)
    return NextResponse.json({ error: 'Erro interno ao arquivar prontuário.' }, { status: 500 })
  }
}
