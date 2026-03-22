import { PrismaClient } from '../generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

function resolveConnectionString() {
  const preferred = process.env.PRISMA_CONNECTION_URL?.trim()
  const directUrl = process.env.DIRECT_URL?.trim()
  const databaseUrl = process.env.DATABASE_URL?.trim()

  // DATABASE_URL segue como padrão para manter compatibilidade com Prisma CLI e ambiente atual.
  return preferred || databaseUrl || directUrl || ''
}

const connectionString = resolveConnectionString()
const isManagedPostgres = /supabase\.com|supabase\.co/i.test(connectionString)

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  prismaPool: Pool | undefined
}

if (!connectionString) {
  throw new Error('DATABASE_URL não definida para inicializar o Prisma Client')
}

// Remove `sslmode` do query string para evitar conflito com pg v8+.
// A partir do pg v8.20, `sslmode=require` é tratado como `sslmode=verify-full`,
// o que rejeita o certificado auto-assinado do Supabase, sobrescrevendo nosso
// ssl: { rejectUnauthorized: false }. Removemos o parâmetro e deixamos apenas
// a config explícita do Pool cuidar do TLS.
function stripSslMode(url: string): string {
  try {
    const u = new URL(url)
    u.searchParams.delete('sslmode')
    return u.toString()
  } catch {
    // URL não parsável (ex: formato com credenciais especiais) — fallback regex
    return url.replace(/([?&])sslmode=[^&]*/g, '$1').replace(/[?&]$/, '')
  }
}

const sanitizedConnectionString = stripSslMode(connectionString)

const pool =
  globalForPrisma.prismaPool ??
  new Pool({
    connectionString: sanitizedConnectionString,
    // Supabase requer SSL em todas as conexões — sem isso o pg trava negociando TLS
    ssl: { rejectUnauthorized: false },
    // Limite de conexões por instância (serverless tem múltiplas instâncias)
    max: process.env.NODE_ENV === 'production' ? 5 : 3,
    // Falha rápida se o banco estiver inacessível
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
  })

const adapter = new PrismaPg(pool)

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  globalForPrisma.prismaPool = pool
}
