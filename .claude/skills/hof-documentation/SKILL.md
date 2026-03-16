---
name: hof-documentation
description: >
  Padrões, templates e melhores práticas de documentação técnica para o projeto Prontuário HOF.
  Use SEMPRE que for criar ou atualizar qualquer documento do projeto: README, CHANGELOG, guias
  de setup, arquitetura, segurança, deploy, changelogs, ADRs (Architecture Decision Records),
  documentação de API, comentários de código, JSDoc/TSDoc, mensagens de commit, pull request
  descriptions, guias de onboarding para devs ou documentação de conformidade legal.
  Também ativa para tarefas de revisão e refatoração de documentação existente, adição de
  seções ausentes, correção de informações desatualizadas, e padronização de estilo de escrita.
  Inclui templates prontos para uso e checklist de qualidade.
---
# Documentação Técnica — Prontuário HOF

## Princípios Fundamentais

1. **Vá direto ao ponto** — Elimine fluff. Cada parágrafo deve entregar valor imediato.
2. **Escaneabilidade** — Títulos descritivos, listas, negrito em palavras-chave. Não parágrafos de prosa densa.
3. **Exemplos reais** — Código executável, inputs/outputs concretos, não pseudocódigo vago.
4. **Informação viva** — Documentação desatualizada é mais perigosa que ausência de docs. Ao mudar tecnologia, faça grep nas referências residuais.
5. **Zero segredos** — Nunca commit de senhas, tokens, connection strings reais. Use placeholders claros: `<SUA_API_KEY>`, `seu_segredo_aqui`.

---

## Estrutura de Pastas do Projeto

```
modo-prontuario/
├── README.md                    # Porta de entrada do projeto
├── DEPENDENCIES.md              # Como instalar dependências
├── docs/
│   ├── README.md                # Índice da documentação
│   ├── ARCHITECTURE.md          # Visão arquitetural + decisões
│   ├── FEATURES.md              # Funcionalidades e guias de uso
│   ├── SECURITY.md              # Segurança, LGPD e compliance
│   ├── SETUP.md                 # Guia de instalação local
│   ├── DEPLOY_VERCEL.md         # Deploy em produção
│   ├── changelogs/              # Histórico de versões
│   │   └── 001-setup-inicial.md
│   └── database/
│       ├── README.md
│       ├── SUPABASE_SETUP.md
│       └── schema_supabase.sql
├── .skills/                     # Skills de IA para o projeto
│   ├── backend/SKILL.md
│   ├── frontend/SKILL.md
│   ├── documentation/SKILL.md
│   └── legal-compliance/SKILL.md
└── agents/                      # Configurações dos agentes IA
```

---

## Templates por Tipo de Documento

### README.md Raiz

```markdown
<div align="center">
  <h1>🦷 Nome do Projeto</h1>
  <p><strong>Tagline de uma linha</strong></p>
  <p>Badges de tecnologia</p>
</div>

---

## 🚀 Sobre
[2-3 parágrafos concisos do que o sistema faz e para quem]

## 📋 Funcionalidades
- ✅ Feature implementada
- 🚧 Feature em desenvolvimento

## 🚀 Quick Start
```bash
# Passos numerados e executáveis
npm install
cp .env.example .env
npm run db:seed
npm run dev
```

**Acesse:** http://localhost:3000
**Login demo:** email@exemplo.com / senha

## 📁 Estrutura

[Árvore de pastas com comentários]

## ⚖️ Conformidade Legal

[Lista das normas atendidas]

## 📄 Licença

```

---

### CHANGELOG (formato Keep a Changelog)

```markdown
# CHANGELOG

## [X.Y.Z] - AAAA-MM-DD

### Adicionado
- Descrição da feature nova (referência issue #N)

### Alterado
- O que mudou no comportamento existente

### Corrigido
- Bug corrigido (referência issue #N)

### Removido
- O que foi deletado

### Segurança
- Vulnerabilidades corrigidas
```

**Regras de versionamento semântico:**

