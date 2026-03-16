---
name: hof-backend
description: >
  Padrões de API, Prisma ORM, autenticação NextAuth, validação Zod, LGPD e regras de negócio
  clínico do sistema Prontuário HOF. Use SEMPRE que for criar ou modificar API Routes, Server
  Actions, queries Prisma, schemas de validação, lógica de autenticação/autorização, audit logs,
  soft delete, criptografia de dados sensíveis, seed de banco, migrations ou qualquer código
  que acesse o banco de dados PostgreSQL (Supabase). Também ativa para tarefas de conformidade
  legal (CFM, CFO, CFBM, ANVISA, LGPD), rastreabilidade de produtos e geração de números de
  prontuário.
---
# Backend — Prontuário HOF

## Stack e Configuração

| Camada      | Tecnologia                                                             |
| ----------- | ---------------------------------------------------------------------- |
| Framework   | Next.js 14 App Router — API Routes + Server Actions                   |
| ORM         | Prisma 7 (`prisma/schema.prisma`)                                    |
| Banco       | PostgreSQL via Supabase (pooler porta 6543)                            |
| Auth        | NextAuth v5 — JWT 8h, provider Credentials                            |
| Validação | Zod (schemas em `src/lib/validations/`)                              |
| Crypto      | AES-256-GCM (CPF), SHA-256 (integridade prontuário), bcrypt 12 rounds |
| Email       | Resend                                                                 |
| Upload      | Uploadthing                                                            |

---

## Prisma — Entidades Principais

```
Clinica          → multi-tenant root
  ├── Profissional  (médico/dentista/biomédico — usuário do sistema)
  ├── Paciente      (soft delete via deletedAt)
  └── Prontuario    (soft delete via deletedAt)
       ├── Procedimento  (lote obrigatório — ANVISA)
       ├── Evolucao
       ├── FotoClinica
       └── Tcle          (1:1 com Prontuario)
AuditLog         → registra toda operação sobre prontuários
```

### Client Singleton

```typescript
// src/lib/prisma.ts — importar sempre daqui
import { prisma } from '@/lib/prisma'
```

---

## Modelo de Dados — Campos Críticos

### Paciente

```prisma
cpf          String   // ⚠️ Criptografar AES-256-GCM antes de salvar
dataNasc     DateTime
deletedAt    DateTime? // Soft delete — nunca deletar fisicamente
```

### Prontuario

```prisma
numero           String   @unique  // Formato: P-{ANO}-{SEQPAD4} ex: P-2025-0001
status           StatusProntuario  // ABERTO | EM_ANDAMENTO | ASSINADO | ARQUIVADO
hashIntegridade  String?  // SHA-256 do conteúdo — gerado ao assinar
deletedAt        DateTime? // Soft delete — retenção 20 anos (CFM 1.638/2002)
```

### Procedimento

```prisma
lote  String  // ⚠️ OBRIGATÓRIO — rastreabilidade ANVISA
```

### Tcle

```prisma
assinaturaUrl  String?  // base64 PNG da assinatura digital
ipAssinatura   String?  // IP do paciente no momento da assinatura
assinadoEm     DateTime?
versao         String   // versão do template TCLE usado
```

### AuditLog

```prisma
acao       String  // ex: PRONTUARIO_VISUALIZADO, PACIENTE_EDITADO
entidade   String  // ex: Prontuario, Paciente
entidadeId String
ip         String
dados      Json?   // snapshot antes/depois da operação
```

---

## Enumerações

```typescript
enum TipoConselho   { CFM | CFO | CFBM | CFF }
enum Role           { ADMIN | PROFISSIONAL | RECEPCIONISTA }
enum Plano          { FREE | BASIC | PRO | ENTERPRISE }
enum Sexo           { MASCULINO | FEMININO | OUTRO | NAO_INFORMADO }
enum StatusProntuario { ABERTO | EM_ANDAMENTO | ASSINADO | ARQUIVADO }
enum TipoProcedimento {
  TOXINA_BOTULINICA | PREENCHIMENTO_ACIDO_HIALURONICO | BIOESTIMULADOR_COLAGENO
  FIOS_PDO | RINOMODELACAO | BICHECTOMIA | LIPOFILLING_FACIAL
  PEELING_QUIMICO | SKINBOOSTER | MICROAGULHAMENTO | OUTRO
}
enum TipoFoto { ANTES | DEPOIS | INTRAOPERATORIO | RETORNO }
```

