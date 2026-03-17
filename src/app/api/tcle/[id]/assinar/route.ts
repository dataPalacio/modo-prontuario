// =============================================================================
// POST /api/tcle/[id]/assinar — Prontuário HOF
// ✅ Auth obrigatória
// ✅ Multi-tenant via prontuario.clinicaId
// ✅ Registra assinatura digital (base64 PNG), IP e user-agent
// ✅ Audit log com TCLE_ASSINADO
// ✅ TCLE assinado é imutável
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { registrarAuditLog, extrairContextoHttp, AUDIT_ACOES } from '@/lib/audit'
import { z } from 'zod'

const tcleAssinarSchema = z.object({
  assinaturaUrl: z.string().min(50, 'Assinatura digital inválida (base64 esperado)'),
})

// POST /api/tcle/[id]/assinar — Registra assinatura do paciente no TCLE
export async function POST(
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

    // Buscar TCLE com prontuário para verificar clinicaId
    const tcle = await prisma.tcle.findUnique({
      where: { id },
      include: {
        prontuario: {
          select: { clinicaId: true, numero: true },
        },
      },
    })

    if (!tcle) {
      return NextResponse.json({ error: 'TCLE não encontrado.' }, { status: 404 })
    }

    // Verificar cross-tenant
    if (tcle.prontuario.clinicaId !== clinicaId) {
      return NextResponse.json({ error: 'TCLE não encontrado.' }, { status: 404 })
    }

    // TCLE já assinado é imutável
    if (tcle.assinadoEm) {
      return NextResponse.json(
        { error: 'Este TCLE já foi assinado e não pode ser alterado.' },
        { status: 422 }
      )
    }

    const body = await request.json()
    const validated = tcleAssinarSchema.parse(body)

    // Extrair IP real do paciente (não do profissional autenticado)
    const { ip, userAgent } = extrairContextoHttp(request)

    const tcleAssinado = await prisma.tcle.update({
      where: { id },
      data: {
        assinaturaUrl: validated.assinaturaUrl,
        ipAssinatura: ip,
        userAgent,
        assinadoEm: new Date(),
      },
    })

    // Registrar assinatura no audit log (obrigatório CFM/LGPD)
    await registrarAuditLog({
      clinicaId,
      userId: session.user.id,
      acao: AUDIT_ACOES.TCLE_ASSINADO,
      entidade: 'Tcle',
      entidadeId: id,
      ip,
      userAgent,
      dados: {
        prontuarioNumero: tcle.prontuario.numero,
        assinadoEm: tcleAssinado.assinadoEm?.toISOString(),
        ipAssinatura: ip,
      },
    })

    return NextResponse.json({
      data: {
        id: tcleAssinado.id,
        assinadoEm: tcleAssinado.assinadoEm,
        versao: tcleAssinado.versao,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('[POST /api/tcle/[id]/assinar]', error)
    return NextResponse.json({ error: 'Erro interno ao assinar TCLE.' }, { status: 500 })
  }
}
