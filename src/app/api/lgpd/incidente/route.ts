// =============================================================================
// POST /api/lgpd/incidente — Prontuário HOF
// Registro de incidente de dados pessoais (Art. 48 Lei 13.709/2018)
// ✅ Auth obrigatória — somente ADMIN
// ✅ Multi-tenant (clinicaId da sessão)
// ✅ Validação Zod
// ✅ Registro via AuditLog com ação INCIDENTE_DADOS_REGISTRADO
// ✅ Número de protocolo UUID gerado automaticamente
// ✅ Resposta menciona obrigação de notificar ANPD em 72h
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { registrarAuditLog, extrairContextoHttp } from '@/lib/audit'
import { z } from 'zod'
import { randomUUID } from 'crypto'

const incidenteSchema = z.object({
  descricao: z
    .string()
    .min(20, 'Descrição deve ter ao menos 20 caracteres')
    .max(5000, 'Descrição deve ter no máximo 5000 caracteres'),
  tipoIncidente: z
    .string()
    .min(3, 'Tipo do incidente é obrigatório'),
  dataOcorrencia: z.string().datetime('Data de ocorrência inválida'),
  dadosAfetados: z
    .string()
    .min(5, 'Descreva os tipos de dados afetados')
    .max(2000, 'Campo deve ter no máximo 2000 caracteres'),
  medidasAdotadas: z
    .string()
    .min(10, 'Descreva as medidas adotadas para mitigar o incidente')
    .max(2000, 'Campo deve ter no máximo 2000 caracteres'),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Permissão negada. Registro de incidentes é restrito a administradores.' },
        { status: 403 }
      )
    }

    const clinicaId = session.user.clinicaId
    const userId = session.user.id

    const body = await request.json()
    const validated = incidenteSchema.parse(body)

    const protocolo = randomUUID()
    const dataRegistro = new Date()
    const dataOcorrencia = new Date(validated.dataOcorrencia)

    // Registrar incidente via AuditLog com todos os detalhes
    const { ip, userAgent } = extrairContextoHttp(request)
    await registrarAuditLog({
      clinicaId,
      userId,
      acao: 'INCIDENTE_DADOS_REGISTRADO',
      entidade: 'LGPD',
      entidadeId: protocolo,
      ip,
      userAgent,
      dados: {
        protocolo,
        tipoIncidente: validated.tipoIncidente,
        descricao: validated.descricao,
        dataOcorrencia: dataOcorrencia.toISOString(),
        dataRegistro: dataRegistro.toISOString(),
        dadosAfetados: validated.dadosAfetados,
        medidasAdotadas: validated.medidasAdotadas,
        registradoPor: userId,
        clinicaId,
        ipRegistro: ip,
      },
    })

    return NextResponse.json(
      {
        data: {
          protocolo,
          dataRegistro: dataRegistro.toISOString(),
          dataOcorrencia: dataOcorrencia.toISOString(),
          tipoIncidente: validated.tipoIncidente,
          aviso: [
            'Incidente registrado com sucesso.',
            '',
            'ATENÇÃO — OBRIGAÇÃO LEGAL:',
            'De acordo com o Art. 48 da Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018), ',
            'a Autoridade Nacional de Proteção de Dados (ANPD) deve ser notificada sobre ',
            'incidentes de segurança que possam acarretar risco ou dano relevante aos titulares ',
            'no prazo de 72 (setenta e duas) horas após a ciência do incidente.',
            '',
            'Acesse o canal de notificações da ANPD em: https://www.gov.br/anpd',
            `Protocolo interno: ${protocolo}`,
          ].join('\n'),
          baseLegal: 'Art. 48 da Lei 13.709/2018 (LGPD) — Notificação de incidentes de segurança',
          prazoNotificacaoANPDHoras: 72,
          urlANPD: 'https://www.gov.br/anpd',
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('[POST /api/lgpd/incidente]', error)
    return NextResponse.json(
      { error: 'Erro interno ao registrar incidente de dados.' },
      { status: 500 }
    )
  }
}
