// =============================================================================
// Prontuário HOF — Helpers de Sessão (Server-side)
// Use em Server Components, API Routes e Server Actions
// =============================================================================

import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export type AuthUser = {
  id: string
  name?: string | null
  email?: string | null
  role: 'ADMIN' | 'PROFISSIONAL' | 'RECEPCIONISTA'
  clinicaId: string
  conselho: string
  numeroConselho: string
}

/**
 * Retorna a sessão autenticada ou redireciona para /login.
 * Use em Server Components e Server Actions.
 */
export async function getSession(): Promise<{ user: AuthUser }> {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  return session as { user: AuthUser }
}

/**
 * Retorna o clinicaId da sessão (chave do multi-tenant).
 * Redireciona para login se não autenticado.
 */
export async function getClinicaId(): Promise<string> {
  const session = await getSession()
  return session.user.clinicaId
}

/**
 * Retorna o userId da sessão.
 */
export async function getUserId(): Promise<string> {
  const session = await getSession()
  return session.user.id
}

/**
 * Retorna a sessão sem redirecionar (pode ser null).
 * Use quando a presença de sessão é opcional.
 */
export async function getSessionOrNull() {
  return await auth()
}
