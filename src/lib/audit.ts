// =============================================================================
// Prontuário HOF — Audit Log Helper
// Registra todas as operações sobre dados sensíveis (LGPD / CFM 1.638/2002).
//
// Regra: NUNCA lançar erro — falha no log não deve interromper a operação clínica.
// =============================================================================

import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export interface AuditLogInput {
  clinicaId: string
  userId: string
  acao: string        // Ex: PACIENTE_CRIADO, PRONTUARIO_VISUALIZADO, PRONTUARIO_ASSINADO
  entidade: string    // Ex: Paciente, Prontuario, Procedimento
  entidadeId: string
  ip: string
  userAgent?: string
  dados?: Prisma.InputJsonValue
}

/**
 * Registra um evento de auditoria.
 * Silencia erros — a operação principal não é bloqueada por falha no log.
 */
export async function registrarAuditLog(input: AuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        clinicaId: input.clinicaId,
        userId: input.userId,
        acao: input.acao,
        entidade: input.entidade,
        entidadeId: input.entidadeId,
        ip: input.ip,
        userAgent: input.userAgent,
        dados: input.dados,
      },
    })
  } catch (err) {
    // Logar no console mas nunca propagar — auditoria nunca bloqueia operação clínica
    console.error('[AuditLog] Falha ao registrar evento:', {
      acao: input.acao,
      entidade: input.entidade,
      entidadeId: input.entidadeId,
      err,
    })
  }
}

/**
 * Extrai IP e User-Agent de um NextRequest.
 * Suporta proxies reversos (x-forwarded-for, x-real-ip).
 */
export function extrairContextoHttp(request: Request): {
  ip: string
  userAgent: string
} {
  const headers = request.headers

  const ip =
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    'unknown'

  const userAgent = headers.get('user-agent') || 'unknown'

  return { ip, userAgent }
}

/**
 * Ações padronizadas de auditoria.
 * Use estas constantes para garantir consistência nas buscas.
 */
export const AUDIT_ACOES = {
  // Pacientes
  PACIENTE_CRIADO: 'PACIENTE_CRIADO',
  PACIENTE_VISUALIZADO: 'PACIENTE_VISUALIZADO',
  PACIENTE_EDITADO: 'PACIENTE_EDITADO',
  PACIENTE_EXCLUIDO: 'PACIENTE_EXCLUIDO', // soft delete

  // Prontuários
  PRONTUARIO_CRIADO: 'PRONTUARIO_CRIADO',
  PRONTUARIO_VISUALIZADO: 'PRONTUARIO_VISUALIZADO',
  PRONTUARIO_EDITADO: 'PRONTUARIO_EDITADO',
  PRONTUARIO_ASSINADO: 'PRONTUARIO_ASSINADO',
  PRONTUARIO_ARQUIVADO: 'PRONTUARIO_ARQUIVADO',
  PRONTUARIO_PDF_GERADO: 'PRONTUARIO_PDF_GERADO',

  // TCLE
  TCLE_CRIADO: 'TCLE_CRIADO',
  TCLE_ASSINADO: 'TCLE_ASSINADO',

  // Procedimentos
  PROCEDIMENTO_CRIADO: 'PROCEDIMENTO_CRIADO',
  PROCEDIMENTO_REMOVIDO: 'PROCEDIMENTO_REMOVIDO',

  // Rastreabilidade
  RASTREABILIDADE_CONSULTADA: 'RASTREABILIDADE_CONSULTADA',

  // Evoluções
  EVOLUCAO_CRIADA: 'EVOLUCAO_CRIADA',
  EVOLUCAO_REMOVIDA: 'EVOLUCAO_REMOVIDA',

  // Autenticação
  LOGIN_SUCESSO: 'LOGIN_SUCESSO',
  LOGIN_FALHA: 'LOGIN_FALHA',

  // Fotos clínicas
  FOTO_ADICIONADA: 'FOTO_ADICIONADA',
  FOTO_REMOVIDA: 'FOTO_REMOVIDA',

  // Relatórios
  RELATORIO_GERADO: 'RELATORIO_GERADO',

  // Configurações
  PERFIL_EDITADO: 'PERFIL_EDITADO',
  SENHA_ALTERADA: 'SENHA_ALTERADA',
  CLINICA_EDITADA: 'CLINICA_EDITADA',

  // Agenda
  AGENDAMENTO_CRIADO: 'AGENDAMENTO_CRIADO',
  AGENDAMENTO_ATUALIZADO: 'AGENDAMENTO_ATUALIZADO',
  AGENDAMENTO_CANCELADO: 'AGENDAMENTO_CANCELADO',

  // Exportações (LGPD portabilidade)
  DADOS_EXPORTADOS: 'DADOS_EXPORTADOS',

  // IA / Vertex AI
  IA_ANAMNESE_CONSULTADA: 'IA_ANAMNESE_CONSULTADA',
  IA_TCLE_GERADO: 'IA_TCLE_GERADO',
  IA_RELATORIO_GERADO: 'IA_RELATORIO_GERADO',

  // Google Calendar
  AGENDAMENTO_SINCRONIZADO_GOOGLE: 'AGENDAMENTO_SINCRONIZADO_GOOGLE',

  // LGPD
  LGPD_SOLICITACAO_CRIADA: 'LGPD_SOLICITACAO_CRIADA',
  INCIDENTE_DADOS_REGISTRADO: 'INCIDENTE_DADOS_REGISTRADO',
} as const

export type AuditAcao = typeof AUDIT_ACOES[keyof typeof AUDIT_ACOES]
