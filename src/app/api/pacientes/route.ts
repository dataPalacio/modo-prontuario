// =============================================================================
// GET/POST /api/pacientes — Prontuário HOF
// ✅ Auth obrigatória (JWT session)
// ✅ Multi-tenant (clinicaId da sessão — nunca do body)
// ✅ CPF criptografado em repouso (AES-256-GCM)
// ✅ Audit log em criação
// ✅ Soft delete via deletedAt
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { encrypt, hashCPF } from '@/lib/crypto'
import { registrarAuditLog, extrairContextoHttp, AUDIT_ACOES } from '@/lib/audit'
import { pacienteSchema } from '@/lib/validations/paciente.schema'
import { z } from 'zod'

// GET /api/pacientes — Lista pacientes da clínica autenticada
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const clinicaId = session.user.clinicaId
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(100, parseInt(searchParams.get('pageSize') || '20'))
    const search = searchParams.get('search') || ''

    const where = {
      clinicaId, // ⚠️ isolamento multi-tenant — NUNCA remover
      deletedAt: null,
      ativo: true,
      ...(search && {
        OR: [
          { nome: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const [pacientes, total] = await Promise.all([
      prisma.paciente.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { nome: 'asc' },
        select: {
          id: true,
          nome: true,
          dataNasc: true,
          sexo: true,
          email: true,
          telefone: true,
          whatsapp: true,
          fotoUrl: true,
          ativo: true,
          createdAt: true,
          // CPF omitido da listagem — acesso apenas via GET /api/pacientes/[id]
          _count: { select: { prontuarios: true } },
        },
      }),
      prisma.paciente.count({ where }),
    ])

    return NextResponse.json({
      data: pacientes,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('[GET /api/pacientes]', error)
    return NextResponse.json({ error: 'Erro interno ao listar pacientes.' }, { status: 500 })
  }
}

// POST /api/pacientes — Cadastra novo paciente
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const clinicaId = session.user.clinicaId
    const userId = session.user.id

    const body = await request.json()
    const validated = pacienteSchema.parse(body)

    // Verificar duplicidade de CPF na clínica (por hash)
    const cpfHash = hashCPF(validated.cpf)
    const cpfExiste = await prisma.paciente.findFirst({
      where: { clinicaId, cpfHash, deletedAt: null },
      select: { id: true },
    })

    if (cpfExiste) {
      return NextResponse.json(
        { error: 'Já existe um paciente com este CPF nesta clínica.' },
        { status: 409 }
      )
    }

    // Criptografar CPF antes de salvar
    const cpfCriptografado = encrypt(validated.cpf)

    const paciente = await prisma.paciente.create({
      data: {
        clinicaId, // ⚠️ sempre da sessão
        nome: validated.nome,
        cpf: cpfCriptografado,
        cpfHash,
        dataNasc: new Date(validated.dataNasc),
        sexo: validated.sexo,
        email: validated.email,
        telefone: validated.telefone,
        whatsapp: validated.whatsapp,
        endereco: validated.endereco,
        observacoes: validated.observacoes,
      },
      select: {
        id: true,
        nome: true,
        dataNasc: true,
        sexo: true,
        email: true,
        telefone: true,
        createdAt: true,
      },
    })

    // Registrar audit log
    const { ip, userAgent } = extrairContextoHttp(request)
    await registrarAuditLog({
      clinicaId,
      userId,
      acao: AUDIT_ACOES.PACIENTE_CRIADO,
      entidade: 'Paciente',
      entidadeId: paciente.id,
      ip,
      userAgent,
    })

    return NextResponse.json({ data: paciente }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error('[POST /api/pacientes]', error)
    return NextResponse.json({ error: 'Erro interno ao cadastrar paciente.' }, { status: 500 })
  }
}
