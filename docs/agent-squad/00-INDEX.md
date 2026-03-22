# 📋 Índice dos Agentes — HOF Agent Squad

## Lista de agentes

1. [arquiteto-hof.agent.md](../../.github/agents/arquiteto-hof.agent.md)
  Papel: Orquestrador lead
  ID: `agent-arch`
  Posição no pipeline: primeiro

2. [frontend-kaio.agent.md](../../.github/agents/frontend-kaio.agent.md)
  Papel: UI, React e CSS HOF
  ID: `agent-front`
  Posição no pipeline: especialista de frontend

3. [backend-prisma.agent.md](../../.github/agents/backend-prisma.agent.md)
  Papel: API, Prisma e autenticação
  ID: `agent-back`
  Posição no pipeline: especialista de backend

4. [lgpd-guardian.agent.md](../../.github/agents/lgpd-guardian.agent.md)
  Papel: Compliance, CFM, ANVISA e LGPD
  ID: `agent-legal`
  Posição no pipeline: obrigatório em dados sensíveis

5. [docs-writer.agent.md](../../.github/agents/docs-writer.agent.md)
  Papel: Documentação, ADR e changelog
  ID: `agent-docs`
  Posição no pipeline: documentação e releases

6. [code-reviewer.agent.md](../../.github/agents/code-reviewer.agent.md)
  Papel: QA, checklist e revisão final
  ID: `agent-review`
  Posição no pipeline: sempre por último

## Fluxo de delegação

```text
Arquiteto HOF
  ├── Frontend Kaio
  ├── Backend Prisma
  ├── LGPD Guardian
  ├── Docs Writer
  └── Code Reviewer
```
