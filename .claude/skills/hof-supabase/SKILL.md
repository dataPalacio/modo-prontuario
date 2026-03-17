---
name: hof-supabase
description: >
  Guia completo de Supabase para o sistema Prontuário HOF: conexão, debug, Prisma ORM, migrações,
  RLS, Storage e monitoramento. Use SEMPRE que: (1) houver erros de conexão com o banco de dados
  (ECONNREFUSED, timeout, "too many clients", IPv6); (2) for configurar ou depurar variáveis
  DATABASE_URL e DIRECT_URL; (3) for criar ou executar migrations Prisma no Supabase; (4) for
  configurar Row-Level Security (RLS) e políticas de acesso; (5) for usar Supabase Storage para
  fotos clínicas; (6) houver problemas no Supabase Dashboard, logs ou métricas; (7) for fazer
  seed, reset ou backup do banco de dados; (8) qualquer task envolvendo Supabase, PostgreSQL,
  pooler Supavisor ou Prisma no projeto HOF.
---

# Supabase — Prontuário HOF

## Arquitetura de Conexão

O projeto usa **duas connection strings** com papéis distintos:

```
DATABASE_URL  → Supavisor Pooler (porta 6543, pgbouncer=true)
               ↳ Usado pelo Prisma em runtime (serverless/Vercel)
               ↳ Modo: transaction mode

DIRECT_URL    → Conexão direta PostgreSQL (porta 5432)
               ↳ Usado pelo Prisma para migrations
               ↳ Nunca usar em código de aplicação
```

### Onde encontrar as URLs

No Supabase Dashboard → **Project → Connect** → aba "ORMs":

```env
# Transaction Pooler (porta 6543) — Prisma runtime
DATABASE_URL="postgresql://postgres.SEU_PROJECT_REF:SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection (porta 5432) — Migrations
DIRECT_URL="postgresql://postgres.SEU_PROJECT_REF:SENHA@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
```

### `schema.prisma` obrigatório

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // ← Obrigatório para migrations
}
```

---

## Debug — Erros Mais Comuns

### ❌ "too many clients already" / "remaining connection slots reserved"

**Causa:** Limite de conexões simultâneas esgotado (60 no Free, 200 no Pro).

**Solução imediata:**
1. Verificar se `DATABASE_URL` usa o pooler (porta `6543`, `?pgbouncer=true`)
2. Confirmar singleton do Prisma Client — sem instanciar por request

```typescript
// src/lib/prisma.ts — PADRÃO CORRETO (singleton)
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Diagnóstico no Dashboard:** Supabase Dashboard → Monitoring → Database → Connections

---

### ❌ CONNECT_TIMEOUT / ECONNREFUSED

**Checklist:**

| Check | Solução |
|-------|---------|
| URL aponta para porta `5432` em prod? | Mudar para `6543` (pooler) com `?pgbouncer=true` |
| Usando IP direta `db.XXX.supabase.co`? | Trocar pelo pooler `aws-0-REGIÃO.pooler.supabase.com` |
| IP bloqueado por tentativas erradas? | Aguardar 30 min ou contatar suporte com seu IP |
| Supabase paused (projeto free inativo)? | Dashboard → Overview → "Restore Project" |

```bash
# Diagnóstico rápido — testar conectividade direto
npx prisma db execute --stdin <<< "SELECT 1"
# Ou com psql:
psql "$DATABASE_URL" -c "SELECT version();"
```

---

### ❌ "Network is unreachable" (IPv6)

Desde 2024, conexões diretas Supabase são **IPv6 only**. Vercel usa IPv4 por padrão.

**Solução:** Sempre usar o Supavisor Pooler — ele é dual-stack (IPv4 + IPv6):

```env
# ✅ CORRETO — Supavisor pooler (IPv4 compatible)
DATABASE_URL="postgresql://postgres.REF:SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# ❌ ERRADO — Direct connection (IPv6 only)
DATABASE_URL="postgresql://postgres:SENHA@db.REF.supabase.co:5432/postgres"
```

---

### ❌ Prisma: "prepared statement already exists"

**Causa:** PgBouncer no modo transaction não suporta prepared statements do Prisma.

**Solução no schema.prisma:**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider          = "postgresql"
  url               = env("DATABASE_URL")
  directUrl         = env("DIRECT_URL")
}
```

**E na URL:**
```env
DATABASE_URL="...?pgbouncer=true&connection_limit=1"
```

O `connection_limit=1` é recomendado para funções serverless — cada instância precisa de apenas 1 conexão.

---

### ❌ Migration falha em produção

**Causa comum:** Usando `DATABASE_URL` (pooler) ao invés de `DIRECT_URL` para migrations.

O pooler (transaction mode) não suporta DDL complexo. Migrations precisam da conexão direta.

```bash
# Verifica se DIRECT_URL está configurada:
echo $DIRECT_URL

# Executa migration com conexão direta (Prisma usa DIRECT_URL automaticamente)
npx prisma migrate deploy

# Se a migration travar, verificar no Dashboard:
# Database → Migrations → "Applied"
```

---

## Prisma — Comandos HOF

```bash
# Fluxo padrão de desenvolvimento
npm run db:generate    # Regerar Prisma Client após mudança no schema
npm run db:push        # Aplicar schema sem versionar migration (dev)
npm run db:migrate     # Migration versionada (features importantes)
npm run db:studio      # UI visual do banco (roda localmente)
npm run db:seed        # Popular com dados demo

# Reset completo (⚠️ APAGA TODOS OS DADOS — apenas dev)
npx prisma migrate reset

# Verificar status das migrations
npx prisma migrate status

