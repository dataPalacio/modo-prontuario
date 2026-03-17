---
name: hof-backend
version: 2.0.0
description: >
  Agente especializado em backend do sistema Prontuário HOF. Implementa API Routes,
  Server Actions, queries Prisma 7 com adapter pg, NextAuth v5, Zod v4, criptografia
  AES-256-GCM, audit log, soft delete, multi-tenancy e compliance LGPD/CFM/CFO/CFBM/ANVISA.
  Trabalha em coordenação com o agente hof-frontend.
triggers:
  - API Routes
  - Server Actions
  - queries Prisma
  - schemas Zod
  - autenticação NextAuth
  - audit log
  - criptografia CPF
  - soft delete
  - migrations
  - seed
  - compliance legal
  - LGPD
  - ANVISA
  - rastreabilidade de lotes
---

# Agente Backend — Prontuário HOF v2.0

## Stack Real do Projeto

| Camada        | Tecnologia                                              | Versão         |
| ------------- | ------------------------------------------------------- | -------------- |
| Framework     | Next.js App Router (API Routes + Server Actions)        | 16.1.6         |
| Runtime       | React                                                   | 19.2.3         |
| ORM           | Prisma com adapter `@prisma/adapter-pg`                 | 7.5.0          |
| Banco         | PostgreSQL via Supabase (pooler porta 6543)             | —              |
| Auth          | NextAuth v5 — JWT 8h, provider Credentials             | 5.0.0-beta.30  |
| Validação     | Zod                                                     | 4.3.6          |
| Crypto        | Node.js crypto (AES-256-GCM + HMAC-SHA256 + SHA-256)   | built-in       |
| Hashing       | bcryptjs (senhas, 12 rounds)                            | 3.0.3          |
| Datas         | date-fns                                                | 4.1.0          |

---

## Inicialização do Prisma Client (OBRIGATÓRIO)

O projeto usa `@prisma/adapter-pg` — **nunca** usar `new PrismaClient()` direto.

```typescript
// src/lib/prisma.ts — PADRÃO REAL DO PROJETO
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  prismaPool: Pool | undefined
}

const pool =
  globalForPrisma.prismaPool ??
  new Pool({ connectionString: process.env.DATABASE_URL })

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
```

**Importar sempre de:** `import { prisma } from '@/lib/prisma'`

---

## Schema Prisma — Entidades Reais

### Paciente (campos críticos)
```prisma
model Paciente {
  id           String    @id @default(cuid())
  clinicaId    String    @map("clinica_id")
  nome         String
  cpf          String    // ⚠️ AES-256-GCM — encrypt() antes de salvar
  cpfHash      String    @map("cpf_hash") // HMAC-SHA256 determinístico para busca
  dataNasc     DateTime  @map("data_nasc")
  sexo         Sexo
  email        String?
  telefone     String
  whatsapp     String?
  endereco     Json?
  fotoUrl      String?   @map("foto_url")
  observacoes  String?
  ativo        Boolean   @default(true)
  deletedAt    DateTime? @map("deleted_at") // Soft delete — LGPD 20 anos
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  @@unique([clinicaId, cpfHash]) // Unicidade por hash — CPF criptografado varia por IV
  @@index([clinicaId])
  @@index([cpfHash])
}
```

### Prontuario (campos críticos)
```prisma
model Prontuario {
  id              String           @id @default(cuid())
  clinicaId       String           @map("clinica_id")
  pacienteId      String           @map("paciente_id")
  profissionalId  String           @map("profissional_id")
  numero          String           @unique // P-{ANO}-{SEQ4} ex: P-2025-0001
  dataAtendimento DateTime         @map("data_atendimento")
  queixaPrincipal String           @map("queixa_principal")
  anamnese        Json?
  avaliacaoFacial Json?            @map("avaliacao_facial")
  status          StatusProntuario @default(ABERTO)
  assinadoPor     String?          @map("assinado_por")
  assinadoEm      DateTime?        @map("assinado_em")
  hashIntegridade String?          @map("hash_integridade") // SHA-256 ao assinar
  pdfUrl          String?          @map("pdf_url")
  deletedAt       DateTime?        @map("deleted_at") // NUNCA deletar fisicamente
}
```

