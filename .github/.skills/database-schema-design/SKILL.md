---
name: database-schema-design
description: "Design or review Prisma schema changes. Use for models, relations, indexes, soft delete, migrations and data integrity rules."
argument-hint: "Descreva a entidade, relacao, indice ou migracao que precisa ser modelada."
---

# Database Schema Design

## Origem

- Repositório: `supercent-io/skills-template`
- Popularidade: `#183 global (11.9K installs)`
- Tipo: `Banco de dados · Modelagem`

## Descrição

Princípios de design de schema: normalização, índices, relações, soft delete, timestamps e estratégias de migração segura.

## Instalação

```bash
npx skills add supercent-io/skills-template/database-schema-design
```

## Aplicação no Projeto HOF

### Padrões de schema Prisma HOF

```prisma
model Entidade {
  id        String   @id @default(cuid())
  clinicaId String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  clinica Clinica @relation(fields: [clinicaId], references: [id])

  @@map("entidade")
}
```

### Migration segura

```bash
npx prisma migrate dev --name descricao-da-mudanca
npx prisma migrate deploy --preview-feature
```

### Campos obrigatórios por entidade HOF

```text
Paciente: cpf (encrypted), dataNasc, sexo, deletedAt
Prontuario: numero (único), status, hashIntegridade, deletedAt
Procedimento: lote (ANVISA obrigatório), produto, tipo
AuditLog: acao, entidade, entidadeId, userId, clinicaId, ip
```

## Agentes que usam esta skill

- Backend Prisma