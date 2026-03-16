// =============================================================================
// Prontuário HOF — Audit Log Helper
// Registra todas as operações sobre dados sensíveis (LGPD / CFM 1.638/2002).
//
// Regra: NUNCA lançar erro — falha no log não deve interromper a operação clínica.
// =============================================================================

import { prisma } from '@/lib/prisma'

export interface AuditLogInput {
  clinicaId: string
  userId: string
  acao: string        // Ex: PACIENTE_CRIADO, PRONTUARIO_VISUALIZADO, PRONTUARIO_ASSINADO
  entidade: string    // Ex: Paciente, Prontuario, Procedimento
  entidadeId: string
  ip: string
  userAgent?: string
  dados?: Record<string, unknown> // Snapshot antes/depois da operação
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
  TCLE_ASSINADO: 'TCLE_ASSINADO',

  // Procedimentos
  PROCEDIMENTO_CRIADO: 'PROCEDIMENTO_CRIADO',

  // Autenticação
  LOGIN_SUCESSO: 'LOGIN_SUCESSO',
  LOGIN_FALHA: 'LOGIN_FALHA',

  // Exportações (LGPD portabilidade)
  DADOS_EXPORTADOS: 'DADOS_EXPORTADOS',
} as const

export type AuditAcao = typeof AUDIT_ACOES[keyof typeof AUDIT_ACOES]