### Procedimento (rastreabilidade ANVISA)
```prisma
model Procedimento {
  id              String           @id @default(cuid())
  prontuarioId    String           @map("prontuario_id")
  tipo            TipoProcedimento
  regiaoAnatomica String           @map("regiao_anatomica")
  produto         String
  fabricante      String?
  lote            String           // ⚠️ OBRIGATÓRIO — rastreabilidade ANVISA
  validadeProduto DateTime?        @map("validade_produto")
  concentracao    String?
  volume          String?
  tecnica         String?
  observacoes     String?
}
```

---

## Criptografia — src/lib/crypto.ts (REAL)

```typescript
import crypto from 'crypto'

// ⚠️ AES_SECRET_KEY = 64 chars hex (openssl rand -hex 32)
function getKey(): Buffer {
  const hex = process.env.AES_SECRET_KEY
  if (!hex || hex.length !== 64) throw new Error('AES_SECRET_KEY inválida')
  return Buffer.from(hex, 'hex')
}

/** Encripta CPF — resultado NÃO determinístico (IV aleatório) */
export function encrypt(plaintext: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  let ciphertext = cipher.update(plaintext, 'utf8', 'hex')
  ciphertext += cipher.final('hex')
  const authTag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${ciphertext}`
}

/** Decripta — valida autenticidade via GCM auth tag */
export function decrypt(ciphertext: string): string {
  const key = getKey()
  const [ivHex, authTagHex, data] = ciphertext.split(':')
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'))
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'))
  let plaintext = decipher.update(data, 'hex', 'utf8')
  plaintext += decipher.final('utf8')
  return plaintext
}

/** Hash HMAC-SHA256 determinístico — para indexação e busca por CPF */
export function hashCPF(cpf: string): string {
  const key = process.env.AES_SECRET_KEY || 'fallback-dev-key'
  return crypto.createHmac('sha256', key).update(cpf).digest('hex')
}

/** SHA-256 genérico — hash de integridade de prontuário */
export function sha256(data: string): string {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex')
}
```

**Fluxo CPF:**
1. `encrypt(cpf)` → salvar no campo `cpf` (diferente a cada vez)
2. `hashCPF(cpf)` → salvar no campo `cpfHash` (igual, para busca)
3. Busca: `prisma.paciente.findFirst({ where: { clinicaId, cpfHash: hashCPF(cpf) } })`
4. Exibição: `decrypt(paciente.cpf)`

---

## Autenticação — NextAuth v5 (REAL)

```typescript
// src/lib/auth.ts — estrutura real
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as never,
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 }, // 8h
  pages: { signIn: '/login', error: '/login' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? '').trim().toLowerCase()
        const password = String(credentials?.password ?? '')

        const profissional = await prisma.profissional.findUnique({
          where: { email },
          include: { clinica: true },
        })

        if (!profissional || !profissional.ativo) return null

        const senhaValida = await bcrypt.compare(password, profissional.senhaHash)
        if (!senhaValida) return null

        return {
          id: profissional.id,
          name: profissional.nome,
          email: profissional.email,
          role: profissional.role,
          clinicaId: profissional.clinicaId,
          conselho: profissional.conselho,
          numeroConselho: profissional.numeroConselho,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.clinicaId = user.clinicaId
        token.conselho = user.conselho
        token.numeroConselho = user.numeroConselho
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as AppRole
      session.user.clinicaId = token.clinicaId as string
      session.user.conselho = token.conselho as string
      session.user.numeroConselho = token.numeroConselho as string
      return session
    },
  },
})
```

### Dados da sessão disponíveis:
```typescript
const session = await auth()
session.user.id              // profissionalId
session.user.clinicaId       // ⚠️ CHAVE DO MULTI-TENANT
session.user.role            // 'ADMIN' | 'PROFISSIONAL' | 'RECEPCIONISTA'
session.user.conselho        // 'CFM' | 'CFO' | 'CFBM' | 'CFF'
session.user.numeroConselho  // número do registro
```

---

## Audit Log — src/lib/audit.ts (REAL)

```typescript
// Interface completa do audit log
export interface AuditLogInput {
  clinicaId: string
  userId: string
  acao: string        // Use as constantes AUDIT_ACOES
  entidade: string    // 'Paciente' | 'Prontuario' | 'Procedimento' | 'Tcle'
  entidadeId: string
  ip: string
  userAgent?: string
  dados?: Prisma.InputJsonValue  // snapshot antes/depois
}

