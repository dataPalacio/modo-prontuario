// =============================================================================
// GET/PUT /api/configuracoes/perfil — Prontuário HOF
// ✅ Auth obrigatória
// ✅ Multi-tenant (clinicaId da sessão)
// ✅ Cada profissional edita apenas o próprio perfil
// ✅ Senha atualizada com hash bcrypt (nunca em texto claro)
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { registrarAuditLog, extrairContextoHttp } from '@/lib/audit'
import { z } from 'zod'
import { hash, compare } from 'bcryptjs'

const perfilUpdateSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter ao menos 3 caracteres').optional(),
  especialidade: z.string().optional().nullable(),
  assinaturaUrl: z.string().url().optional().nullable(),
  senhaAtual: z.string().optional(),
  novaSenha: z
    .string()
    .min(8, 'Nova senha deve ter ao menos 8 caracteres')
    .optional(),
})

// GET /api/configuracoes/perfil — Retorna perfil do profissional autenticado
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const profissional = await prisma.profissional.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        nome: true,
        email: true,
        conselho: true,
        numeroConselho: true,
        uf: true,
        especialidade: true,
        assinaturaUrl: true,
        role: true,
        ativo: true,
        createdAt: true,
        clinica: {
          select: { id: true, nome: true, plano: true },
        },
      },
    })

    if (!profissional) {
      return NextResponse.json({ error: 'Profissional não encontrado.' }, { status: 404 })
    }

    return NextResponse.json({ data: profissional })
  } catch (error) {
    console.error('[GET /api/configuracoes/perfil]', error)
    return NextResponse.json({ error: 'Erro interno ao buscar perfil.' }, { status: 500 })
  }
}

// PUT /api/configuracoes/perfil — Atualiza perfil e/ou senha
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const body = await request.json()
    const validated = perfilUpdateSchema.parse(body)

    const updateData: Record<string, unknown> = {}

    if (validated.nome) updateData.nome = validated.nome
    if (validated.especialidade !== undefined) updateData.especialidade = validated.especialidade
    if (validated.assinaturaUrl !== undefined) updateData.assinaturaUrl = validated.assinaturaUrl

    // Atualizar senha se fornecida
    if (validated.novaSenha) {
      if (!validated.senhaAtual) {
        return NextResponse.json(
          { error: 'Informe a senha atual para alterar a senha.' },
          { status: 400 }
        )
      }

      const profissional = await prisma.profissional.findUnique({
        where: { id: session.user.id },
        select: { senhaHash: true },
      })

      if (!profissional) {
        return NextResponse.json({ error: 'Profissional não encontrado.' }, { status: 404 })
      }

      const senhaCorreta = await compare(validated.senhaAtual, profissional.senhaHash)
      if (!senhaCorreta) {
        return NextResponse.json({ error: 'Senha atual incorreta.' }, { status: 401 })
      }

      updateData.senhaHash = await hash(validated.novaSenha, 12)
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Nenhum dado para atualizar.' }, { status: 400 })
    }

    const profissional = await prisma.profissional.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        nome: true,
        email: true,
        especialidade: true,
        assinaturaUrl: true,
        updatedAt: true,
      },
    })

    // Registrar edição no audit log
    const { ip, userAgent } = extrairContextoHttp(request)
    await registrarAuditLog({
      clinicaId: session.user.clinicaId,
      userId: session.user.id,
      acao: validated.novaSenha ? 'SENHA_ALTERADA' : 'PERFIL_EDITADO',
      entidade: 'Profissional',
      entidadeId: session.user.id,
      ip,
      userAgent,
    })

    return NextResponse.json({ data: profissional })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('[PUT /api/configuracoes/perfil]', error)
    return NextResponse.json({ error: 'Erro interno ao atualizar perfil.' }, { status: 500 })
  }
}
