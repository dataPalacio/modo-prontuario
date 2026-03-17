// =============================================================================
// GET /api/pacientes/exportar — Portabilidade de dados LGPD
// ✅ Auth obrigatória
// ✅ Multi-tenant (clinicaId da sessão)
// ✅ CPF decriptografado para exportação (direito de portabilidade LGPD Art. 18)
// ✅ Audit log de exportação
// ✅ Filtro por pacienteId (exportar dados de um paciente específico)
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { decrypt } from '@/lib/crypto'
import { registrarAuditLog, extrairContextoHttp, AUDIT_ACOES } from '@/lib/audit'

// GET /api/pacientes/exportar?pacienteId=xxx — Exporta dados completos do paciente (LGPD)
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

    // Buscar paciente com todos os dados relacionados
    const paciente = await prisma.paciente.findFirst({
      where: { id: pacienteId, clinicaId, deletedAt: null },
      include: {
        prontuarios: {
          where: { deletedAt: null },
          include: {
            procedimentos: true,
            evolucoes: true,
            tcle: true,
            fotos: {
              select: {
                id: true,
                tipo: true,
                angulo: true,
                descricao: true,
                createdAt: true,
                // url omitida da exportação JSON (acesso separado)
              },
            },
            profissional: { select: { nome: true, conselho: true, numeroConselho: true } },
          },
          orderBy: { dataAtendimento: 'desc' },
        },
      },
    })

    if (!paciente) {
      return NextResponse.json({ error: 'Paciente não encontrado.' }, { status: 404 })
    }

    // Decriptografar CPF para exportação (direito de portabilidade LGPD)
    let cpfPlano: string | null = null
    try {
      cpfPlano = decrypt(paciente.cpf)
    } catch {
      cpfPlano = '[CPF não disponível]'
    }

    const dadosExportacao = {
      exportadoEm: new Date().toISOString(),
      solicitante: session.user.id,
      paciente: {
        id: paciente.id,
        nome: paciente.nome,
        cpf: cpfPlano,
        dataNasc: paciente.dataNasc,
        sexo: paciente.sexo,
        email: paciente.email,
        telefone: paciente.telefone,
        whatsapp: paciente.whatsapp,
        endereco: paciente.endereco,
        observacoes: paciente.observacoes,
        cadastradoEm: paciente.createdAt,
        prontuarios: paciente.prontuarios,
      },
    }

    // Registrar exportação no audit log (obrigatório LGPD)
    const { ip, userAgent } = extrairContextoHttp(request)
    await registrarAuditLog({
      clinicaId,
      userId: session.user.id,
      acao: AUDIT_ACOES.DADOS_EXPORTADOS,
      entidade: 'Paciente',
      entidadeId: pacienteId,
      ip,
      userAgent,
      dados: { prontuariosCount: paciente.prontuarios.length },
    })

    return NextResponse.json({ data: dadosExportacao })
  } catch (error) {
    console.error('[GET /api/pacientes/exportar]', error)
    return NextResponse.json({ error: 'Erro interno ao exportar dados.' }, { status: 500 })
  }
}
