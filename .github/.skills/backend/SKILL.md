---
name: backend
description: "Project backend conventions. Use for Prisma, auth, Zod, API routes, server actions, multi-tenant and LGPD-sensitive data flows."
argument-hint: "Descreva o endpoint, consulta, action ou regra backend que precisa seguir o padrao do projeto."
---

# Backend — Prontuário HOF

## Prisma ORM

- Schema em `prisma/schema.prisma`
- Client singleton em `src/lib/prisma.ts`
- Seed em `prisma/seed.ts`

## Autenticação (NextAuth v5)

- Config em `src/lib/auth.ts`
- Provider: Credentials com bcrypt
- JWT com 8h de expiração
- Sessão enriquecida com: `clinicaId`, `conselho`, `numeroConselho`, `role`

## Validação

- Schemas Zod em `src/lib/validations/`
- Mesmos schemas usados no front (React Hook Form) e back (API routes)

## API Routes Pattern

```typescript
// GET — Listagem paginada com filtros
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  // ...
}

// POST — Criação com validação Zod
export async function POST(request: NextRequest) {
  const body = await request.json()
  const validated = schema.parse(body)
  // ...
}
```

## LGPD Compliance

1. **Audit Log** — Registrar todas as operações em `AuditLog`
2. **Soft Delete** — Usar `deletedAt` em vez de DELETE
3. **Criptografia** — AES-256-GCM para CPF e dados sensíveis
4. **Multi-tenant** — Filtrar por `clinicaId` em todas as queries
5. **Hash de Integridade** — SHA-256 no prontuário assinado

## Retenção de Dados

- Prontuários: 20 anos (CFM 1.638/2002)
- Fotos: mesmo prazo do prontuário
- TCLE: mesmo prazo do prontuário
- Logs de auditoria: 20 anos
