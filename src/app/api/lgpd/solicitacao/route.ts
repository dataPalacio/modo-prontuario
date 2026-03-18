// =============================================================================
// POST /api/lgpd/solicitacao — Prontuário HOF
// Portal de solicitações de direitos LGPD (Art. 18 Lei 13.709/2018)
// ✅ Auth obrigatória
// ✅ Multi-tenant (clinicaId da sessão)
// ✅ Validação Zod
// ✅ Rastreamento via AuditLog com ação LGPD_SOLICITACAO_CRIADA
// ✅ Prazo legal de resposta: 15 dias úteis (Art. 19 LGPD)
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { registrarAuditLog, extrairContextoHttp } from '@/lib/audit'
import { z } from 'zod'
import { randomUUID } from 'crypto'

const solicitacaoLGPDSchema = z.object({
  tipo: z.enum(['acesso', 'retificacao', 'exclusao', 'portabilidade']),
  descricao: z
    .string()
    .min(10, 'Descrição deve ter ao menos 10 caracteres')
    .max(2000, 'Descrição deve ter no máximo 2000 caracteres'),
  pacienteId: z.string().cuid('ID de paciente inválido').optional(),
})

const TIPO_LABELS: Record<string, string> = {
  acesso: 'Acesso aos dados pessoais',
  retificacao: 'Retificação de dados incompletos ou incorretos',
  exclusao: 'Exclusão de dados pessoais (direito ao esquecimento)',
  portabilidade: 'Portabilidade dos dados a outro fornecedor',
}

const PRAZO_RESPOSTA_DIAS_UTEIS = 15

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const clinicaId = session.user.clinicaId
    const userId = session.user.id

    const body = await request.json()
    const validated = solicitacaoLGPDSchema.parse(body)

    // Se informou pacienteId, verificar que pertence à clínica
    if (validated.pacienteId) {
      const paciente = await prisma.paciente.findFirst({
        where: { id: validated.pacienteId, clinicaId, deletedAt: null },
        select: { id: true },
      })

      if (!paciente) {
        return NextResponse.json({ error: 'Paciente não encontrado.' }, { status: 404 })
      }
    }

    // Gerar número de protocolo único para rastreamento
    const protocolo = randomUUID()

    // Registrar solicitação via AuditLog — não existe tabela dedicada no schema atual
    const { ip, userAgent } = extrairContextoHttp(request)
    await registrarAuditLog({
      clinicaId,
      userId,
      acao: 'LGPD_SOLICITACAO_CRIADA',
      entidade: 'LGPD',
      entidadeId: protocolo,
      ip,
      userAgent,
      dados: {
        protocolo,
        tipo: validated.tipo,
        tipoDescricao: TIPO_LABELS[validated.tipo],
        descricao: validated.descricao,
        pacienteId: validated.pacienteId ?? null,
        prazoRespostaDiasUteis: PRAZO_RESPOSTA_DIAS_UTEIS,
        solicitanteId: userId,
        clinicaId,
      },
    })

    return NextResponse.json(
      {
        data: {
          protocolo,
          tipo: validated.tipo,
          tipoDescricao: TIPO_LABELS[validated.tipo],
          mensagem: `Solicitação recebida com sucesso. Protocolo: ${protocolo}. Você receberá uma resposta em até ${PRAZO_RESPOSTA_DIAS_UTEIS} dias úteis, conforme previsto no Art. 19 da Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018).`,
          prazoRespostaDiasUteis: PRAZO_RESPOSTA_DIAS_UTEIS,
          baseLegal: 'Art. 18 e 19 da Lei 13.709/2018 (LGPD)',
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('[POST /api/lgpd/solicitacao]', error)
    return NextResponse.json({ error: 'Erro interno ao registrar solicitação LGPD.' }, { status: 500 })
  }
}
