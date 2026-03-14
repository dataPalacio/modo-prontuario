# Arquitetura do Sistema — Prontuário HOF

## Visão Geral

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENTE (Browser)                      │
│         Next.js 14 · Tailwind · CSS Premium · Zustand       │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼────────────────────────────────────┐
│                   VERCEL (Edge Network)                     │
│              Next.js App Router + API Routes                │
│         NextAuth.js · Prisma Client · Zod Validators        │
└──────┬──────────────┬───────────────────┬───────────────────┘
       │              │                   │
┌──────▼──────┐ ┌─────▼──────┐ ┌─────────▼──────┐
│  Neon.tech  │ │Uploadthing │ │   Resend.com   │
│ PostgreSQL  │ │  (Fotos)   │ │    (Email)     │
│  Serverless │ │            │ │                │
└─────────────┘ └────────────┘ └────────────────┘
```

## Stack Detalhada

### Frontend
- **Next.js 14** (App Router) — Server Components + SSR
- **TypeScript** — Tipagem estática
- **CSS customizado** — Paleta clínico-premium HOF
- **Zustand** — Estado global leve
- **React Hook Form + Zod** — Formulários com validação

### Backend
- **Next.js API Routes** — Serverless
- **NextAuth.js v5** — JWT com 8h de expiração
- **Prisma ORM** — Queries type-safe
- **Zod** — Validação compartilhada front/back

### Banco de Dados
- **Neon.tech** (PostgreSQL serverless) — Free: 512MB

### Segurança
- Criptografia AES-256-GCM para CPF e dados sensíveis
- JWT com rotação e rate limiting
- Row-Level Security via middleware (multi-tenant)
- Audit Log em todas as operações sobre prontuários
- Soft delete — prontuários nunca são deletados fisicamente (20 anos)

## Decisões Arquiteturais

| Decisão | Justificativa |
|---------|--------------|
| Prisma + Neon.tech | Type-safety + serverless PostgreSQL gratuito |
| NextAuth v5 + JWT | Sessões stateless, sem overhead de DB para auth |
| Zod compartilhado | Mesma validação no front e back, DRY |
| Zustand | Mais leve que Redux, API simples |
| CSS customizado | Paleta clínica específica, controle total do design |
| Soft delete | Requisito legal CFM (20 anos de retenção) |
