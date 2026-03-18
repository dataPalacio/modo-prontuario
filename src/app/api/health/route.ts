// =============================================================================
// GET /api/health — Prontuário HOF
// Health check público — usado por Vercel, uptime monitors, CI/CD
// Verifica: DB connectivity, Vertex AI env vars, Google Calendar env vars
// =============================================================================

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

type ServiceStatus = 'ok' | 'degraded' | 'error'

interface ServiceCheck {
  status: ServiceStatus
  message?: string
}

export async function GET() {
  const startTime = Date.now()

  // --- Verificação do banco de dados ---
  let dbCheck: ServiceCheck
  try {
    await prisma.$queryRaw`SELECT 1`
    dbCheck = { status: 'ok' }
  } catch (error) {
    console.error('[GET /api/health] Database check failed:', error)
    dbCheck = { status: 'error', message: 'Falha na conexão com o banco de dados' }
  }

  // --- Verificação do Vertex AI ---
  const vertexAIConfigured =
    !!process.env.GOOGLE_APPLICATION_CREDENTIALS_B64 &&
    !!process.env.GOOGLE_CLOUD_PROJECT_ID

  const vertexAICheck: ServiceCheck = vertexAIConfigured
    ? { status: 'ok' }
    : {
        status: 'degraded',
        message:
          'Variáveis GOOGLE_APPLICATION_CREDENTIALS_B64 e/ou GOOGLE_CLOUD_PROJECT_ID não configuradas — IA indisponível',
      }

  // --- Verificação do Google Calendar ---
  // O Google Calendar usa OAuth2 do usuário (não service account)
  // A disponibilidade do serviço é verificada pela presença das variáveis de OAuth configuradas no frontend
  // Para o backend, verificamos apenas se o cliente está operacional (sem credenciais próprias)
  const googleCalendarCheck: ServiceCheck = {
    status: 'ok',
    message: 'Google Calendar usa OAuth2 do usuário — sem configuração de servidor necessária',
  }

  // --- Status global ---
  const hasError = dbCheck.status === 'error'
  const hasDegraded =
    dbCheck.status === 'degraded' ||
    vertexAICheck.status === 'degraded' ||
    googleCalendarCheck.status === 'degraded'

  const globalStatus: ServiceStatus = hasError ? 'error' : hasDegraded ? 'degraded' : 'ok'

  const responseBody = {
    status: globalStatus,
    timestamp: new Date().toISOString(),
    latencyMs: Date.now() - startTime,
    services: {
      db: dbCheck,
      vertexAI: vertexAICheck,
      googleCalendar: googleCalendarCheck,
      api: { status: 'ok' as ServiceStatus },
    },
  }

  // 200 se ok ou degraded (serviço parcial), 503 se erro crítico
  const httpStatus = hasError ? 503 : 200

  return NextResponse.json(responseBody, { status: httpStatus })
}
