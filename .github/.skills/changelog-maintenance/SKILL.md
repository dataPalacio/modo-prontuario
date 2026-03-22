---
name: changelog-maintenance
description: "Maintain changelog entries for releases. Use for Keep a Changelog structure, semantic versioning, release notes and dated change history."
argument-hint: "Informe a versao, data e principais mudancas que devem entrar no changelog."
---

# Changelog Maintenance

## Origem

- Repositório: `supercent-io/skills-template`
- Popularidade: `#236 global (10.7K installs)`
- Tipo: `Documentação · Versionamento`

## Descrição

Manutenção de CHANGELOG no formato Keep a Changelog: categorias Added, Changed, Fixed, Removed e Security, com versionamento semântico e datas ISO.

## Instalação

```bash
npx skills add supercent-io/skills-template/changelog-maintenance
```

## Aplicação no Projeto HOF

### Localização no projeto

```text
modo-prontuario/
└── docs/changelogs/
    └── CHANGELOG.md
```

### Template de entrada HOF

```markdown
## [MAJOR.MINOR.PATCH] - AAAA-MM-DD

### Adicionado
- Feature nova com referência legal quando aplicável (CFM 1.638/2002)

### Alterado
- Comportamento existente modificado

### Corrigido
- Bug corrigido (referência issue #N se houver)

### Removido
- Feature ou código removido

### Segurança
- Vulnerabilidade corrigida ou melhoria de compliance LGPD
```

### Regras de versionamento HOF

```text
MAJOR -> mudança incompatível
MINOR -> nova feature retrocompatível
PATCH -> correção de bug
```

## Agentes que usam esta skill

- Docs Writer