- `MAJOR` — mudança incompatível com versão anterior
- `MINOR` — nova funcionalidade retrocompatível
- `PATCH` — correção de bug retrocompatível

---

### ADR — Architecture Decision Record

```markdown
# ADR-NNN: Título da Decisão

**Status:** Proposto | Aceito | Depreciado | Substituído por ADR-NNN
**Data:** AAAA-MM-DD
**Decisores:** Nome(s)

## Contexto
O que motivou esta decisão? Qual problema precisava ser resolvido?

## Decisão
O que foi decidido, de forma direta.

## Consequências
### Positivas
- Lista de benefícios

### Negativas / Trade-offs
- Lista de custos e riscos aceitos

## Alternativas Consideradas
| Opção | Prós | Contras | Motivo da rejeição |
|-------|------|---------|-------------------|
```

**Decisões ADR já tomadas no projeto** (exemplos para referência):

- Prisma + Supabase → type-safety + backend-as-a-service gratuito
- NextAuth v5 + JWT → stateless, sem overhead de DB para auth
- Zod compartilhado → mesma validação front e back, DRY
- Soft delete → requisito legal CFM 20 anos de retenção

---

### Documentação de API Route

```markdown
## GET /api/[recurso]

**Descrição:** Lista [recurso] da clínica com paginação.

**Auth:** JWT obrigatório (Bearer token)

**Query Params:**
| Param | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| page | number | 1 | Página atual |
| pageSize | number | 20 | Itens por página |
| search | string | - | Busca por nome |

**Response 200:**
```json
{
  "data": [...],
  "total": 247,
  "page": 1,
  "pageSize": 20,
  "totalPages": 13
}
```

**Erros:**

| Código | Motivo                             |
| ------- | ---------------------------------- |
| 401     | Token ausente ou expirado          |
| 403     | Sem permissão (role insuficiente) |
| 500     | Erro interno — ver logs           |

```

---

### Guia de Setup Local

```markdown
## Pré-requisitos
- Node.js >= 18.x
- npm >= 9.x
- Conta [Supabase](https://supabase.com)

## Passo a Passo

### 1. Clonar
```bash
git clone <repo-url> && cd modo-prontuario
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Variáveis de ambiente

```bash
cp .env.example .env
```

Edite `.env` com suas credenciais (veja comentários no arquivo).

### 4. Banco de dados

```bash
npm run db:generate   # gera Prisma Client
npm run db:push       # cria tabelas
npm run db:seed       # dados de demonstração
```

### 5. Executar

```bash
npm run dev
```

Acesse: http://localhost:3000

## Troubleshooting

**Erro: "Cannot connect to database"**

- Verifique `DATABASE_URL` no `.env`
- Supabase Connection Pooler requer porta `6543` com `?pgbouncer=true`

**Erro: "Invalid credentials"**

- Execute `npm run db:seed` para criar usuário demo
- Credenciais: `carlos@clinicapremium.com.br` / `123456`

```

---

## Convenções de Escrita

### Títulos e Cabeçalhos
```markdown
# H1 — Apenas um por documento (título)
## H2 — Seções principais
### H3 — Subseções
#### H4 — Raramente necessário
```

### Listas

- Use **bullet points** para itens sem ordem definida
- Use **listas numeradas** para passos sequenciais
- Use **tabelas** para comparações, parâmetros de API, variáveis de ambiente

### Blocos de código

- Sempre especifique a linguagem: ` ```typescript `, ` ```bash `, ` ```env `
- Código deve ser **executável** — não pseudocódigo
- Comandos bash devem começar sem `$` para facilitar copiar/colar

### Alertas e Avisos

```markdown
> ⚠️ **Atenção:** Mensagem importante de cuidado

> 💡 **Dica:** Sugestão útil

> 🚨 **Obrigatório:** Requisito legal ou de segurança
```

---

## Comentários de Código (TSDoc)

### Funções utilitárias

