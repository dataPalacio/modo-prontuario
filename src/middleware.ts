// =============================================================================
// Prontuário HOF — Middleware de autenticação (NextAuth v5)
// Protege TODAS as rotas do dashboard: redireciona para /login se não autenticado.
// ⚠️  Sem este arquivo, qualquer rota pode ser acessada sem sessão válida.
// =============================================================================

export { auth as middleware } from '@/lib/auth'

export const config = {
  // Proteger APENAS rotas do dashboard — liberar rotas públicas e estáticas
  matcher: [
    '/dashboard/:path*',
    '/pacientes/:path*',
    '/prontuarios/:path*',
    '/procedimentos/:path*',
    '/agenda/:path*',
    '/fotos/:path*',
    '/relatorios/:path*',
    '/configuracoes/:path*',
  ],
}