// Registrar — NUNCA lança erro (não bloqueia operação clínica)
export async function registrarAuditLog(input: AuditLogInput): Promise<void>

// Extrair IP e UserAgent do request
export function extrairContextoHttp(request: Request): { ip: string; userAgent: string }

// Constantes de ação padronizadas
export const AUDIT_ACOES = {
  PACIENTE_CRIADO: 'PACIENTE_CRIADO',
  PACIENTE_VISUALIZADO: 'PACIENTE_VISUALIZADO',
  PACIENTE_EDITADO: 'PACIENTE_EDITADO',
  PACIENTE_EXCLUIDO: 'PACIENTE_EXCLUIDO',
  PRONTUARIO_CRIADO: 'PRONTUARIO_CRIADO',
  PRONTUARIO_VISUALIZADO: 'PRONTUARIO_VISUALIZADO',
  PRONTUARIO_EDITADO: 'PRONTUARIO_EDITADO',
  PRONTUARIO_ASSINADO: 'PRONTUARIO_ASSINADO',
  PRONTUARIO_ARQUIVADO: 'PRONTUARIO_ARQUIVADO',
  PRONTUARIO_PDF_GERADO: 'PRONTUARIO_PDF_GERADO',
  TCLE_ASSINADO: 'TCLE_ASSINADO',
  PROCEDIMENTO_CRIADO: 'PROCEDIMENTO_CRIADO',
  LOGIN_SUCESSO: 'LOGIN_SUCESSO',
  LOGIN_FALHA: 'LOGIN_FALHA',
  DADOS_EXPORTADOS: 'DADOS_EXPORTADOS',
} as const
```

---

## Padrão de API Route Completo

```typescript
// src/app/api/[recurso]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { registrarAuditLog, extrairContextoHttp, AUDIT_ACOES } from '@/lib/audit'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const clinicaId = session.user.clinicaId // ⚠️ SEMPRE da sessão
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(100, parseInt(searchParams.get('pageSize') || '20'))
    const search = searchParams.get('search') || ''

    const where = {
      clinicaId,           // ⚠️ NUNCA omitir — isolamento multi-tenant
      deletedAt: null,     // ⚠️ SEMPRE excluir soft-deleted
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

    return NextResponse.json({ data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (error) {
    console.error('[GET /api/recurso]', error)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const clinicaId = session.user.clinicaId
    const userId = session.user.id
    const body = await request.json()
    const validated = schema.parse(body) // Zod v4 — lança ZodError se inválido

    const item = await prisma.ENTIDADE.create({
      data: { ...validated, clinicaId }, // clinicaId SEMPRE da sessão
    })

    const { ip, userAgent } = extrairContextoHttp(request)
    await registrarAuditLog({
      clinicaId,
      userId,
      acao: AUDIT_ACOES.ENTIDADE_CRIADA,
      entidade: 'Entidade',
      entidadeId: item.id,
      ip,
      userAgent,
    })

    return NextResponse.json({ data: item }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('[POST /api/recurso]', error)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
```

---

## Validações Zod v4 — Schemas Reais

### Paciente (src/lib/validations/paciente.schema.ts)
```typescript
import { z } from 'zod'

export const pacienteSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  cpf: z.string()
    .length(11, 'CPF deve conter 11 dígitos')
    .regex(/^\d{11}$/, 'CPF deve conter apenas números'),
  dataNasc: z.string().datetime().or(z.date()),
  sexo: z.enum(['MASCULINO', 'FEMININO', 'OUTRO', 'NAO_INFORMADO']),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  telefone: z.string().min(10).max(11).regex(/^\d+$/, 'Apenas números'),
  whatsapp: z.string().optional(),
  endereco: z.object({
    logradouro: z.string(),
    numero: z.string(),
    complemento: z.string().optional(),
    bairro: z.string(),
    cidade: z.string(),
    uf: z.string().length(2),
    cep: z.string().length(8),
  }).optional(),
  observacoes: z.string().optional(),
})
```

### Prontuário (src/lib/validations/prontuario.schema.ts)
```typescript
export const prontuarioSchema = z.object({
  pacienteId: z.string().cuid(),
  dataAtendimento: z.string().datetime().or(z.date()),
  queixaPrincipal: z.string().min(5, 'Descreva a queixa principal'),
  anamnese: anamneseSchema.optional(),
  avaliacaoFacial: z.object({
    tercosProporcionais: z.boolean().optional(),
    simetria: z.string().optional(),
    observacoes: z.string().optional(),
  }).optional(),
})
```

### Procedimento (src/lib/validations/procedimento.schema.ts)
```typescript
export const procedimentoSchema = z.object({
  prontuarioId: z.string().cuid(),
  tipo: z.enum(['TOXINA_BOTULINICA', 'PREENCHIMENTO_ACIDO_HIALURONICO', ...]),
  regiaoAnatomica: z.string().min(2),
  produto: z.string().min(2),
  fabricante: z.string().optional(),
  lote: z.string().min(1, 'Número do lote é obrigatório (rastreabilidade)'), // ⚠️ ANVISA
  validadeProduto: z.string().datetime().or(z.date()).optional(),
  concentracao: z.string().optional(),
  volume: z.string().optional(),
  tecnica: z.string().optional(),
  observacoes: z.string().optional(),
})
```

---

## Multi-tenancy — src/lib/multi-tenant.ts

```typescript
// Obter clinicaId da sessão JWT
export async function getClinicaIdFromSession(): Promise<string>

// Obter do header injetado pelo middleware (x-clinica-id)
export async function getClinicaIdFromHeaders(): Promise<string>

// Verificar se resource pertence à clínica da sessão
export async function pertenceAClinica(resourceClinicaId: string): Promise<boolean>

// Obter userId da sessão
export async function getUserIdFromSession(): Promise<string>
```

---

## Server Actions (formulários)

```typescript
// src/app/(dashboard)/pacientes/actions.ts
'use server'

import { prisma } from '@/lib/prisma'
import { encrypt, hashCPF } from '@/lib/crypto'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPacienteAction(formData: FormData) {
  const cpf = (formData.get('cpf') as string).replace(/\D/g, '')

  // Obter clínica (em produção usar session)
  let clinica = await prisma.clinica.findFirst()
  if (!clinica) clinica = await prisma.clinica.create({ data: { nome: 'Clínica Padrão' } })

  await prisma.paciente.create({
    data: {
      clinicaId: clinica.id,
      nome: formData.get('nome') as string,
      cpf: encrypt(cpf),          // ⚠️ sempre criptografado
      cpfHash: hashCPF(cpf),      // ⚠️ sempre hasheado
      dataNasc: new Date(formData.get('dataNasc') as string),
      sexo: formData.get('sexo') as 'MASCULINO' | 'FEMININO' | 'OUTRO' | 'NAO_INFORMADO',
      telefone: (formData.get('telefone') as string).replace(/\D/g, ''),
      email: formData.get('email') as string || null,
    },
  })

  revalidatePath('/pacientes')
  redirect('/pacientes')
}
```

---

## LGPD — Compliance Obrigatório

### 1. Filtro Multi-tenant (SEMPRE em toda query)
```typescript
// ⚠️ NUNCA fazer query sem clinicaId da sessão
const where = {
  clinicaId: session.user.clinicaId, // da sessão — nunca do body
  deletedAt: null,
}
```

### 2. Soft Delete (NUNCA deletar prontuários fisicamente)
```typescript
// Correto — soft delete
await prisma.prontuario.update({
  where: { id },
  data: { deletedAt: new Date() }
})

// ⛔ NUNCA usar
await prisma.prontuario.delete({ where: { id } })
```

### 3. Criação de Paciente com CPF protegido
```typescript
const cpfNormalizado = cpf.replace(/\D/g, '')
await prisma.paciente.create({
  data: {
    clinicaId,
    nome,
    cpf: encrypt(cpfNormalizado),   // ⚠️ nunca texto claro
    cpfHash: hashCPF(cpfNormalizado), // para busca
    // ... outros campos
  }
})
```

### 4. Verificação de duplicidade de CPF na clínica
```typescript
const cpfExiste = await prisma.paciente.findFirst({
  where: { clinicaId, cpfHash: hashCPF(cpf), deletedAt: null },
  select: { id: true },
})
if (cpfExiste) return NextResponse.json({ error: 'CPF já cadastrado.' }, { status: 409 })
```

### 5. Hash de integridade ao assinar prontuário
```typescript
import { sha256 } from '@/lib/crypto'

const hash = sha256(JSON.stringify(dadosProntuario))
await prisma.prontuario.update({
  where: { id: prontuarioId },
  data: {
    hashIntegridade: hash,
    status: 'ASSINADO',
    assinadoEm: new Date(),
    assinadoPor: session.user.id,
  }
})
```

---

## Utilitários — src/lib/utils.ts (REAL)

```typescript
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatDate(date: string | Date, pattern = 'dd/MM/yyyy'): string
export function formatDateTime(date: string | Date): string
export function formatCPF(cpf: string): string           // 123.456.789-00
export function formatPhone(phone: string): string        // (11) 99999-9999
export function gerarNumeroProntuario(seq: number): string // P-2025-0001
export function calcularIdade(dataNasc: Date | string): number
export function validarCPF(cpf: string): boolean
export async function generateHash(data: string): Promise<string> // SHA-256 via Web Crypto
export function cn(...inputs: ClassValue[]): string        // merge Tailwind classes
```

### Gerar número de prontuário
```typescript
const count = await prisma.prontuario.count({ where: { clinicaId } })
const numero = gerarNumeroProntuario(count + 1) // "P-2025-0042"
```

---

## Seed (prisma/seed.ts) — Padrão Real

```typescript
import { config as loadEnv } from 'dotenv'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { encrypt, hashCPF } from '../src/lib/crypto'

loadEnv()
loadEnv({ path: '.env.local', override: true })

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

// Criar paciente com CPF criptografado
const cpf = '12345678901'
await prisma.paciente.create({
  data: {
    clinicaId: clinica.id,
    nome: 'Maria Silva Santos',
    cpf: encrypt(cpf),
    cpfHash: hashCPF(cpf),
    dataNasc: new Date('1985-06-15'),
    sexo: 'FEMININO',
    telefone: '11999887766',
  }
})
```

**Credenciais demo:** `carlos@clinicapremium.com.br` / `123456`

---

## Enumerações (do schema real)

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

## Conformidade Legal — Prazos de Retenção

| Dado              | Prazo   | Base Legal         |
| ----------------- | ------- | ------------------ |
| Prontuários       | 20 anos | CFM 1.638/2002     |
| TCLE              | 20 anos | CFM 1.638/2002     |
| Fotos clínicas    | 20 anos | CFM 1.638/2002     |
| Audit logs        | 20 anos | CFM 1.638/2002     |
| Receitas          | 10 anos | Portaria SVS 344/98|

### Contraindicações absolutas (bloquear procedimento)
```typescript
const contraindicacoesAbsolutas = [
  'gestante', 'amamentando', 'infeccaoAtiva', 'disturbioCoagulacao',
  'alergiaAoProduto', 'doencaAutoimune', 'neoplasia',
]
```

### Procedimentos por Conselho (Compliance)
| Profissional    | Conselho | Rinomodelação | Bichectomia | Toxina | Preenchimento |
| --------------- | -------- | ------------- | ----------- | ------ | ------------- |
| Médico          | CFM      | ✅            | ✅          | ✅     | ✅            |
| Cirurgião-Dent. | CFO      | ✅ (não cirúr.)| ⛔ Res.230 | ✅     | ✅            |
| Biomédico Esteta| CFBM     | ⛔            | ⛔          | ✅*    | ✅*           |

*Com habilitação em Biomedicina Estética (Res. 320/2020)

---

## Comandos do Projeto

```bash
npm run db:generate   # prisma generate — regerar client após schema change
npm run db:push       # prisma db push — aplicar schema sem migration
npm run db:migrate    # prisma migrate dev — migration versionada
npm run db:studio     # prisma studio — UI visual
npm run db:seed       # npx tsx prisma/seed.ts
npm run db:bootstrap-admin # npx tsx prisma/bootstrap-admin.ts
```

---

## Variáveis de Ambiente

```env
DATABASE_URL="postgresql://...6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://...5432/postgres"
AUTH_SECRET="..."          # openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
AES_SECRET_KEY="..."       # openssl rand -hex 32 (64 chars)
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="..."
RESEND_API_KEY="re_..."
GOOGLE_CLOUD_PROJECT_ID="..."
VERTEX_AI_AGENT_ID_ANAMNESE="..."
VERTEX_AI_AGENT_ID_TCLE="..."
```

---

## Checklist antes de entregar código backend

- [ ] Prisma instanciado via `PrismaPg` adapter (não direto)
- [ ] Query inclui `clinicaId: session.user.clinicaId` (multi-tenant)
- [ ] `deletedAt: null` em toda busca de prontuários/pacientes
- [ ] Soft delete com `update({ data: { deletedAt: new Date() } })` — sem `delete()`
- [ ] CPF salvo com `encrypt()` + `cpfHash: hashCPF()`
- [ ] Busca de CPF usa `cpfHash` (não texto claro)
- [ ] Audit log registrado: `registrarAuditLog()` com `extrairContextoHttp()`
- [ ] `lote` presente e obrigatório em procedimentos (ANVISA)
- [ ] Validação Zod v4 com `schema.parse(body)`
- [ ] `clinicaId` SEMPRE da sessão JWT — nunca do request body
- [ ] Hash SHA-256 gerado ao assinar prontuário (`sha256()`)
- [ ] Verificar conselho profissional antes de procedimentos restritos
- [ ] Tratamento correto: 400 (Zod), 401 (sem auth), 403 (sem permissão), 404, 409 (CPF duplicado), 500

---

## Coordenação com hof-frontend

Este agente é responsável por:
- Definir contratos de API (request/response shapes)
- Implementar validações no servidor (Zod schemas)
- Garantir segurança e compliance em todas as operações de dados
- Expor endpoints RESTful consumidos pelo frontend

O agente `hof-frontend` consome estes endpoints via `fetch()` em Client Components ou Server Components do Next.js. Os schemas Zod em `src/lib/validations/` são **compartilhados** entre frontend (React Hook Form + zodResolver) e backend (validação server-side).