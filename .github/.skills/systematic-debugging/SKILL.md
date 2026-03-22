---
name: systematic-debugging
description: "Debug issues systematically. Use for reproducing bugs, isolating causes, testing hypotheses and documenting fixes."
argument-hint: "Descreva o bug, sintomas observados e onde ele acontece."
---

# Systematic Debugging

## Origem

- Repositório: `obra/superpowers`
- Popularidade: `#74 global (35.8K installs)`
- Tipo: `Debugging · Análise`

## Descrição

Metodologia estruturada para debugging: reprodução do bug, isolamento, hipótese, verificação e documentação da correção.

## Instalação

```bash
npx skills add obra/superpowers/systematic-debugging
```

## Aplicação no Projeto HOF

### Processo HOF de Debugging

```text
1. REPRODUZIR: confirmar que o bug ocorre de forma consistente
2. ISOLAR: reduzir ao mínimo necessário para reproduzir
3. HIPÓTESE: levantar a causa mais provável
4. VERIFICAR: testar a hipótese com a menor mudança possível
5. DOCUMENTAR: descrever o bug e a correção no PR
```

### Erros comuns no projeto HOF

```text
Cannot read properties of undefined (reading 'clinicaId')
-> session não verificada antes de acessar session.user

PrismaClientKnownRequestError: Record not found
-> deletedAt não sendo filtrado

ZodError: Required field missing
-> Schema Zod mais restrito que o formulário frontend
```

## Agentes que usam esta skill

- Code Reviewer