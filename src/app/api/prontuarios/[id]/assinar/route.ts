// =============================================================================
// POST /api/prontuarios/[id]/assinar — Prontuário HOF
// ✅ Auth obrigatória
// ✅ Multi-tenant (clinicaId da sessão)
// ✅ Gera hash SHA-256 de integridade do conteúdo (CFM)
// ✅ Status muda para ASSINADO (imutável após assinatura)
// ✅ Registra assinadoPor + assinadoEm
// ✅ Audit log obrigatório
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { sha256 } from '@/lib/crypto'
import { registrarAuditLog, extrairContextoHttp, AUDIT_ACOES } from '@/lib/audit'

// POST /api/prontuarios/[id]/assinar — Assina e trava o prontuário
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
    const profissionalId = session.user.id
    const { id } = await params

    // Buscar prontuário completo para gerar hash
    const prontuario = await prisma.prontuario.findFirst({
      where: { id, clinicaId, deletedAt: null },
      include: {
        procedimentos: true,
        evolucoes: true,
        tcle: { select: { id: true, assinadoEm: true } },
      },
    })

    if (!prontuario) {
      return NextResponse.json({ error: 'Prontuário não encontrado.' }, { status: 404 })
    }

    if (prontuario.status === 'ASSINADO') {
      return NextResponse.json(
        { error: 'Prontuário já está assinado.' },
        { status: 422 }
      )
    }

    if (prontuario.status === 'ARQUIVADO') {
      return NextResponse.json(
        { error: 'Prontuário arquivado não pode ser assinado.' },
        { status: 422 }
      )
    }

    // Somente o profissional responsável ou ADMIN pode assinar
    if (prontuario.profissionalId !== profissionalId && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Apenas o profissional responsável pode assinar este prontuário.' },
        { status: 403 }
      )
    }

    // Gerar hash SHA-256 do conteúdo completo para integridade (CFM)
    const conteudoParaHash = JSON.stringify({
      id: prontuario.id,
      numero: prontuario.numero,
      clinicaId: prontuario.clinicaId,
      pacienteId: prontuario.pacienteId,
      profissionalId: prontuario.profissionalId,
      dataAtendimento: prontuario.dataAtendimento,
      queixaPrincipal: prontuario.queixaPrincipal,
      anamnese: prontuario.anamnese,
      avaliacaoFacial: prontuario.avaliacaoFacial,
      procedimentos: prontuario.procedimentos,
    })

    const hashIntegridade = sha256(conteudoParaHash)
    const agora = new Date()

    // Assinar prontuário — status ASSINADO é imutável
    const prontuarioAssinado = await prisma.prontuario.update({
      where: { id },
      data: {
        status: 'ASSINADO',
        assinadoPor: profissionalId,
        assinadoEm: agora,
        hashIntegridade,
      },
      include: {
        paciente: { select: { id: true, nome: true } },
        profissional: { select: { id: true, nome: true, conselho: true, numeroConselho: true } },
      },
    })

    // Registrar assinatura no audit log (obrigatório CFM/LGPD)
    const { ip, userAgent } = extrairContextoHttp(request)
    await registrarAuditLog({
      clinicaId,
      userId: profissionalId,
      acao: AUDIT_ACOES.PRONTUARIO_ASSINADO,
      entidade: 'Prontuario',
      entidadeId: id,
      ip,
      userAgent,
      dados: {
        numero: prontuario.numero,
        hashIntegridade,
        assinadoEm: agora.toISOString(),
      },
    })

    return NextResponse.json({
      data: prontuarioAssinado,
      hashIntegridade,
    })
  } catch (error) {
    console.error('[POST /api/prontuarios/[id]/assinar]', error)
    return NextResponse.json({ error: 'Erro interno ao assinar prontuário.' }, { status: 500 })
  }
}