```typescript
/**
 * Formata CPF brasileiro no padrão 123.456.789-00
 * @param cpf - String com 11 dígitos numéricos
 * @returns CPF formatado ou string original se inválida
 * @example formatCPF('12345678901') // '123.456.789-01'
 */
export function formatCPF(cpf: string): string { ... }
```

### API Routes

```typescript
/**
 * GET /api/pacientes
 * Lista pacientes da clínica autenticada com suporte a paginação e busca.
 * Requer: JWT válido com clinicaId
 * Compliance: Multi-tenant — sempre filtra por clinicaId da sessão
 */
export async function GET(request: NextRequest) { ... }
```

### Modelos Prisma — comentários no schema

```prisma
model Paciente {
  cpf  String // Criptografado AES-256-GCM — nunca salvar em texto claro
  deletedAt DateTime? @map("deleted_at") // Soft delete — LGPD: retenção 20 anos
}
```

---

## Mensagens de Commit (Conventional Commits)

```
<tipo>(<escopo>): <descrição imperativa, minúsculo, sem ponto final>

[corpo opcional — explica O QUÊ e POR QUÊ, não como]

[rodapé — refs issues, breaking changes]
```

**Tipos:**

| Tipo         | Quando usar                                 |
| ------------ | ------------------------------------------- |
| `feat`     | Nova funcionalidade                         |
| `fix`      | Correção de bug                           |
| `docs`     | Apenas documentação                       |
| `refactor` | Refatoração sem mudança de comportamento |
| `style`    | Formatação, CSS, sem lógica              |
| `test`     | Testes                                      |
| `chore`    | Build, deps, configs                        |
| `security` | Correção de segurança / LGPD             |
| `legal`    | Atualizações de conformidade              |

**Exemplos do projeto:**

```bash
feat(prontuario): adicionar hash de integridade SHA-256 ao assinar
fix(auth): corrigir expiração do JWT para 8h conforme padrão
docs(setup): atualizar guia com configuração Supabase connection pooler
security(lgpd): criptografar CPF com AES-256-GCM antes de persistir
legal(cfm): adicionar campo lote obrigatório em Procedimento (ANVISA)
```

---

## Variáveis de Ambiente — Documentação Padrão

Sempre documentar no `.env.example` com:

```env
# 1. SEÇÃO — Descrição da seção
# ------------------------------------------------------------------------------
# Comentário explicativo da variável
# Como obter: https://link-para-dashboard
VARIAVEL="placeholder_descritivo"

# Variável obrigatória com exemplo de valor esperado
DATABASE_URL="postgresql://usuario:senha@host:6543/banco?pgbouncer=true"
```

**Placeholders seguros para usar:**

- `seu_segredo_aqui` — para secrets genéricos
- `<API_KEY>` — para chaves de API externas
- `[usuario]:[senha]` — para credenciais de acesso
- `seu-projeto-id` — para IDs de projetos cloud

---

## Checklist de Qualidade da Documentação

Antes de fazer commit de qualquer doc, verificar:

**Conteúdo:**

- [ ] Título claro e descritivo (H1 único)
- [ ] Pré-requisitos listados antes do passo a passo
- [ ] Todos os comandos são executáveis (copiados e colados funcionam)
- [ ] Seção Troubleshooting para erros comuns
- [ ] Sem senhas, tokens ou dados reais

**Formatação:**

- [ ] Linguagem especificada em todos os blocos de código
- [ ] Listas numeradas para passos sequenciais
- [ ] Tabelas para comparações e parâmetros
- [ ] Links funcionando (URLs completas)

**Atualização:**

- [ ] Versões de tecnologia refletem o `package.json` atual
- [ ] Referências a Supabase (não Neon.tech ou outro provider antigo)
- [ ] Credenciais demo atualizadas se mudaram

**HOF-específico:**

- [ ] Normas legais citadas com número correto (CFM 1.638/2002, não genérico)
- [ ] Campos obrigatórios por lei identificados com emoji 🚨 ou nota
- [ ] Prazo de retenção de 20 anos mencionado ao falar de exclusão de dados
