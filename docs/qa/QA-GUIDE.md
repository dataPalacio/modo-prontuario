# QA Guide — Prontuário HOF

## Visão Geral

Este guia cobre a infraestrutura de testes do sistema **Prontuário HOF**, um prontuário digital para Harmonização Orofacial. Os testes garantem a estabilidade das áreas principais — **Dashboard**, **Pacientes** e **Prontuários** — em ambiente de homologação (staging).

**Ambiente staging:** `https://modo-prontuario-htt1ojxj4-gfpalacioeng-7351s-projects.vercel.app`

---

## Escopo de Cobertura

| Área                              | E2E Automatizado    | Manual              |
| ---------------------------------- | ------------------- | ------------------- |
| Login / Autenticação             | ✅                  | ✅                  |
| Proteção de rotas (redirect)     | ✅                  | ✅                  |
| Dashboard (stats, navegação)     | ✅                  | ✅                  |
| Listagem de Pacientes              | ✅                  | ✅                  |
| Busca / Filtro de Pacientes        | ✅                  | ✅                  |
| Formulário de Novo Paciente       | ✅ (estrutura)      | ✅ (fluxo completo) |
| Listagem de Prontuários           | ✅                  | ✅                  |
| Filtros de Status                  | ✅                  | ✅                  |
| Detalhe do Prontuário             | ✅ (estrutura)      | ✅                  |
| Multi-step (criação prontuário) | ✅ (etapa 1)        | ✅                  |
| Assinatura digital                 | ❌ (fora de escopo) | ✅                  |
| LGPD / TCLE                        | ❌                  | ✅                  |

---

## Tecnologias

- **Framework E2E:** Playwright `^1.58.2`
- **Linguagem:** TypeScript
- **Relatórios:** HTML (Playwright) + JUnit XML (CI)
- **Gerenciador de credenciais:** variáveis de ambiente (`.env.test`)

---

## Estrutura de Pastas

```
tests/
├── playwright.config.ts     # Configuração geral
├── fixtures/
│   └── auth.fixture.ts      # Fixture de página autenticada
├── helpers/
│   ├── login.helper.ts      # Login via UI + storageState
│   └── network.helper.ts    # Interceptação de erros de rede/console
├── specs/
│   ├── auth.setup.ts        # Setup: login + salva storageState
│   ├── auth.spec.ts         # Testes de autenticação
│   ├── dashboard.spec.ts    # Testes do dashboard
│   ├── pacientes.spec.ts    # Testes de pacientes
│   └── prontuarios.spec.ts  # Testes de prontuários
└── storage/
    └── auth.json            # Sessão salva (gitignored)
```

---

## Como Rodar Localmente

### 1. Pré-requisitos

```bash
npm install
npx playwright install chromium
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.test.example .env.test
# Edite .env.test e preencha TEST_PASSWORD
```

`.env.test`:

```env
BASE_URL=https://modo-prontuario-htt1ojxj4-gfpalacioeng-7351s-projects.vercel.app
TEST_EMAIL=carlos@clinicapremium.com.br
TEST_PASSWORD=SUA_SENHA_AQUI
```

### 3. Executar

```bash
# Todos os testes (headless)
npm run test:e2e

# Com interface visual do Playwright
npm run test:e2e:ui

# Com navegador visível (debug)
npm run test:e2e:headed

# Ver último relatório HTML
npm run test:e2e:report
```

---

## Como Rodar em CI (GitHub Actions)

Adicione ao `.github/workflows/e2e.yml`:

