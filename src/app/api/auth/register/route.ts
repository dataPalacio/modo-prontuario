// =============================================================================
// POST /api/auth/register — Cadastro de novo profissional + clínica
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  conselho: z.enum(['CFM', 'CFO', 'CFBM', 'CFF'], {
    errorMap: () => ({ message: 'Conselho inválido' }),
  }),
  numeroConselho: z.string().min(1, 'Número do conselho é obrigatório'),
  uf: z.string().length(2, 'UF deve ter 2 caracteres'),
  especialidade: z.string().optional(),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = registerSchema.parse(body)

    // Verificar e-mail duplicado
    const existe = await prisma.profissional.findUnique({
      where: { email: data.email },
      select: { id: true },
    })

    if (existe) {
      return NextResponse.json(
        { error: 'E-mail já cadastrado.' },
        { status: 400 }
      )
    }

    const senhaHash = await bcrypt.hash(data.password, 12)

    // Criar clínica padrão para o profissional
    const clinica = await prisma.clinica.create({
      data: {
        nome: `Clínica de ${data.nome}`,
      },
    })

    const profissional = await prisma.profissional.create({
      data: {
        clinicaId: clinica.id,
        nome: data.nome,
        email: data.email,
        senhaHash,
        conselho: data.conselho,
        numeroConselho: data.numeroConselho,
        uf: data.uf,
        especialidade: data.especialidade,
        role: 'ADMIN', // Primeiro profissional é admin da própria clínica
      },
      select: { id: true, email: true, nome: true },
    })

    return NextResponse.json(
      { message: 'Cadastro realizado com sucesso.', profissional },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error('[register] Erro:', error)
    return NextResponse.json(
      { error: 'Erro interno ao realizar cadastro.' },
      { status: 500 }
    )
  }
}
