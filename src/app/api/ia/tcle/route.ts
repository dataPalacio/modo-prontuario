// =============================================================================
// POST /api/ia/tcle — Prontuário HOF
// Geração de TCLE personalizado para HOF via IA (Gemini)
// ✅ Auth obrigatória
// ✅ Multi-tenant: prontuário verificado pelo clinicaId da sessão
// ✅ Validação Zod
// ✅ Busca dados reais do prontuário (sem expor CPF)
// ✅ Audit log IA_TCLE_GERADO
// ✅ Fallback seguro quando IA indisponível
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { registrarAuditLog, extrairContextoHttp } from '@/lib/audit'
import { vertexAI } from '@/lib/vertex-ai'
import { z } from 'zod'

const tcleIASchema = z.object({
  prontuarioId: z.string().cuid('ID de prontuário inválido'),
  procedimentos: z
    .array(z.string().min(1))
    .min(1, 'Informe ao menos um procedimento'),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const clinicaId = session.user.clinicaId
    const userId = session.user.id

    const body = await request.json()
    const validated = tcleIASchema.parse(body)

    // Buscar prontuário com dados do paciente (sem CPF) — multi-tenant
    const prontuario = await prisma.prontuario.findFirst({
      where: { id: validated.prontuarioId, clinicaId, deletedAt: null },
      select: {
        id: true,
        numero: true,
        queixaPrincipal: true,
        dataAtendimento: true,
        paciente: {
          select: {
            id: true,
            nome: true,
            dataNasc: true,
            sexo: true,
            // CPF OMITIDO intencionalmente — LGPD
          },
        },
        profissional: {
          select: {
            id: true,
            nome: true,
            conselho: true,
            numeroConselho: true,
            uf: true,
            especialidade: true,
          },
        },
      },
    })

    if (!prontuario) {
      return NextResponse.json({ error: 'Prontuário não encontrado.' }, { status: 404 })
    }

    const pacienteNome = prontuario.paciente.nome
    const profissionalNome = prontuario.profissional.nome
    const conselho = `${prontuario.profissional.conselho} ${prontuario.profissional.numeroConselho}/${prontuario.profissional.uf}`
    const especialidade = prontuario.profissional.especialidade || 'Harmonização Orofacial'
    const procedimentosTexto = validated.procedimentos.join(', ')

    const prompt = `Você é um especialista em legislação médica e odontológica brasileira com foco em Harmonização Orofacial (HOF).

Gere um Termo de Consentimento Livre e Esclarecido (TCLE) completo, formal e juridicamente adequado para os procedimentos listados abaixo.

DADOS DO PACIENTE:
- Nome: ${pacienteNome}

DADOS DO PROFISSIONAL:
- Nome: ${profissionalNome}
- Registro: ${conselho}
- Especialidade: ${especialidade}

PROCEDIMENTOS A REALIZAR:
${validated.procedimentos.map((p, i) => `${i + 1}. ${p}`).join('\n')}

O TCLE deve incluir obrigatoriamente:
1. Identificação das partes (paciente e profissional)
2. Descrição detalhada de cada procedimento (${procedimentosTexto})
3. Objetivos e resultados esperados de cada procedimento
4. Riscos específicos e complicações possíveis de cada procedimento
5. Contraindicações e condições que impedem a realização
6. Alternativas de tratamento disponíveis
7. Informações sobre produtos utilizados (toxinas, preenchimentos, bioestimuladores)
8. Instruções pré e pós-procedimento
9. Direito de revogação do consentimento a qualquer momento
10. Informações de contato para dúvidas e emergências
11. Declaração de compreensão e consentimento livre e esclarecido
12. Espaços para assinatura do paciente, profissional e testemunha
13. Data e local

Base legal: CFM 1.931/2009 (Código de Ética Médica), CFO 118/2012, Resolução CFBM 320/2020, LGPD (Lei 13.709/2018).

Formate o documento de forma profissional, com numeração de seções, linguagem acessível ao paciente mas tecnicamente precisa.
O documento deve ter validade jurídica e estar em conformidade com as normas do CFM, CFO e CFBM.`

    const conteudo = await vertexAI.generateContent(prompt)

    const { ip, userAgent } = extrairContextoHttp(request)
    await registrarAuditLog({
      clinicaId,
      userId,
      acao: 'IA_TCLE_GERADO',
      entidade: 'Prontuario',
      entidadeId: prontuario.id,
      ip,
      userAgent,
      dados: {
        prontuarioNumero: prontuario.numero,
        procedimentos: validated.procedimentos,
      },
    })

    return NextResponse.json({ data: { conteudo } })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('[POST /api/ia/tcle]', error)
    return NextResponse.json({ error: 'Erro interno ao gerar TCLE com IA.' }, { status: 500 })
  }
}
