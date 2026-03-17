---
name: hof-vercel
description: >
  Guia completo de deploy, debug e configuração Vercel para o sistema Prontuário HOF (Next.js 14
  App Router). Use SEMPRE que: (1) for fazer deploy ou configurar o projeto no Vercel; (2) houver
  erros de build (module not found, env vars undefined, Prisma generate faltando); (3) for
  configurar variáveis de ambiente por ambiente (dev/preview/production); (4) for debugar
  problemas em produção (Function timeout, 500 errors, cold starts); (5) for configurar domínio
  personalizado, HTTPS ou redirects; (6) for otimizar performance (bundle size, ISR, caching);
  (7) houver divergência entre comportamento local e produção; (8) qualquer tarefa envolvendo
  Vercel CLI, vercel.json, build logs, deployment previews ou monitoramento de produção.
---

# Vercel — Deploy e Debug do Prontuário HOF

## Estrutura de Ambientes

```
Development  → localhost:3000 (.env.local)
Preview      → branch-name.vercel.app (PRs e branches não-main)
Production   → seu-dominio.com.br (branch main)
```

Cada ambiente tem variáveis **independentes** no Vercel Dashboard.

---

## Setup Inicial — Conectar Repositório

### 1. Importar projeto

```bash
# Via CLI (recomendado para times)
npm i -g vercel
vercel login
vercel link  # Conecta projeto existente

# Ou via Dashboard: vercel.com/new → Import Git Repository
```

### 2. Configurações obrigatórias no Dashboard

**Settings → General:**
- Framework Preset: `Next.js` (auto-detectado)
- Root Directory: `.` (raiz do projeto)
- Build Command: `npm run build` (ou `prisma generate && next build`)
- Output Directory: `.next` (padrão Next.js)
- Install Command: `npm install`

> ⚠️ **Prisma gera o client durante o build.** Adicionar ao build command:
> ```
> prisma generate && next build
> ```
> Sem isso, `@prisma/client` não existe e o deploy falha.

---

## Variáveis de Ambiente — Configuração HOF

### Onde configurar

Dashboard → Project → **Settings → Environment Variables**

### Variáveis obrigatórias por ambiente

```env
# ── PRODUCTION ──────────────────────────────────────────────
DATABASE_URL            # Supabase pooler prod (porta 6543)
DIRECT_URL              # Supabase direct prod (porta 5432)
AUTH_SECRET             # openssl rand -base64 32
NEXTAUTH_URL            # https://seu-dominio.com.br
UPLOADTHING_SECRET      # sk_live_...
RESEND_API_KEY          # re_...
NEXT_PUBLIC_SUPABASE_URL          # https://REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY     # eyJ... (chave anônima)
SUPABASE_SERVICE_ROLE_KEY         # eyJ... (⚠️ NÃO adicionar NEXT_PUBLIC_)

# ── PREVIEW (use banco de staging separado) ─────────────────
DATABASE_URL            # Supabase pooler staging
DIRECT_URL              # Supabase direct staging
AUTH_SECRET             # mesmo ou diferente do prod
NEXTAUTH_URL            # https://modo-prontuario-git-main-XXXX.vercel.app
# ... demais variáveis apontando para staging
```

### Regras críticas

| Regra | Detalhe |
|-------|---------|
| `NEXT_PUBLIC_` | Variáveis expostas ao **browser** — nunca colocar secrets aqui |
| Sem `NEXT_PUBLIC_` | Disponível apenas no servidor (Server Components, API Routes) |
| `NEXTAUTH_URL` | **Obrigatório** em produção — URL exata sem trailing slash |
| Build-time vs Runtime | Variables sem `NEXT_PUBLIC_` só são seguras em componentes dinâmicos |

### Sincronizar variáveis localmente

```bash
# Baixar vars de produção para .env.local (desenvolvimento)
vercel env pull .env.local

# Adicionar variável via CLI
vercel env add DATABASE_URL production
vercel env add DATABASE_URL preview
```

