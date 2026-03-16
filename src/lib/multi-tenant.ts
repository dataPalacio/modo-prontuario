// =============================================================================
// Prontuário HOF — Multi-Tenancy Helpers
// Garante que cada clínica só acessa os próprios dados.
// IMPORTANTE: clinicaId SEMPRE vem da sessão JWT — nunca do corpo da requisição.
// =============================================================================

import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

/**
 * Retorna o clinicaId da sessão JWT.
 * Lança erro se não autenticado (use em API Routes já protegidas pelo middleware).
 */
export async function getClinicaIdFromSession(): Promise<string> {
  const session = await auth()
  const clinicaId = session?.user?.clinicaId

  if (!clinicaId) {
    throw new Error('clinicaId não encontrado na sessão — acesso negado.')
  }

  return clinicaId
}

/**
 * Retorna o clinicaId a partir do header injetado pelo middleware (x-clinica-id).
 * Alternativa mais leve para Server Components que não precisam do objeto Session completo.
 */
export async function getClinicaIdFromHeaders(): Promise<string> {
  const headersList = await headers()
  const clinicaId = headersList.get('x-clinica-id')

  if (!clinicaId) {
    throw new Error('Header x-clinica-id ausente — middleware não aplicado?')
  }

  return clinicaId
}

/**
 * Verifica se o resource especificado pertence à clínica da sessão atual.
 * Use em operações de UPDATE/DELETE para evitar vazamento cross-tenant.
 *
 * @param resourceClinicaId  clinicaId do recurso buscado no banco
 * @throws 403 implícito — retorna false para tratamento no caller
 */
export async function pertenceAClinica(resourceClinicaId: string): Promise<boolean> {
  try {
    const sessionClinicaId = await getClinicaIdFromSession()
    return sessionClinicaId === resourceClinicaId
  } catch {
    return false
  }
}

/**
 * Retorna o userId da sessão.
 */
export async function getUserIdFromSession(): Promise<string> {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    throw new Error('userId não encontrado na sessão.')
  }

  return userId
}
