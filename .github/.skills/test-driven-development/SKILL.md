---
name: test-driven-development
description: "Plan or write tests with TDD principles. Use for unit tests, schema validation tests, regression coverage and critical flows."
argument-hint: "Informe a funcao, schema ou fluxo que precisa de testes prioritarios."
---

# Test Driven Development

## Origem

- Repositório: `obra/superpowers`
- Popularidade: `#83 global (29.8K installs)`
- Tipo: `Testes · Qualidade`

## Descrição

Metodologia TDD: escrever testes antes da implementação, ciclo red-green-refactor, estratégias de mock e cobertura mínima.

## Instalação

```bash
npx skills add obra/superpowers/test-driven-development
```

## Aplicação no Projeto HOF

### Funções com testes prioritários

```typescript
describe('validarCPF', () => {
  it('valida CPF correto', () => expect(validarCPF('529.982.247-25')).toBe(true))
})

describe('gerarNumeroProntuario', () => {
  it('gera formato correto', () => {
    expect(gerarNumeroProntuario(1)).toBe(`P-${new Date().getFullYear()}-0001`)
  })
})
```

### Schemas Zod com testes

```typescript
describe('pacienteSchema', () => {
  it('rejeita CPF inválido', () => {
    expect(() => pacienteSchema.parse({ ...valid, cpf: '123' })).toThrow()
  })
})
```

## Agentes que usam esta skill

- Code Reviewer