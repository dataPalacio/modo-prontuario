import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  prismaPool: Pool | undefined
}

// Em desenvolvimento local, preferir DIRECT_URL (porta 5432, conexão direta sem pgbouncer).
// Em produção (Vercel serverless), usar DATABASE_URL (pooler porta 6543 — otimizado para serverless).
const connectionString =
  process.env.NODE_ENV !== 'production' && process.env.DIRECT_URL
    ? process.env.DIRECT_URL
    : process.env.DATABASE_URL

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
