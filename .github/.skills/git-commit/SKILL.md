---
name: git-commit
description: "Generate Conventional Commit messages for HOF work. Use for commit title, scope, type and concise change summary."
argument-hint: "Resuma a mudanca para gerar uma mensagem de commit adequada."
---

# Git Commit

## Origem

- Repositório: `github/awesome-copilot`
- Popularidade: `#151 global (16.3K installs)`
- Tipo: `Git · Automação`

## Descrição

Geração de mensagens de commit no padrão Conventional Commits: tipo, escopo, descrição imperativa e corpo opcional.

## Instalação

```bash
npx skills add github/awesome-copilot/git-commit
```

## Aplicação no Projeto HOF

### Tipos disponíveis no HOF

```text
feat     -> nova funcionalidade
fix      -> correção de bug
docs     -> apenas documentação
refactor -> refatoração sem mudança de comportamento
style    -> formatação, CSS
test     -> testes
chore    -> build, deps, configs
security -> correção de segurança / LGPD
legal    -> conformidade CFM/ANVISA/LGPD
```

### Escopos HOF

```text
prontuario | paciente | procedimento | agenda | fotos
auth | lgpd | api | ui | docs | config | seed
```

### Exemplos reais HOF

```text
feat(prontuario): adicionar hash SHA-256 ao assinar prontuário
fix(auth): corrigir expiração JWT para 8h
docs(setup): atualizar guia Supabase connection pooler
security(lgpd): criptografar CPF com AES-256-GCM
legal(cfm): campo lote obrigatório em Procedimento
```

## Agentes que usam esta skill

- Docs Writer
- Arquiteto HOF