// =============================================================================
// Prontuário HOF — Tipagem da Sessão NextAuth v5
// Augmentação de módulo para enriquecer Session / JWT com campos do domínio
// =============================================================================

import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: DefaultSession['user'] & {
      id: string
      role: 'ADMIN' | 'PROFISSIONAL' | 'RECEPCIONISTA'
      clinicaId: string
      conselho: string
      numeroConselho: string
    }
  }

  interface User {
    id: string
    role: 'ADMIN' | 'PROFISSIONAL' | 'RECEPCIONISTA'
    clinicaId: string
    conselho: string
    numeroConselho: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'ADMIN' | 'PROFISSIONAL' | 'RECEPCIONISTA'
    clinicaId: string
    conselho: string
    numeroConselho: string
  }
}
