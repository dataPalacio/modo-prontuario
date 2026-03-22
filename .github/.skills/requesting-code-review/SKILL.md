---
name: requesting-code-review
description: "Prepare code review requests. Use for PR context, review checklist, testing notes, risks and reviewer guidance."
argument-hint: "Informe a feature ou PR e os pontos que precisam de revisao."
---

# Requesting Code Review

## Origem

- Repositório: `obra/superpowers`
- Popularidade: `#88 global (27.8K installs)`
- Tipo: `Colaboração · Qualidade`

## Descrição

Como preparar e solicitar code reviews eficazes: contexto do PR, checklist de auto-revisão, separação de concerns e descrição clara das mudanças.

## Instalação

```bash
npx skills add obra/superpowers/requesting-code-review
```

## Template de PR HOF

```markdown
## feat(escopo): título da feature

### O que foi feito
- Breve descrição da mudança
- Impacto em outras partes do sistema

### Como testar
1. npm run dev
2. Navegar para /[rota]
3. Validar o resultado esperado

### Compliance LGPD
- Multi-tenant verificado
- Soft delete usado
- Audit log implementado
- CPF não exposto em texto claro

### Design System HOF
- Variáveis CSS usadas
- Empty state implementado
- animate-fade-in na main-content
```

## Agentes que usam esta skill

- Code Reviewer
- Arquiteto HOF