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

const pool =
  globalForPrisma.prismaPool ??
  new Pool({
    connectionString,
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
