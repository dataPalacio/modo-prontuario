// =============================================================================
// Middleware — Prontuário HOF
// Proteção de rotas via NextAuth v5 (JWT strategy)
// =============================================================================

import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register', '/esqueci-senha', '/reset-password']
const PUBLIC_API_PREFIX = '/api/auth'

export default auth(function middleware(req) {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // Rotas e APIs públicas — liberar sem verificação
  const isPublicRoute = PUBLIC_ROUTES.some(r => nextUrl.pathname.startsWith(r))
  const isPublicApi = nextUrl.pathname.startsWith(PUBLIC_API_PREFIX)

  if (isPublicRoute || isPublicApi) {
    return NextResponse.next()
  }

  // Redirecionar para login se não autenticado
  if (!isLoggedIn) {
    const loginUrl = new URL('/login', nextUrl.origin)
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Validar presença de clinicaId na sessão (multi-tenant)
  const user = req.auth?.user as Record<string, string> | undefined
  if (!user?.clinicaId) {
    return NextResponse.redirect(
      new URL('/login?error=InvalidSession', nextUrl.origin)
    )
  }

  // Propagar dados da sessão via headers para Server Components / API Routes
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-clinica-id', user.clinicaId)
  requestHeaders.set('x-user-id', user.id ?? '')
  requestHeaders.set('x-user-role', user.role ?? '')

  return NextResponse.next({ request: { headers: requestHeaders } })
})

export const config = {
  matcher: [
    // Rotas do dashboard
    '/dashboard/:path*',
    '/pacientes/:path*',
    '/prontuarios/:path*',
    '/procedimentos/:path*',
    '/fotos/:path*',
    '/agenda/:path*',
    '/relatorios/:path*',
    '/configuracoes/:path*',
    // APIs (exceto /api/auth/*)
    '/api/((?!auth).*)',
  ],
}
