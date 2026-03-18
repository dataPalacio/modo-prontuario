// =============================================================================
// GET /api/lgpd/consentimento — Prontuário HOF
// Histórico de consentimentos TCLE do paciente (Art. 7 e 11 LGPD)
// ✅ Auth obrigatória
// ✅ Multi-tenant: paciente verificado pelo clinicaId da sessão
// ✅ Query param pacienteId obrigatório
// ✅ Retorna TCLEs com versão, data de assinatura e IP (sem dados sensíveis)
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const clinicaId = session.user.clinicaId
    const { searchParams } = new URL(request.url)
    const pacienteId = searchParams.get('pacienteId')

    if (!pacienteId) {
      return NextResponse.json(
        { error: 'Parâmetro pacienteId é obrigatório.' },
        { status: 400 }
      )
    }

    // Verificar que o paciente pertence à clínica (multi-tenant)
    const paciente = await prisma.paciente.findFirst({
      where: { id: pacienteId, clinicaId, deletedAt: null },
      select: { id: true, nome: true },
    })

    if (!paciente) {
      return NextResponse.json({ error: 'Paciente não encontrado.' }, { status: 404 })
    }

    // Buscar todos os TCLEs do paciente com informações de consentimento
    const tcles = await prisma.tcle.findMany({
      where: { pacienteId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        versao: true,
        assinadoEm: true,
        ipAssinatura: true,
        userAgent: true,
        createdAt: true,
        // conteudo OMITIDO — não necessário para o histórico de consentimentos
        prontuario: {
          select: {
            id: true,
            numero: true,
            dataAtendimento: true,
            status: true,
            profissional: { select: { id: true, nome: true } },
          },
        },
      },
    })

    const historico = tcles.map((tcle) => ({
      id: tcle.id,
      versao: tcle.versao,
      status: tcle.assinadoEm ? 'ASSINADO' : 'PENDENTE',
      assinadoEm: tcle.assinadoEm,
      ipAssinatura: tcle.assinadoEm ? tcle.ipAssinatura : null, // só exibir se assinado
      userAgent: tcle.assinadoEm ? tcle.userAgent : null,
      criadoEm: tcle.createdAt,
      prontuario: {
        id: tcle.prontuario.id,
        numero: tcle.prontuario.numero,
        dataAtendimento: tcle.prontuario.dataAtendimento,
        statusProntuario: tcle.prontuario.status,
        profissional: tcle.prontuario.profissional,
      },
    }))

    return NextResponse.json({
      data: {
        paciente: { id: paciente.id, nome: paciente.nome },
        historico,
        total: historico.length,
        baseLegal: 'Art. 7, II e Art. 11, I da Lei 13.709/2018 (LGPD) — consentimento como base legal para tratamento de dados de saúde',
      },
    })
  } catch (error) {
    console.error('[GET /api/lgpd/consentimento]', error)
    return NextResponse.json(
      { error: 'Erro interno ao buscar histórico de consentimentos.' },
      { status: 500 }
    )
  }
}
