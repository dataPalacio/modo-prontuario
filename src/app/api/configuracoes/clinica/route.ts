// =============================================================================
// GET/PUT /api/configuracoes/clinica — Prontuário HOF
// ✅ Auth obrigatória (somente ADMIN pode editar dados da clínica)
// ✅ Multi-tenant (clinicaId da sessão)
// ✅ Audit log em edição
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { registrarAuditLog, extrairContextoHttp } from '@/lib/audit'
import { z } from 'zod'

const clinicaUpdateSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter ao menos 3 caracteres').optional(),
  cnpj: z
    .string()
    .regex(/^\d{14}$/, 'CNPJ deve ter 14 dígitos numéricos')
    .optional()
    .nullable(),
  endereco: z.string().optional().nullable(),
  telefone: z
    .string()
    .regex(/^\d{10,11}$/, 'Telefone deve ter 10 ou 11 dígitos')
    .optional()
    .nullable(),
  email: z.string().email().optional().nullable(),
  logo: z.string().url().optional().nullable(),
})

// GET /api/configuracoes/clinica — Retorna dados da clínica
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const clinica = await prisma.clinica.findUnique({
      where: { id: session.user.clinicaId },
      select: {
        id: true,
        nome: true,
        cnpj: true,
        endereco: true,
        telefone: true,
        email: true,
        logo: true,
        plano: true,
        ativo: true,
        createdAt: true,
        _count: {
          select: {
            profissionais: true,
            pacientes: true,
            prontuarios: true,
          },
        },
      },
    })

    if (!clinica) {
      return NextResponse.json({ error: 'Clínica não encontrada.' }, { status: 404 })
    }

    return NextResponse.json({ data: clinica })
  } catch (error) {
    console.error('[GET /api/configuracoes/clinica]', error)
    return NextResponse.json({ error: 'Erro interno ao buscar dados da clínica.' }, { status: 500 })
  }
}

// PUT /api/configuracoes/clinica — Atualiza dados da clínica (somente ADMIN)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Permissão negada. Apenas administradores podem editar dados da clínica.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validated = clinicaUpdateSchema.parse(body)

    const clinica = await prisma.clinica.update({
      where: { id: session.user.clinicaId },
      data: validated,
      select: {
        id: true,
        nome: true,
        cnpj: true,
        endereco: true,
        telefone: true,
        email: true,
        logo: true,
        plano: true,
        updatedAt: true,
      },
    })

    // Registrar edição no audit log
    const { ip, userAgent } = extrairContextoHttp(request)
    await registrarAuditLog({
      clinicaId: session.user.clinicaId,
      userId: session.user.id,
      acao: 'CLINICA_EDITADA',
      entidade: 'Clinica',
      entidadeId: session.user.clinicaId,
      ip,
      userAgent,
    })

    return NextResponse.json({ data: clinica })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('[PUT /api/configuracoes/clinica]', error)
    return NextResponse.json({ error: 'Erro interno ao atualizar clínica.' }, { status: 500 })
  }
}