---

## Debug — Erros de Build Mais Comuns

### ❌ "Cannot find module '@prisma/client'"

**Causa:** Prisma Client não foi gerado durante o build.

**Solução — build command:**
```
prisma generate && next build
```

No `package.json`:
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

O `postinstall` garante geração do client após `npm install` no Vercel.

---

### ❌ "Environment variable not found: DATABASE_URL"

**Causa:** Variável não configurada no ambiente correto do Vercel.

**Checklist:**
1. Dashboard → Settings → Environment Variables → confirmar que a variável existe
2. Verificar se está marcada para o ambiente correto (Production ✅, Preview ✅, Development ✅)
3. Após adicionar/alterar variáveis → **redeployar** (mudanças não afetam builds anteriores)
4. Variáveis lidas em **build time** (static generation) precisam existir antes do build

```bash
# Verificar variáveis configuradas via CLI
vercel env ls

# Verificar em um deploy específico
vercel logs [deployment-url] --output raw
```

---

### ❌ Build passa mas app retorna 500 em produção

**Passo a passo:**

```bash
# 1. Ver logs de runtime da última produção
vercel logs https://seu-dominio.com.br --output raw

# 2. Ou pelo Dashboard: Deployments → clique no deploy → Functions → clique na função
# 3. Testar build localmente antes do deploy:
npm run build && npm start
```

**Causas mais comuns:**
- `NEXTAUTH_URL` incorreta (http vs https, trailing slash)
- `AUTH_SECRET` diferente entre deploys (sessões invalidadas)
- Query Prisma falhando porque `DATABASE_URL` aponta para banco errado

---

### ❌ "Function Timeout" (max 10s no Vercel Hobby, 60s no Pro)

**Identificar no Dashboard:** Deployments → Functions → ver duração das execuções

**Soluções:**

```typescript
// 1. Aumentar timeout por route (máximo conforme plano)
// src/app/api/relatorios/route.ts
export const maxDuration = 30 // segundos (Pro plan)

// 2. Otimizar queries Prisma — evitar N+1
// ❌ N+1 — query por paciente
const prontuarios = await prisma.prontuario.findMany()
for (const p of prontuarios) {
  const paciente = await prisma.paciente.findUnique({ where: { id: p.pacienteId } })
}

// ✅ Include — 1 query
const prontuarios = await prisma.prontuario.findMany({
  include: { paciente: true }
})

// 3. Paginação obrigatória em listagens grandes
const data = await prisma.paciente.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
})
```

---

### ❌ Divergência local vs produção

**Causas comuns e soluções:**

| Sintoma | Causa | Solução |
|---------|-------|---------|
| Funciona local, 404 em prod | Case sensitivity no nome de arquivo | Renomear arquivo respeitando maiúsculas |
| Auth funciona local, falha em prod | `NEXTAUTH_URL` errada | Usar URL exata de produção |
| Imagens carregam local, não em prod | `next.config.js` sem `domains` | Adicionar domínio Supabase em `images.remotePatterns` |
| Variáveis `undefined` em prod | Variável não adicionada ao Vercel | Configurar no Dashboard + redeploy |

```javascript
// next.config.js — domínios de imagem Supabase
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
  },
}
module.exports = nextConfig
```

---

## Deploy — Fluxo de Trabalho HOF

### Desenvolvimento com Preview Deploys

```bash
# Criar feature branch
git checkout -b feat/nova-funcionalidade

# Desenvolver e commitar
git add . && git commit -m "feat(prontuario): nova funcionalidade"

# Push → Vercel cria preview automaticamente
git push origin feat/nova-funcionalidade

# URL do preview aparece no PR do GitHub (bot Vercel)
# Testar no preview antes de mergear para main

# Merge → Deploy automático em produção
git checkout main && git merge feat/nova-funcionalidade && git push
```

### Forçar redeploy sem mudança de código

