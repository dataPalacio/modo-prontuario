---
name: supabase-postgres-best-practices
description: "Tune Supabase and PostgreSQL usage. Use for pooling, connection strings, indexes, query performance and operational setup."
argument-hint: "Descreva o problema de conexao, performance ou configuracao de banco."
---

# Supabase Postgres Best Practices

## Origem

- Repositório: `supabase/agent-skills`
- Popularidade: `#69 global (42.4K installs)`
- Tipo: `Banco de dados · Integração`

## Descrição

Melhores práticas para uso de Supabase com PostgreSQL: connection pooling via pgBouncer, RLS, queries eficientes e índices.

## Instalação

```bash
npx skills add supabase/agent-skills/supabase-postgres-best-practices
```

## Aplicação no Projeto HOF

### Configuração de conexão obrigatória

```env
DATABASE_URL="postgresql://[user]:[pw]@[host]:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://[user]:[pw]@[host]:5432/postgres"
```

### Índices recomendados para o schema HOF

```sql
CREATE INDEX idx_prontuario_clinicaid_deletedat ON "Prontuario"("clinicaId", "deletedAt");
CREATE INDEX idx_paciente_clinicaid_deletedat ON "Paciente"("clinicaId", "deletedAt");
CREATE INDEX idx_procedimento_lote ON "Procedimento"("lote");
```

### Quando acionar

- Performance lenta em queries de listagem
- Configuração de nova instância Supabase
- Design de índices para novos campos frequentemente filtrados

## Agentes que usam esta skill

- Backend Prisma