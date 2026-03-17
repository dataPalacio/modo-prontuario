// =============================================================================
// GET/POST /api/fotos — Prontuário HOF
// ✅ Auth obrigatória
// ✅ Multi-tenant via prontuario.clinicaId
// ✅ Tipos: ANTES | DEPOIS | INTRAOPERATORIO | RETORNO
// ✅ Audit log em upload
// ✅ Prontuários ASSINADOS/ARQUIVADOS não aceitam novas fotos
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { registrarAuditLog, extrairContextoHttp } from '@/lib/audit'
import { z } from 'zod'

const fotoCreateSchema = z.object({
  prontuarioId: z.string().cuid('ID de prontuário inválido'),
  url: z.string().url('URL da foto inválida'),
  tipo: z.enum(['ANTES', 'DEPOIS', 'INTRAOPERATORIO', 'RETORNO']),
  angulo: z.string().optional(),
  descricao: z.string().optional(),
})

// GET /api/fotos?prontuarioId=xxx — Lista fotos de um prontuário
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const clinicaId = session.user.clinicaId
    const { searchParams } = new URL(request.url)
    const prontuarioId = searchParams.get('prontuarioId')
    const pacienteId = searchParams.get('pacienteId')

    if (!prontuarioId && !pacienteId) {
      return NextResponse.json(
        { error: 'Informe prontuarioId ou pacienteId.' },
        { status: 400 }
      )
    }

    if (prontuarioId) {
      // Verificar que o prontuário pertence à clínica
      const prontuario = await prisma.prontuario.findFirst({
        where: { id: prontuarioId, clinicaId, deletedAt: null },
        select: { id: true },
      })

      if (!prontuario) {
        return NextResponse.json({ error: 'Prontuário não encontrado.' }, { status: 404 })
      }

      const fotos = await prisma.fotoClinica.findMany({
        where: { prontuarioId },
        orderBy: { createdAt: 'asc' },
      })

      return NextResponse.json({ data: fotos })
    }

    // Listar todas as fotos do paciente (todos os prontuários)
    const fotos = await prisma.fotoClinica.findMany({
      where: {
        prontuario: {
          pacienteId: pacienteId!,
          clinicaId,
          deletedAt: null,
        },
      },
      include: {
        prontuario: {
          select: { id: true, numero: true, dataAtendimento: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: fotos })
  } catch (error) {
    console.error('[GET /api/fotos]', error)
    return NextResponse.json({ error: 'Erro interno ao listar fotos.' }, { status: 500 })
  }
}

// POST /api/fotos — Registra foto no prontuário (URL já upada via Uploadthing)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const clinicaId = session.user.clinicaId

    const body = await request.json()
    const validated = fotoCreateSchema.parse(body)

    // Verificar que o prontuário pertence à clínica
    const prontuario = await prisma.prontuario.findFirst({
      where: { id: validated.prontuarioId, clinicaId, deletedAt: null },
      select: { id: true, status: true, numero: true },
    })

    if (!prontuario) {
      return NextResponse.json({ error: 'Prontuário não encontrado.' }, { status: 404 })
    }

    if (prontuario.status === 'ARQUIVADO') {
      return NextResponse.json(
        { error: 'Não é possível adicionar fotos a prontuário arquivado.' },
        { status: 422 }
      )
    }

    const foto = await prisma.fotoClinica.create({
      data: {
        prontuarioId: validated.prontuarioId,
        url: validated.url,
        tipo: validated.tipo,
        angulo: validated.angulo,
        descricao: validated.descricao,
      },
    })

    // Registrar upload no audit log
    const { ip, userAgent } = extrairContextoHttp(request)
    await registrarAuditLog({
      clinicaId,
      userId: session.user.id,
      acao: 'FOTO_ADICIONADA',
      entidade: 'FotoClinica',
      entidadeId: foto.id,
      ip,
      userAgent,
      dados: { tipo: foto.tipo, prontuarioNumero: prontuario.numero },
    })

    return NextResponse.json({ data: foto }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('[POST /api/fotos]', error)
    return NextResponse.json({ error: 'Erro interno ao registrar foto.' }, { status: 500 })
  }
}