---

## Padrão de API Route

```typescript
// src/app/api/[recurso]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET — listagem paginada com filtros
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const page     = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const search   = searchParams.get('search') || ''
    const clinicaId = session.user.clinicaId // ⚠️ sempre filtrar por clinicaId

    const where = {
      clinicaId,
      deletedAt: null,
      ...(search && {
        OR: [
          { nome: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const [data, total] = await Promise.all([
      prisma.ENTIDADE.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.ENTIDADE.count({ where }),
    ])

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// POST — criação com validação Zod
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const body = await request.json()
    const validated = schema.parse(body)  // Zod — lança ZodError se inválido

    const item = await prisma.ENTIDADE.create({
      data: { ...validated, clinicaId: session.user.clinicaId },
    })

    // Registrar audit log
    await registrarAuditLog({
      clinicaId: session.user.clinicaId,
      userId: session.user.id,
      acao: 'ENTIDADE_CRIADA',
      entidade: 'Entidade',
      entidadeId: item.id,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    })

    return NextResponse.json({ data: item }, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
```

---

## Server Actions (formulários)

```typescript
// src/app/(dashboard)/[feature]/actions.ts
'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createItemAction(formData: FormData) {
  const nome = formData.get('nome') as string
  // Validar, salvar, revalidar cache, redirecionar
  const item = await prisma.ENTIDADE.create({ data: { nome, ... } })
  revalidatePath('/rota')
  redirect(`/rota/${item.id}`)
}
```

---

## Autenticação (NextAuth v5)

```typescript
// src/lib/auth.ts
import { auth } from '@/lib/auth'

// Em Server Components / API Routes:
const session = await auth()
if (!session?.user) redirect('/login')

// Dados disponíveis na sessão:
session.user.id           // profissionalId
session.user.clinicaId    // ⚠️ chave do multi-tenant
session.user.role         // ADMIN | PROFISSIONAL | RECEPCIONISTA
session.user.conselho     // CFM | CFO | CFBM
session.user.numeroConselho
```

### Verificação de Role

```typescript
if (session.user.role !== 'ADMIN') {
  return NextResponse.json({ error: 'Permissão negada' }, { status: 403 })
}
```

---

## LGPD — Compliance Obrigatório

### 1. Filtro Multi-tenant (SEMPRE)

```typescript
// ⚠️ Toda query DEVE incluir clinicaId da sessão
prisma.paciente.findMany({ where: { clinicaId: session.user.clinicaId } })
```

### 2. Soft Delete (NUNCA deletar prontuários fisicamente)

```typescript
// Soft delete — setar deletedAt
await prisma.prontuario.update({
  where: { id },
  data: { deletedAt: new Date() }
})

// Busca excluindo deletados
prisma.prontuario.findMany({ where: { deletedAt: null } })
```

### 3. Audit Log (obrigatório para todas operações em prontuários)

```typescript
async function registrarAuditLog(params: {
  clinicaId: string
  userId: string
  acao: string      // ex: 'PRONTUARIO_ASSINADO', 'PACIENTE_VISUALIZADO'
  entidade: string  // ex: 'Prontuario', 'Paciente'
  entidadeId: string
  ip: string
  dados?: Record<string, unknown>  // snapshot antes/depois
}) {
  await prisma.auditLog.create({ data: params })
}
```

### 4. Criptografia de CPF

```typescript
// ⚠️ Nunca salvar CPF em texto claro
// Implementar encrypt/decrypt com AES-256-GCM usando ENCRYPTION_KEY do .env
const cpfCriptografado = await encryptField(cpf)
await prisma.paciente.create({ data: { cpf: cpfCriptografado } })
```

### 5. Hash de Integridade no Prontuário Assinado

```typescript
import { generateHash } from '@/lib/utils'
const hash = await generateHash(JSON.stringify(prontuarioData))
await prisma.prontuario.update({
  where: { id },
  data: { hashIntegridade: hash, status: 'ASSINADO', assinadoEm: new Date() }
})
```

---

## Schemas Zod — Validações

