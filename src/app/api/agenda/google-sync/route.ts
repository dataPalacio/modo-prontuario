// =============================================================================
// POST /api/agenda/google-sync — Prontuário HOF
// Sincroniza agendamento HOF com Google Calendar do usuário
// ✅ Auth obrigatória
// ✅ Multi-tenant (clinicaId da sessão)
// ✅ Validação Zod
// ✅ Audit log AGENDAMENTO_SINCRONIZADO_GOOGLE
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { registrarAuditLog, extrairContextoHttp } from '@/lib/audit'
import { createCalendarEvent } from '@/lib/google-calendar'
import { z } from 'zod'

const googleSyncSchema = z.object({
  agendamentoId: z.string().cuid('ID de agendamento inválido'),
  googleAccessToken: z.string().min(10, 'Access token do Google inválido'),
})

// Mapa de tipo de agendamento para descrição amigável
const TIPO_LABELS: Record<string, string> = {
  CONSULTA: 'Consulta',
  RETORNO: 'Retorno',
  PROCEDIMENTO: 'Procedimento HOF',
  AVALIACAO: 'Avaliação',
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const clinicaId = session.user.clinicaId
    const userId = session.user.id

    const body = await request.json()
    const validated = googleSyncSchema.parse(body)

    // Buscar agendamento com dados necessários para o evento — multi-tenant
    const agendamento = await prisma.agendamento.findFirst({
      where: { id: validated.agendamentoId, clinicaId },
      include: {
        paciente: { select: { id: true, nome: true, email: true, telefone: true } },
        profissional: { select: { id: true, nome: true, email: true } },
      },
    })

    if (!agendamento) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado.' },
        { status: 404 }
      )
    }

    if (agendamento.status === 'CANCELADO') {
      return NextResponse.json(
        { error: 'Não é possível sincronizar agendamento cancelado.' },
        { status: 422 }
      )
    }

    // Calcular horário de fim com base na duração
    const dataInicio = new Date(agendamento.dataHora)
    const dataFim = new Date(dataInicio.getTime() + agendamento.duracaoMinutos * 60 * 1000)

    const tipoLabel = TIPO_LABELS[agendamento.tipo] ?? agendamento.tipo

    const descricao = [
      `Tipo: ${tipoLabel}`,
      `Paciente: ${agendamento.paciente.nome}`,
      `Profissional: ${agendamento.profissional.nome}`,
      agendamento.observacoes ? `Observações: ${agendamento.observacoes}` : null,
      '',
      'Agendado via Sistema HOF Prontuário',
    ]
      .filter(Boolean)
      .join('\n')

    const attendees = [
      { email: agendamento.profissional.email, displayName: agendamento.profissional.nome },
    ]

    if (agendamento.paciente.email) {
      attendees.push({
        email: agendamento.paciente.email,
        displayName: agendamento.paciente.nome,
      })
    }

    const resultado = await createCalendarEvent(validated.googleAccessToken, {
      summary: `${tipoLabel} — ${agendamento.paciente.nome}`,
      description: descricao,
      start: {
        dateTime: dataInicio.toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: dataFim.toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      attendees,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 dia antes
          { method: 'popup', minutes: 60 },       // 1 hora antes
        ],
      },
    })

    if (!resultado) {
      return NextResponse.json(
        { error: 'Falha ao criar evento no Google Calendar. Verifique o access token e tente novamente.' },
        { status: 502 }
      )
    }

    const { ip, userAgent } = extrairContextoHttp(request)
    await registrarAuditLog({
      clinicaId,
      userId,
      acao: 'AGENDAMENTO_SINCRONIZADO_GOOGLE',
      entidade: 'Agendamento',
      entidadeId: agendamento.id,
      ip,
      userAgent,
      dados: {
        googleEventId: resultado.id,
        googleEventLink: resultado.link,
        pacienteId: agendamento.paciente.id,
        dataHora: agendamento.dataHora.toISOString(),
      },
    })

    return NextResponse.json({
      data: {
        googleEventId: resultado.id,
        googleEventLink: resultado.link,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('[POST /api/agenda/google-sync]', error)
    return NextResponse.json(
      { error: 'Erro interno ao sincronizar com Google Calendar.' },
      { status: 500 }
    )
  }
}
