// =============================================================================
// Prontuário HOF — Tipagem da Sessão NextAuth v5
// Augmentação de módulo para enriquecer Session / JWT com campos do domínio
// =============================================================================

import type { DefaultSession } from 'next-auth'

type AppRole = 'ADMIN' | 'PROFISSIONAL' | 'RECEPCIONISTA'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: DefaultSession['user'] & {
      id: string
      role: AppRole
      clinicaId: string
      conselho: string
      numeroConselho: string
    }
  }

  interface User {
    id: string
    role: AppRole
    clinicaId: string
    conselho: string
    numeroConselho: string
  }

  interface JWT {
    id: string
    role: AppRole
    clinicaId: string
    conselho: string
    numeroConselho: string
  }
}
