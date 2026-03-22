---
applyTo: "**"
---

# Agent Skill Priority Map — modo-prontuario

Este arquivo complementa [copilot-instructions.instructions.md](./copilot-instructions.instructions.md) com um mapeamento explícito entre agents e as skills que devem ser priorizadas.

## Regras gerais

1. Esta instrução é complementar. Se o próprio arquivo `.agent.md` já declarar skills integradas ou regras mais específicas, o `.agent.md` prevalece.
2. Ao trabalhar em uma tarefa claramente alinhada a um agent existente, priorize primeiro as skills listadas para esse agent antes de recorrer a skills mais genéricas.
3. Quando uma tarefa envolver risco regulatório, dados clínicos, consentimento, retenção, rastreabilidade ou auditoria, priorize sempre `legal-compliance` e, quando houver implementação técnica, combine com `security-best-practices` e `backend`.
4. Quando uma tarefa misturar múltiplas áreas, siga a ordem: skill específica do agent, skill estrutural da área, skill de revisão/teste, skill de documentação.

## Mapa explícito por agent

### `arquiteto-hof`

Prioridade de skills:

1. `next-best-practices`
2. `api-design-principles`
3. `requesting-code-review`
4. `git-commit`

Usar quando:

- decompor tarefas multiárea,
- decidir entre frontend, backend, compliance e documentação,
- orientar estrutura de solução antes de implementação,
- preparar handoff para revisão final.

### `frontend-kaio`

Prioridade de skills:

1. `frontend-design`
2. `next-best-practices`
3. `frontend`

Usar quando:

- criar ou refinar páginas e componentes React,
- revisar layout, fluxo visual e design system HOF,
- decidir entre Server Component e Client Component,
- implementar formulários e UX do modo consultório.

### `backend-prisma`

Prioridade de skills:

1. `backend`
2. `database-schema-design`
3. `supabase-postgres-best-practices`
4. `api-design-principles`
5. `security-best-practices`
6. `next-best-practices`

Usar quando:

- modelar schema Prisma e migrations,
- criar API Routes, Server Actions e validações,
- revisar multi-tenant, soft delete e persistência,
- tratar performance, pooling e conexão com Supabase.

### `lgpd-guardian`

Prioridade de skills:

1. `legal-compliance`
2. `security-best-practices`
3. `backend`

Usar quando:

- validar LGPD, CFM, CFO, CFBM e ANVISA,
- revisar retenção, TCLE, rastreabilidade e auditoria,
- avaliar proteção de dados sensíveis,
- apontar requisitos técnicos mínimos para conformidade.

### `docs-writer`

Prioridade de skills:

1. `documentation`
2. `technical-writing`
3. `changelog-maintenance`
4. `git-commit`

Usar quando:

- escrever ou revisar README, setup, arquitetura e docs técnicas,
- documentar mudanças estruturais e fluxos críticos,
- manter changelog e notas de release,
- gerar mensagens de commit e textos de apoio ao PR.

### `code-reviewer`

Prioridade de skills:

1. `requesting-code-review`
2. `systematic-debugging`
3. `test-driven-development`
4. `legal-compliance`

Usar quando:

- revisar código com foco em bugs, regressões e riscos,
- preparar checklist de validação final,
- identificar lacunas de teste,
- checar impactos de conformidade em mudanças sensíveis.

### `anamnese`

Prioridade de skills:

1. `legal-compliance`
2. `documentation`

Usar quando:

- orientar coleta estruturada de anamnese,
- preservar campos obrigatórios e dados clinicamente relevantes,
- evitar omissão de informações críticas do prontuário.

### `tcle`

Prioridade de skills:

1. `legal-compliance`
2. `technical-writing`
3. `documentation`

Usar quando:

- gerar ou revisar TCLE,
- preservar linguagem clara sem perder conteúdo regulatório,
- manter riscos, benefícios, alternativas e rastreabilidade documental.

### `report`

Prioridade de skills:

1. `documentation`
2. `technical-writing`
3. `legal-compliance`

Usar quando:

- gerar relatórios clínicos estruturados,
- organizar sumários, timelines e consolidação documental,
- manter linguagem técnica clara e aderente ao contexto clínico.

## Regras de combinação rápida

- Feature de UI com impacto regulatório: `frontend-design` + `next-best-practices` + `legal-compliance`.
- Nova mutation em dado clínico: `backend` + `security-best-practices` + `legal-compliance`.
- Mudança de schema com impacto documental: `database-schema-design` + `documentation` + `changelog-maintenance`.
- Revisão final de feature sensível: `requesting-code-review` + `systematic-debugging` + `legal-compliance` + `test-driven-development`.