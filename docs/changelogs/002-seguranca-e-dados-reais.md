# CHANGELOG — v0.2.0

> **Data:** 2026-03-17
> **Tipo:** fix · segurança · feature

---

## [0.2.0] - 2026-03-17

### Corrigido — Segurança Crítica

- **[CRÍTICO] `pacientes/page.tsx`** — Query não filtrava por `clinicaId`, expondo pacientes de TODAS as clínicas (IDOR Cross-Tenant). Adicionado filtro `clinicaId` da sessão JWT + `deletedAt: null`.
- **[CRÍTICO] `pacientes/[id]/page.tsx`** — `findUnique({ where: { id } })` sem `clinicaId` permitia acesso cruzado entre clínicas. Substituído por `findFirst({ where: { id, clinicaId, deletedAt: null } })`.
- **[CRITICO] CPF visível como lixo** — `formatCPF(p.cpf)` era chamado sobre o valor AES-256-GCM criptografado, resultando em exibição de dados incoerentes. CPF **removido da listagem** (conforme padrão da API); na tela de detalhe, é descriptografado com `decrypt()` antes de exibir.
- **[ALTO] Sem middleware de autenticação** — Criado `src/middleware.ts` usando NextAuth v5, protegendo rotas `/dashboard/*`, `/pacientes/*`, `/prontuarios/*`, `/procedimentos/*`, `/agenda/*`, `/fotos/*`, `/relatorios/*`, `/configuracoes/*` contra acesso sem sessão válida.
- **[ALTO] `prontuarios/page.tsx` exibia mock data** — Convertido de `'use client'` + dados estáticos para Server Component com queries Prisma reais, filtrado por `clinicaId` e `deletedAt: null`. Filtros de status via URL params (sem estado cliente).
- **[MÉDIO] `pacientes/actions.ts`** — `clinicaId` era obtido via `prisma.clinica.findFirst()` (qualquer clínica do banco) em vez da sessão. Substituído por `getSession()`. Erro P2002 (CPF duplicado) agora retorna mensagem amigável em vez de HTTP 500.
- **[MÉDIO] `register/route.ts`** — `z.enum(['CFM', 'CFO', 'CFBM', 'CFF'], 'string')` era sintaxe inválida no Zod v4. Corrigido para `z.enum([...])` sem segundo argumento.
- **[BAIXO] `bootstrap-admin/route.ts`** — Validação de senha aceitava mínimo 6 caracteres, inconsistente com o `register` que exige 8. Ajustado para 8.

### Adicionado

- **`src/middleware.ts`** — Proteção global das rotas autenticadas com NextAuth v5 (`export { auth as middleware }`).
- **Busca por CPF real** — `pacientes/page.tsx` agora usa `cpfHash` (HMAC-SHA256) para busca quando o termo tem 11 dígitos numéricos, respeitando a criptografia AES-256-GCM.
- **`next.config.ts`** — Adicionado `turbopack.root` apontando para o diretório do projeto, eliminando o aviso de múltiplos lockfiles.

### Alterado

- **`pacientes/page.tsx`** — Coluna CPF removida da tabela de listagem (dado sensível — exibir apenas no detalhe, descriptografado).
- **`pacientes/novo/page.tsx`** — Convertido para Client Component com `useActionState` para exibir erros de validação sem crash.
- **`prontuarios/page.tsx`** — Filtros de status agora usam navegação por URL (`<Link>`) em vez de `useState`, permitindo SSR e compartilhamento de URL com filtros.

---

## Notas Técnicas

### Por que CPF foi removido da listagem?

O CPF é armazenado criptografado com AES-256-GCM. Na listagem, não há necessidade de exibir o número completo, e descriptografar N registros em cada page load geraria overhead desnecessário. Só é exibido na tela de detalhe individual (`/pacientes/[id]`), onde uma única descriptografia é justificada.

### Por que `findUnique` foi substituído por `findFirst`?

`findUnique` exige que o campo de busca seja `@unique` ou `@@unique`. Buscar por `{ id, clinicaId }` em conjunto não constitui um constraint único no schema, então `findFirst` com os dois campos é o padrão correto — e adiciona a proteção de isolamento de tenant.

### Middleware vs. verificação em cada componente

O `middleware.ts` garante a proteção na borda (edge), antes que qualquer componente seja executado. As verificações `getSession()` nos Server Components são uma segunda camada de defesa (defense in depth), não a única.
