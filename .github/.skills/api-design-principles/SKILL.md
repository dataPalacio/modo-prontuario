---
name: api-design-principles
description: Princípios RESTful para rotas, status HTTP, paginação, versionamento e contratos de API no projeto HOF.
argument-hint: "Descreva a rota, contrato ou padrao de API que precisa ser criado ou revisado."
---

# API Design Principles

## Origem

- Repositório: `wshobson/agents`
- Popularidade: `#188 global (11.8K installs)`
- Tipo: `API · Design`

## Descrição

Princípios RESTful: nomenclatura de rotas, uso correto de status HTTP, paginação, versionamento, tratamento de erros e documentação de contratos.

## Instalação

```bash
npx skills add wshobson/agents/api-design-principles
```

## Aplicação no Projeto HOF

### Nomenclatura de rotas HOF

```text
GET    /api/pacientes                -> listar com paginação
POST   /api/pacientes                -> criar
GET    /api/pacientes/[id]           -> buscar por ID
PUT    /api/pacientes/[id]           -> atualizar
DELETE /api/pacientes/[id]           -> soft delete (deletedAt)

GET    /api/prontuarios              -> listar
POST   /api/prontuarios              -> criar
POST   /api/prontuarios/[id]/assinar -> assinar (ação específica)
```

### Status HTTP obrigatórios

```text
200 OK           -> GET bem-sucedido
201 Created      -> POST bem-sucedido
400 Bad Request  -> Erro de validação Zod
401 Unauthorized -> Sem sessão válida
403 Forbidden    -> Role sem permissão
404 Not Found    -> Recurso não existe ou deletedAt não nulo
500 Server Error -> Erro interno
```

### Resposta padronizada

```typescript
{ data: T[], total: number, page: number, pageSize: number, totalPages: number }
{ data: T }
{ error: string }
```

## Agentes que usam esta skill

- Backend Prisma
- Arquiteto HOF