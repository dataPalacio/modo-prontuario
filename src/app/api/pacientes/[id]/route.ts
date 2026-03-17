// =============================================================================
// GET/PUT/DELETE /api/pacientes/[id] — Prontuário HOF
// ✅ Auth obrigatória (JWT session)
// ✅ Multi-tenant (clinicaId da sessão)
// ✅ CPF decriptografado apenas no GET individual
// ✅ Audit log em visualização, edição e exclusão
// ✅ Soft delete via deletedAt (nunca delete físico — LGPD)
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { encrypt, decrypt, hashCPF } from '@/lib/crypto'
import { registrarAuditLog, extrairContextoHttp, AUDIT_ACOES } from '@/lib/audit'
import { z } from 'zod'

const pacienteUpdateSchema = z.object({
  nome: z.string().min(3).optional(),
  dataNasc: z.string().datetime().or(z.date()).optional(),
  sexo: z.enum(['MASCULINO', 'FEMININO', 'OUTRO', 'NAO_INFORMADO']).optional(),
  email: z.string().email().optional().nullable(),
  telefone: z.string().regex(/^\d{10,11}$/, 'Telefone deve ter 10 ou 11 dígitos').optional(),
  whatsapp: z.string().regex(/^\d{10,11}$/).optional().nullable(),
  fotoUrl: z.string().url().optional().nullable(),
  observacoes: z.string().optional().nullable(),
  endereco: z
    .object({
      logradouro: z.string(),
      numero: z.string(),
      complemento: z.string().optional(),
      bairro: z.string(),
      cidade: z.string(),
      uf: z.string().length(2),
      cep: z.string().length(8),
    })
    .optional(),
})

// GET /api/pacientes/[id] — Retorna paciente com CPF decriptografado
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

    const paciente = await prisma.paciente.findFirst({
      where: { id, clinicaId, deletedAt: null }, // ⚠️ clinicaId obrigatório
      include: {
        prontuarios: {
          where: { deletedAt: null },
          orderBy: { dataAtendimento: 'desc' },
          select: {
            id: true,
            numero: true,
            dataAtendimento: true,
            status: true,
            queixaPrincipal: true,
            profissional: { select: { id: true, nome: true } },
          },
        },
        _count: { select: { prontuarios: true } },
      },
    })

    if (!paciente) {
      return NextResponse.json({ error: 'Paciente não encontrado.' }, { status: 404 })
    }

    // Decriptografar CPF apenas para retorno individual
    let cpfDecriptografado: string | null = null
    try {
      cpfDecriptografado = decrypt(paciente.cpf)
    } catch {
      cpfDecriptografado = null // Não expõe erro de criptografia ao cliente
    }

    // Registrar visualização no audit log
    const { ip, userAgent } = extrairContextoHttp(request)
    await registrarAuditLog({
      clinicaId,
      userId: session.user.id,
      acao: AUDIT_ACOES.PACIENTE_VISUALIZADO,
      entidade: 'Paciente',
      entidadeId: id,
      ip,
      userAgent,
    })

    return NextResponse.json({
      data: {
        ...paciente,
        cpf: cpfDecriptografado,
        cpfHash: undefined, // Nunca expor o hash ao cliente
      },
    })
  } catch (error) {
    console.error('[GET /api/pacientes/[id]]', error)
    return NextResponse.json({ error: 'Erro interno ao buscar paciente.' }, { status: 500 })
  }
}

// PUT /api/pacientes/[id] — Atualiza dados do paciente
export async function PUT(
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

    // Verificar que o paciente pertence à clínica
    const existente = await prisma.paciente.findFirst({
      where: { id, clinicaId, deletedAt: null },
      select: { id: true, nome: true, cpf: true },
    })

    if (!existente) {
      return NextResponse.json({ error: 'Paciente não encontrado.' }, { status: 404 })
    }

    const body = await request.json()
    const validated = pacienteUpdateSchema.parse(body)

    const updateData: Record<string, unknown> = {
      ...validated,
      ...(validated.dataNasc && { dataNasc: new Date(validated.dataNasc) }),
      updatedAt: new Date(),
    }

    const paciente = await prisma.paciente.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        nome: true,
        dataNasc: true,
        sexo: true,
        email: true,
        telefone: true,
        whatsapp: true,
        fotoUrl: true,
        observacoes: true,
        updatedAt: true,
      },
    })

    // Registrar edição no audit log
    const { ip, userAgent } = extrairContextoHttp(request)
    await registrarAuditLog({
      clinicaId,
      userId: session.user.id,
      acao: AUDIT_ACOES.PACIENTE_EDITADO,
      entidade: 'Paciente',
      entidadeId: id,
      ip,
      userAgent,
      dados: { antes: { nome: existente.nome }, depois: { nome: paciente.nome } },
    })

    return NextResponse.json({ data: paciente })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('[PUT /api/pacientes/[id]]', error)
    return NextResponse.json({ error: 'Erro interno ao atualizar paciente.' }, { status: 500 })
  }
}

// DELETE /api/pacientes/[id] — Soft delete (LGPD — nunca deleta fisicamente)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    // Somente ADMIN pode excluir pacientes
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Permissão negada. Apenas administradores podem excluir pacientes.' }, { status: 403 })
    }

    const clinicaId = session.user.clinicaId
    const { id } = await params

    const existente = await prisma.paciente.findFirst({
      where: { id, clinicaId, deletedAt: null },
      select: { id: true, nome: true },
    })

    if (!existente) {
      return NextResponse.json({ error: 'Paciente não encontrado.' }, { status: 404 })
    }

    // Soft delete — nunca deletar fisicamente (retenção LGPD/CFM)
    await prisma.paciente.update({
      where: { id },
      data: { deletedAt: new Date(), ativo: false },
    })

    // Registrar exclusão no audit log
    const { ip, userAgent } = extrairContextoHttp(request)
    await registrarAuditLog({
      clinicaId,
      userId: session.user.id,
      acao: AUDIT_ACOES.PACIENTE_EXCLUIDO,
      entidade: 'Paciente',
      entidadeId: id,
      ip,
      userAgent,
      dados: { nome: existente.nome },
    })

    return NextResponse.json({ message: 'Paciente removido com sucesso.' })
  } catch (error) {
    console.error('[DELETE /api/pacientes/[id]]', error)
    return NextResponse.json({ error: 'Erro interno ao excluir paciente.' }, { status: 500 })
  }
}
