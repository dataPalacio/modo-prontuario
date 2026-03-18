// =============================================================================
// POST /api/ia/anamnese — Prontuário HOF
// Sugestão de perguntas de anamnese e pontos de atenção via IA (Gemini)
// ✅ Auth obrigatória
// ✅ Multi-tenant: clinicaId registrado no audit log
// ✅ Validação Zod
// ✅ Audit log IA_ANAMNESE_CONSULTADA
// ✅ Fallback seguro quando IA indisponível
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { registrarAuditLog, extrairContextoHttp } from '@/lib/audit'
import { vertexAI } from '@/lib/vertex-ai'
import { z } from 'zod'

const anamneseIASchema = z.object({
  queixaPrincipal: z
    .string()
    .min(10, 'Queixa principal deve ter ao menos 10 caracteres'),
  historicoMedico: z.record(z.string(), z.unknown()).optional(),
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
    const validated = anamneseIASchema.parse(body)

    const historicoTexto = validated.historicoMedico
      ? `\n\nHistórico médico relevante fornecido:\n${JSON.stringify(validated.historicoMedico, null, 2)}`
      : ''

    const prompt = `Você é um assistente clínico especializado em Harmonização Orofacial (HOF).

Com base na queixa principal do paciente abaixo, gere:
1. Lista de perguntas de anamnese específicas e relevantes para HOF (mínimo 10 perguntas)
2. Pontos de atenção e possíveis contraindicações a investigar
3. Histórico médico relevante a verificar (alergias, medicações, cirurgias anteriores)
4. Expectativas do paciente a explorar

Queixa principal: "${validated.queixaPrincipal}"${historicoTexto}

Formate a resposta de forma clara e organizada, usando listas numeradas e seções com títulos em negrito.
Seja específico para procedimentos de harmonização orofacial como toxina botulínica, preenchimento com ácido hialurônico, bioestimuladores e similares.
Use linguagem técnica adequada para profissionais de saúde (médicos, dentistas, biomédicos).`

    const sugestao = await vertexAI.generateContent(prompt)

    const { ip, userAgent } = extrairContextoHttp(request)
    await registrarAuditLog({
      clinicaId,
      userId,
      acao: 'IA_ANAMNESE_CONSULTADA',
      entidade: 'IA',
      entidadeId: userId,
      ip,
      userAgent,
      dados: {
        clinicaId,
        queixaPrincipal: validated.queixaPrincipal,
      },
    })

    return NextResponse.json({ data: { sugestao } })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('[POST /api/ia/anamnese]', error)
    return NextResponse.json({ error: 'Erro interno ao consultar assistente IA.' }, { status: 500 })
  }
}