```bash
# Via CLI
vercel --prod

# Via Dashboard: Deployments → "..." → Redeploy
```

### Rollback para versão anterior

```bash
# Via Dashboard: Deployments → escolher deploy anterior → "Promote to Production"
# Via CLI:
vercel rollback [deployment-url]
```

---

## Configuração `vercel.json` — HOF

```json
{
  "buildCommand": "prisma generate && next build",
  "framework": "nextjs",
  "regions": ["gru1"],
  "functions": {
    "src/app/api/**": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/",
      "destination": "/dashboard",
      "permanent": false
    }
  ]
}
```

> `"regions": ["gru1"]` → São Paulo (menor latência para clínicas brasileiras)

---

## Domínio Personalizado

```bash
# Adicionar via CLI
vercel domains add seu-dominio.com.br

# Verificar propagação DNS
vercel domains inspect seu-dominio.com.br
```

**DNS no painel do registrador:**
```
Tipo    Host    Valor
CNAME   www     cname.vercel-dns.com
A       @       76.76.21.21
```

Após configurar DNS, atualizar a variável:
```env
NEXTAUTH_URL=https://www.seu-dominio.com.br
```

---

## Performance e Otimização

### Caching de dados clínicos

```typescript
// Dados que mudam raramente → revalidar a cada 5 min
const procedimentos = await fetch('/api/procedimentos', {
  next: { revalidate: 300 }
})

// Dados de prontuário → sempre frescos (dados médicos)
const prontuario = await fetch(`/api/prontuarios/${id}`, {
  cache: 'no-store'
})
```

### Otimizar bundle com imports dinâmicos

```typescript
// Gráficos pesados — carregar apenas no client quando necessário
import dynamic from 'next/dynamic'

const GraficoDashboard = dynamic(
  () => import('@/components/GraficoDashboard'),
  {
    loading: () => <div className="skeleton" />,
    ssr: false,
  }
)
```

### Verificar bundle size

```bash
npm run build
# Verificar output: First Load JS deve ser < 200kB por rota
# Rotas com > 500kB → investigar com:
npx @next/bundle-analyzer
```

---

## Monitoramento em Produção

### Vercel Dashboard — onde olhar

| O que verificar | Local |
|----------------|-------|
| Logs de erro em tempo real | Project → Logs (Realtime) |
| Duração das functions | Deployments → Functions |
| Bandwidth / requests | Project → Analytics |
| Build logs | Deployments → clique no deploy → Build Logs |

### Vercel CLI — comandos úteis

```bash
# Logs de produção em tempo real
vercel logs --follow

# Logs de um deploy específico
vercel logs [deployment-url]

# Status do projeto
vercel inspect

# Listar todos os deploys
vercel ls

# Inspecionar variáveis de ambiente
vercel env ls production
```

---

## Checklist de Deploy HOF

### Antes de ir para produção

- [ ] `npm run build` passa localmente sem erros
- [ ] `prisma generate && next build` no build command do Vercel
- [ ] Todas as variáveis de ambiente configuradas em Production
- [ ] `NEXTAUTH_URL` aponta para o domínio correto (https://)
- [ ] `DATABASE_URL` usa pooler Supabase (porta 6543)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` **sem** prefixo `NEXT_PUBLIC_`
- [ ] Testado no Preview Deploy antes de mergear para main
- [ ] Domínio personalizado configurado (se aplicável)
- [ ] Região configurada para `gru1` (São Paulo) no `vercel.json`

### Após cada deploy

- [ ] Verificar build logs — sem warnings críticos
- [ ] Testar fluxo de login com credenciais de produção
- [ ] Verificar criação de prontuário (operação mais crítica)
- [ ] Checar logs de runtime nas primeiras horas — Vercel → Logs

### Rollback se necessário

```bash
# Via Dashboard: Deployments → deploy anterior → "Promote to Production"
# Demora ~30 segundos, sem downtime
```