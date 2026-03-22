---
name: next-best-practices
description: "Apply Next.js App Router best practices. Use for Server vs Client Components, layouts, cache, routing and Server Actions."
argument-hint: "Descreva a pagina, layout, action ou duvida de arquitetura Next.js."
---

# Next Best Practices

## Origem

- Repositório: `vercel-labs/next-skills`
- Popularidade: `#72 global (40.0K installs)`
- Tipo: `Framework · Boas práticas`

## Descrição

Padrões recomendados para Next.js App Router: uso correto de Server vs Client Components, cache, streaming, layouts aninhados e Server Actions.

## Instalação

```bash
npx skills add vercel-labs/next-skills/next-best-practices
```

## Aplicação no Projeto HOF

### Quando acionar

- Criação de nova página em `src/app/(dashboard)/`
- Dúvida sobre usar `use client` vs Server Component
- Implementação de Server Action com `revalidatePath`

### Regras HOF derivadas desta skill

```text
Server Component (default): páginas que só leem dados
Client Component ('use client'): formulários, modais, tabs interativas
Server Action ('use server'): mutations (criar, editar, deletar)

Após mutation em Server Action:
  revalidatePath('/rota')
  redirect('/rota/novo-id')
```

## Agentes que usam esta skill

- Frontend Kaio
- Backend Prisma
- Arquiteto HOF