```yaml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e:ci
        env:
          BASE_URL: ${{ secrets.STAGING_URL }}
          TEST_EMAIL: ${{ secrets.TEST_EMAIL }}
          TEST_PASSWORD: ${{ secrets.TEST_PASSWORD }}
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

Secrets necessários no repositório: `STAGING_URL`, `TEST_EMAIL`, `TEST_PASSWORD`.

---

## Como Interpretar Relatórios

### Relatório HTML

Gerado em `playwright-report/index.html`. Abra com `npm run test:e2e:report`.

- **Verde:** teste passou
- **Vermelho:** falhou — clique para ver screenshot, trace e log
- **Amarelo:** retentativa — passou na segunda execução (possível flakiness)

### Trace Viewer

```bash
npx playwright show-trace test-results/artifacts/<nome-do-teste>/trace.zip
```

O trace mostra: timeline de ações, screenshots a cada passo, network requests, console logs.

### JUnit XML

Gerado em `test-results/junit.xml`. Compatível com Jenkins, GitHub Actions, e outras ferramentas de CI.

---

## Convenções de Escrita de Casos

1. **Nome do teste:** verbo no infinitivo + contexto + resultado esperado.

   - Correto: `'filtro por status ABERTO atualiza URL'`
   - Errado: `'test status filter'`
2. **Estrutura:** Arrange → Act → Assert.
3. **Seletores:** prioridade decrescente:

   - `[data-testid="..."]` (preferido)
   - `[aria-label="..."]` ou `[role="..."]`
   - `text=...` para textos visíveis
   - CSS class ou tag HTML (evitar — frágil)
4. **Waits:** sempre usar esperas explícitas:

   - `page.waitForLoadState('networkidle')` após navegação
   - `expect(locator).toBeVisible({ timeout: 10_000 })`
   - Nunca usar `page.waitForTimeout()` (sleep fixo)
5. **Credenciais:** nunca hardcoded. Sempre via `process.env.TEST_EMAIL` / `process.env.TEST_PASSWORD`.
6. **Testes independentes:** cada `test()` deve funcionar sozem, sem depender da execução de outro.

---

## Matriz de Cobertura

| Página               | Cenário                | E2E | Manual |
| --------------------- | ----------------------- | --- | ------ |
| `/login`            | Login válido           | ✅  | ✅     |
| `/login`            | Login inválido         | ✅  | ✅     |
| `/login`            | Exibição de elementos | ✅  | ✅     |
| `/dashboard`        | Carrega sem erros       | ✅  | ✅     |
| `/dashboard`        | Sidebar + Header        | ✅  | ✅     |
| `/dashboard`        | Stats cards             | ✅  | ✅     |
| `/dashboard`        | Navegação             | ✅  | ✅     |
| `/pacientes`        | Listagem                | ✅  | ✅     |
| `/pacientes`        | Busca por nome          | ✅  | ✅     |
| `/pacientes`        | Paginação             | ✅  | ✅     |
| `/pacientes/novo`   | Formulário campos      | ✅  | ✅     |
| `/pacientes/novo`   | Criação completa      | ❌  | ✅     |
| `/pacientes/[id]`   | Detalhe carrega         | ✅  | ✅     |
| `/prontuarios`      | Listagem                | ✅  | ✅     |
| `/prontuarios`      | Filtros de status       | ✅  | ✅     |
| `/prontuarios`      | Busca                   | ✅  | ✅     |
| `/prontuarios/novo` | Etapa 1 carrega         | ✅  | ✅     |
| `/prontuarios/novo` | Fluxo completo          | ❌  | ✅     |
| `/prontuarios/[id]` | Detalhe carrega         | ✅  | ✅     |
| `/prontuarios/[id]` | Assinatura digital      | ❌  | ✅     |

---

## Falhas Comuns e Diagnóstico

| Sintoma                                  | Causa Provável                                 | Solução                                        |
| ---------------------------------------- | ----------------------------------------------- | ------------------------------------------------ |
| Timeout na asserção de URL após login | callbackUrl inválido / CSP bloqueando redirect | Verificar next.config.ts CSP, testar manualmente |
| `TEST_PASSWORD` não definido          | `.env.test` não criado ou não carregado     | Copiar `.env.test.example` e preencher         |
| Sessão expirou (8h)                     | JWT NextAuth expirado                           | Deletar `tests/storage/auth.json` e reexecutar |
| Erro 500 em `/api/dashboard/stats`     | Banco de dados indisponível                    | Verificar Supabase connection, logs Vercel       |
| `data-testid` não encontrado          | Build desatualizado em staging                  | Fazer deploy da branch com as mudanças          |
| Screenshot em branco                     | Navegação ainda em andamento                  | Adicionar `waitForLoadState('networkidle')`    |