```typescript
// Localização: src/lib/validations/
// paciente.schema.ts — PacienteFormData
// prontuario.schema.ts — ProntuarioFormData, AnamneseFormData
// procedimento.schema.ts — ProcedimentoFormData

import { pacienteSchema } from '@/lib/validations/paciente.schema'

// Uso em API Route:
const validated = pacienteSchema.parse(body)

// Uso em React Hook Form:
const form = useForm<PacienteFormData>({
  resolver: zodResolver(pacienteSchema)
})
```

### Campos obrigatórios por schema

**Paciente**: nome, cpf (11 dígitos, só números), dataNasc, sexo, telefone (10-11 dígitos)
**Procedimento**: prontuarioId, tipo, regiaoAnatomica, produto, **lote** (obrigatório ANVISA)
**Prontuário**: pacienteId, dataAtendimento, queixaPrincipal (mín. 5 chars)

---

## Utilitários (`src/lib/utils.ts`)

```typescript
import {
  formatDate,         // dd/MM/yyyy
  formatDateTime,     // dd/MM/yyyy 'às' HH:mm
  formatCPF,          // 123.456.789-00
  formatPhone,        // (11) 99999-9999
  gerarNumeroProntuario,  // P-2025-0001
  calcularIdade,      // número inteiro
  validarCPF,         // boolean
  generateHash,       // SHA-256 async
} from '@/lib/utils'
```

### Gerar número de prontuário

```typescript
const count = await prisma.prontuario.count()
const numero = gerarNumeroProntuario(count + 1) // "P-2025-0042"
```

---

## Rastreabilidade de Produtos (ANVISA)

Ao criar um Procedimento, o campo `lote` é **obrigatório** e deve ser:

- Salvo exatamente como fornecido (case-sensitive)
- Indexado para busca rápida em recalls
- Vinculado ao `prontuarioId` para rastrear paciente ↔ lote

Campos de rastreabilidade completa:

```typescript
{
  produto: string      // nome comercial
  fabricante: string?  // nome do fabricante
  lote: string         // ⚠️ obrigatório
  validadeProduto: Date?
  concentracao: string?
  volume: string?
}
```

---

## Conformidade Legal — Prazos de Retenção

| Dado            | Prazo   | Base Legal     |
| --------------- | ------- | -------------- |
| Prontuários    | 20 anos | CFM 1.638/2002 |
| TCLE            | 20 anos | CFM 1.638/2002 |
| Fotos clínicas | 20 anos | CFM 1.638/2002 |
| Audit logs      | 20 anos | CFM 1.638/2002 |

**Nunca** implementar exclusão física de prontuários. Sempre soft delete com `deletedAt`.

---

## Seed (`prisma/seed.ts`)

```bash
npm run db:seed    # popula: 1 clínica, 1 profissional, 5 pacientes, 2 prontuários
```

**Credenciais demo:** `carlos@clinicapremium.com.br` / `123456`

---

## Comandos Úteis

```bash
npm run db:generate   # npx prisma generate — regerar client após schema change
npm run db:push       # npx prisma db push — aplicar schema sem migration
npm run db:migrate    # npx prisma migrate dev — migration versionada
npm run db:studio     # npx prisma studio — UI visual do banco
npm run db:seed       # popular banco com dados demo
```

---

## Variáveis de Ambiente Necessárias

```env
DATABASE_URL="postgresql://...6543/postgres?pgbouncer=true"  # pooler Supabase
DIRECT_URL="postgresql://...5432/postgres"                   # conexão direta
AUTH_SECRET="..."        # openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
UPLOADTHING_SECRET="sk_live_..."
RESEND_API_KEY="re_..."
```

---

## Checklist antes de entregar código backend

- [ ] Query filtra por `clinicaId` da sessão (multi-tenant)
- [ ] Soft delete com `deletedAt` — sem `delete()` em prontuários/pacientes
- [ ] Audit log registrado para operações em dados sensíveis
- [ ] Validação Zod no payload de entrada
- [ ] CPF não trafega/salva em texto claro
- [ ] Campo `lote` presente e obrigatório em procedimentos
- [ ] Tratamento de erro com status HTTP correto (400, 401, 403, 500)
- [ ] `session.user.clinicaId` usado — nunca `clinicaId` vindo do body