# Aplicar migrations pendentes em produção
npx prisma migrate deploy
```

### Migration de produção — checklist

```bash
# 1. Criar migration localmente
npx prisma migrate dev --name nome-da-feature

# 2. Revisar arquivo gerado em prisma/migrations/
# 3. Commitar (inclui schema.prisma + arquivo migration)
# 4. Em produção (Vercel build ou CI):
npx prisma migrate deploy  # Aplica apenas migrations pendentes
npx prisma generate        # Regera o client
```

---

## Row-Level Security (RLS) — HOF

O projeto usa multi-tenant com `clinicaId`. Se usar Supabase Auth + RLS diretamente (em vez de NextAuth + Prisma), aplicar:

```sql
-- Habilitar RLS na tabela Paciente
ALTER TABLE "Paciente" ENABLE ROW LEVEL SECURITY;

-- Política de isolamento por clínica
CREATE POLICY "clinica_isolation" ON "Paciente"
  USING (auth.jwt()->>'clinicaId' = "clinicaId");

-- Para auditLog — apenas leitura pelo próprio profissional
CREATE POLICY "auditlog_read_own" ON "AuditLog"
  FOR SELECT
  USING (auth.uid()::text = "profissionalId");
```

> ⚠️ O projeto HOF usa **Prisma + NextAuth** para queries, não o Supabase Client JS.
> RLS é recomendado como **segunda camada de segurança**, não camada primária.
> A camada primária é sempre filtrar por `clinicaId` da sessão no código.

---

## Supabase Storage — Fotos Clínicas

### Configuração do bucket

```typescript
// src/lib/storage.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // Service role para server-side
)

// Upload de foto clínica
export async function uploadFotoClinica(
  file: File,
  clinicaId: string,
  pacienteId: string,
  prontuarioId: string
): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${clinicaId}/${pacienteId}/${prontuarioId}/${Date.now()}.${ext}`

  const { data, error } = await supabase.storage
    .from('fotos-clinicas')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw new Error(`Upload falhou: ${error.message}`)

  // URL assinada (expiração 1h — não pública)
  const { data: signedUrl } = await supabase.storage
    .from('fotos-clinicas')
    .createSignedUrl(data.path, 3600)

  return signedUrl?.signedUrl ?? ''
}
```

### Política RLS para Storage

```sql
-- Bucket privado (apenas acesso autenticado)
INSERT INTO storage.buckets (id, name, public)
VALUES ('fotos-clinicas', 'fotos-clinicas', false);

-- Política: cada clínica acessa apenas sua pasta
CREATE POLICY "clinica_storage_access" ON storage.objects
  FOR ALL
  USING (bucket_id = 'fotos-clinicas'
    AND (storage.foldername(name))[1] = auth.jwt()->>'clinicaId');
```

---

## Monitoramento e Logs

### Dashboard — onde olhar

| Problema | Local no Dashboard |
|----------|-------------------|
| Erros de query | Logs → Database |
| Conexões esgotadas | Monitoring → Database → Connections |
| Lentidão em queries | Database → Query Performance |
| Erros de Auth | Logs → Auth |
| Tamanho do banco | Project → Overview → Database size |

### Queries lentas — identificar e corrigir

```sql
-- Ver queries lentas no Supabase (via SQL Editor)
SELECT
  query,
  calls,
  mean_exec_time,
  total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;
```

### Verificar conexões ativas

```sql
-- Conexões ativas agora
SELECT count(*), state, usename
FROM pg_stat_activity
GROUP BY state, usename
ORDER BY count DESC;

-- Matar conexões ociosas (⚠️ com cuidado)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
  AND query_start < NOW() - INTERVAL '10 minutes';
```

---

## Variáveis de Ambiente — Referência Completa

```env
# ── Banco de dados ──────────────────────────────────────────
# Supavisor transaction pooler — runtime da aplicação
DATABASE_URL="postgresql://postgres.PROJECT_REF:SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Conexão direta — apenas migrations
DIRECT_URL="postgresql://postgres.PROJECT_REF:SENHA@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"

# ── Supabase SDK (Storage, Auth) ───────────────────────────
NEXT_PUBLIC_SUPABASE_URL="https://PROJECT_REF.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."      # Chave pública (safe para client)
SUPABASE_SERVICE_ROLE_KEY="eyJ..."          # ⚠️ NUNCA expor no client (NEXT_PUBLIC_)
```

> 🚨 `SUPABASE_SERVICE_ROLE_KEY` bypassa RLS. Usar **apenas** em Server Components,
> API Routes e Server Actions. Jamais com prefixo `NEXT_PUBLIC_`.

---

## Seed e Reset

```bash
# Popular banco com dados de demonstração
npm run db:seed
# Credenciais demo: carlos@clinicapremium.com.br / 123456

# Reset + seed (dev only — APAGA TUDO)
npx prisma migrate reset && npm run db:seed

# Verificar dados no Studio
npm run db:studio  # Abre http://localhost:5555
```

---

## Checklist de Saúde do Banco

- [ ] `DATABASE_URL` usa pooler porta `6543` com `?pgbouncer=true`
- [ ] `DIRECT_URL` usa porta `5432` para migrations
- [ ] Singleton Prisma em `src/lib/prisma.ts`
- [ ] `connection_limit=1` na DATABASE_URL (serverless/Vercel)
- [ ] Todas as queries filtram por `clinicaId` (multi-tenant)
- [ ] Soft delete com `deletedAt` — sem `prisma.delete()` em prontuários
- [ ] Bucket `fotos-clinicas` configurado como privado
- [ ] `SUPABASE_SERVICE_ROLE_KEY` sem prefixo `NEXT_PUBLIC_`
- [ ] Migrations em `prisma/migrations/` commitadas no Git