// =============================================================================
// GET /api/health — Prontuário HOF
// Health check público — usado por Vercel, uptime monitors, CI/CD
// Verifica conectividade com o banco de dados
// =============================================================================

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const startTime = Date.now()

  try {
    // Testar conectividade com o banco
    await prisma.$queryRaw`SELECT 1`

    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        latencyMs: Date.now() - startTime,
        services: {
          database: 'ok',
          api: 'ok',
        },
        version: process.env.npm_package_version || '0.1.0',
        environment: process.env.NODE_ENV,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[GET /api/health] Database check failed:', error)
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        latencyMs: Date.now() - startTime,
        services: {
          database: 'error',
          api: 'ok',
        },
      },
      { status: 503 }
    )
  }
}
