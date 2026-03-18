// =============================================================================
// POST /api/ia/relatorio — Prontuário HOF
// Análise narrativa e insights via IA sobre dados clínicos da clínica
// ✅ Auth obrigatória — somente ADMIN
// ✅ Multi-tenant (clinicaId da sessão)
// ✅ Validação Zod
// ✅ Busca dados reais do banco para fundamentar análise
// ✅ Audit log IA_RELATORIO_GERADO
// ✅ Fallback seguro quando IA indisponível
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { registrarAuditLog, extrairContextoHttp } from '@/lib/audit'
import { vertexAI } from '@/lib/vertex-ai'
import { z } from 'zod'

const relatorioIASchema = z.object({
  tipo: z.enum(['resumo_clinico', 'analise_procedimentos']),
  periodo: z.object({
    inicio: z.string().datetime('Data de início inválida'),
    fim: z.string().datetime('Data de fim inválida'),
  }),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Permissão negada. Análise por IA é restrita a administradores.' },
        { status: 403 }
      )
    }

    const clinicaId = session.user.clinicaId
    const userId = session.user.id

    const body = await request.json()
    const validated = relatorioIASchema.parse(body)

    const dataInicio = new Date(validated.periodo.inicio)
    const dataFim = new Date(validated.periodo.fim)

    if (dataInicio >= dataFim) {
      return NextResponse.json(
        { error: 'A data de início deve ser anterior à data de fim.' },
        { status: 400 }
      )
    }

    const periodoWhere = {
      gte: dataInicio,
      lte: dataFim,
    }

    // Coletar dados reais do banco para fundamentar a análise da IA
    const [
      totalPacientesNovos,
      totalProntuarios,
      procedimentosPorTipo,
      totalAgendamentos,
      agendamentosPorStatus,
      totalEvolucoes,
      retornosNecessarios,
    ] = await Promise.all([
      // Pacientes novos no período
      prisma.paciente.count({
        where: { clinicaId, deletedAt: null, createdAt: periodoWhere },
      }),

      // Prontuários criados no período
      prisma.prontuario.count({
        where: { clinicaId, deletedAt: null, createdAt: periodoWhere },
      }),

      // Procedimentos agrupados por tipo
      prisma.procedimento.groupBy({
        by: ['tipo'],
        where: {
          prontuario: { clinicaId, deletedAt: null, dataAtendimento: periodoWhere },
        },
        _count: { tipo: true },
        orderBy: { _count: { tipo: 'desc' } },
      }),

      // Total de agendamentos no período
      prisma.agendamento.count({
        where: { clinicaId, dataHora: periodoWhere },
      }),

      // Agendamentos por status
      prisma.agendamento.groupBy({
        by: ['status'],
        where: { clinicaId, dataHora: periodoWhere },
        _count: { status: true },
      }),

      // Total de evoluções registradas
      prisma.evolucao.count({
        where: {
          prontuario: { clinicaId, deletedAt: null, dataAtendimento: periodoWhere },
        },
      }),

      // Retornos necessários com data no período
      prisma.evolucao.count({
        where: {
          retornoNecessario: true,
          dataRetorno: periodoWhere,
          prontuario: { clinicaId, deletedAt: null },
        },
      }),
    ])

    const taxaComparecimento =
      totalAgendamentos > 0
        ? Math.round(
            ((agendamentosPorStatus.find((s) => s.status === 'REALIZADO')?._count.status ?? 0) /
              totalAgendamentos) *
              100
          )
        : 0

    const dados = {
      periodo: {
        inicio: dataInicio.toISOString(),
        fim: dataFim.toISOString(),
      },
      pacientesNovos: totalPacientesNovos,
      prontuariosAbertos: totalProntuarios,
      totalAgendamentos,
      taxaComparecimentoPercent: taxaComparecimento,
      agendamentosPorStatus: agendamentosPorStatus.map((s) => ({
        status: s.status,
        quantidade: s._count.status,
      })),
      procedimentosPorTipo: procedimentosPorTipo.map((p) => ({
        tipo: p.tipo,
        quantidade: p._count.tipo,
      })),
      evolucoes: totalEvolucoes,
      retornosAgendados: retornosNecessarios,
    }

    let analise: string

    if (validated.tipo === 'resumo_clinico') {
      const prompt = `Você é um consultor especializado em gestão de clínicas de Harmonização Orofacial (HOF).

Analise os dados clínicos abaixo e gere um RESUMO CLÍNICO EXECUTIVO com insights práticos para o gestor da clínica.

PERÍODO ANALISADO: ${dataInicio.toLocaleDateString('pt-BR')} a ${dataFim.toLocaleDateString('pt-BR')}

DADOS DO PERÍODO:
- Pacientes novos: ${dados.pacientesNovos}
- Prontuários abertos: ${dados.prontuariosAbertos}
- Total de agendamentos: ${dados.totalAgendamentos}
- Taxa de comparecimento: ${dados.taxaComparecimentoPercent}%
- Retornos agendados pendentes: ${dados.retornosAgendados}
- Evoluções registradas: ${dados.evolucoes}

DISTRIBUIÇÃO DE AGENDAMENTOS:
${dados.agendamentosPorStatus.map((s) => `- ${s.status}: ${s.quantidade}`).join('\n')}

PROCEDIMENTOS REALIZADOS:
${dados.procedimentosPorTipo.length > 0 ? dados.procedimentosPorTipo.map((p) => `- ${p.tipo}: ${p.quantidade}`).join('\n') : '- Nenhum procedimento registrado no período'}

Gere uma análise com:
1. **Resumo executivo** (2-3 parágrafos)
2. **Destaques positivos** do período
3. **Pontos de atenção** e oportunidades de melhoria
4. **Indicadores-chave** calculados (se possível)
5. **Recomendações práticas** para a gestão da clínica
6. **Próximos passos sugeridos**

Use linguagem objetiva e profissional. Baseie-se apenas nos dados fornecidos.`

      analise = await vertexAI.generateContent(prompt)
    } else {
      // analise_procedimentos
      const prompt = `Você é um especialista em procedimentos de Harmonização Orofacial (HOF) e análise clínica.

Analise o perfil de procedimentos realizados no período e gere INSIGHTS SOBRE TENDÊNCIAS E OPORTUNIDADES.

PERÍODO ANALISADO: ${dataInicio.toLocaleDateString('pt-BR')} a ${dataFim.toLocaleDateString('pt-BR')}

PROCEDIMENTOS REALIZADOS:
${dados.procedimentosPorTipo.length > 0 ? dados.procedimentosPorTipo.map((p) => `- ${p.tipo}: ${p.quantidade} realizações`).join('\n') : '- Nenhum procedimento registrado no período'}

CONTEXTO:
- Total de pacientes novos no período: ${dados.pacientesNovos}
- Evoluções de acompanhamento: ${dados.evolucoes}
- Retornos agendados: ${dados.retornosAgendados}

Gere uma análise com:
1. **Perfil de procedimentos** — análise dos mais realizados e sua relevância
2. **Tendências observadas** no mix de procedimentos
3. **Oportunidades de expansão** de portfólio (procedimentos complementares)
4. **Considerações de segurança** e conformidade (ANVISA, CFM, CFO, CFBM)
5. **Sugestões de protocolos** para os procedimentos mais frequentes
6. **Insights sobre follow-up** com base nos dados de retorno

Use linguagem técnica adequada para profissionais de saúde. Baseie-se apenas nos dados fornecidos.`

      analise = await vertexAI.generateContent(prompt)
    }

    const { ip, userAgent } = extrairContextoHttp(request)
    await registrarAuditLog({
      clinicaId,
      userId,
      acao: 'IA_RELATORIO_GERADO',
      entidade: 'Relatorio',
      entidadeId: clinicaId,
      ip,
      userAgent,
      dados: {
        tipo: validated.tipo,
        periodo: dados.periodo,
      },
    })

    return NextResponse.json({ data: { analise, dados } })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('[POST /api/ia/relatorio]', error)
    return NextResponse.json({ error: 'Erro interno ao gerar análise com IA.' }, { status: 500 })
  }
}
