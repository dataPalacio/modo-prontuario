// =============================================================================
// Proxy (antigo middleware) — Prontuário HOF
// Versão lightweight para Edge: evita importar stack completa de auth/prisma.
// =============================================================================

import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register', '/esqueci-senha', '/reset-password']
const PUBLIC_API_PREFIX = '/api/auth'

export async function proxy(req: NextRequest) {
  const { nextUrl } = req
  const isPublicRoute = PUBLIC_ROUTES.some((route) => nextUrl.pathname.startsWith(route))
  const isPublicApi = nextUrl.pathname.startsWith(PUBLIC_API_PREFIX)

  if (isPublicRoute || isPublicApi) {
    return NextResponse.next()
  }

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  })

  if (!token) {
    const loginUrl = new URL('/login', nextUrl.origin)
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  const clinicaId = typeof token.clinicaId === 'string' ? token.clinicaId : ''
  if (!clinicaId) {
    return NextResponse.redirect(new URL('/login?error=InvalidSession', nextUrl.origin))
  }

  // Propaga contexto multi-tenant para handlers server-side.
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-clinica-id', clinicaId)
  requestHeaders.set('x-user-id', typeof token.id === 'string' ? token.id : '')
  requestHeaders.set('x-user-role', typeof token.role === 'string' ? token.role : '')

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/pacientes/:path*',
    '/prontuarios/:path*',
    '/procedimentos/:path*',
    '/fotos/:path*',
    '/agenda/:path*',
    '/relatorios/:path*',
    '/configuracoes/:path*',
    '/api/((?!auth).*)',
  ],
}
