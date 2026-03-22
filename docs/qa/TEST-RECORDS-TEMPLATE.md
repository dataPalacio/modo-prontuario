# Banco de Registros de Testes — Prontuário HOF

## Modelo de Dados

Utilize este modelo em uma planilha (Google Sheets, Excel), Notion, Airtable, ou banco SQL.

### Campos do Registro de Execução

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | String | Identificador único (ex.: `RUN-2026-001`) |
| `data_execucao` | DateTime | Data e hora da execução |
| `ambiente` | Enum | `staging` / `local` / `producao` |
| `build_commit` | String | Hash do commit ou tag de versão (ex.: `c355d1a`) |
| `executor` | String | Nome ou e-mail de quem executou |
| `tipo` | Enum | `manual` / `automatizado` |
| `area` | Enum | `auth` / `dashboard` / `pacientes` / `prontuarios` / `geral` |
| `caso_teste_id` | String | ID do caso (ex.: `TC-AUTH-01`, `auth.spec.ts#L12`) |
| `passou` | Boolean | `true` / `false` |
| `evidencias_links` | String | Links ou caminhos para screenshots, HAR, vídeo |
| `bug_id` | String | ID do bug no tracker (ex.: `BUG-042`) — preencher se falhou |
| `descricao_falha` | String | Descrição objetiva do que falhou |
| `passos_reproducao` | Text | Passo a passo para reproduzir |
| `resultado_esperado` | String | O que deveria acontecer |
| `resultado_obtido` | String | O que aconteceu na prática |
| `severidade` | Enum | `bloqueador` / `alta` / `media` / `baixa` |
| `prioridade` | Enum | `p1` / `p2` / `p3` / `p4` |
| `causa_raiz` | String | Causa técnica identificada (preencher após triage) |
| `correcao_aplicada` | String | Descrição da correção implementada |
| `pr_link` | URL | Link para o Pull Request da correção |
| `data_correcao` | Date | Data em que a correção foi mergeada |
| `status_regressao` | Enum | `pendente` / `passou` / `falhou` / `n/a` |

---

## Template SQL (PostgreSQL)

```sql
CREATE TABLE test_records (
    id                 TEXT PRIMARY KEY,
    data_execucao      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ambiente           TEXT CHECK (ambiente IN ('staging', 'local', 'producao')),
    build_commit       TEXT,
    executor           TEXT NOT NULL,
    tipo               TEXT CHECK (tipo IN ('manual', 'automatizado')),
    area               TEXT CHECK (area IN ('auth', 'dashboard', 'pacientes', 'prontuarios', 'geral')),
    caso_teste_id      TEXT NOT NULL,
    passou             BOOLEAN NOT NULL,
    evidencias_links   TEXT,
    bug_id             TEXT,
    descricao_falha    TEXT,
    passos_reproducao  TEXT,
    resultado_esperado TEXT,
    resultado_obtido   TEXT,
    severidade         TEXT CHECK (severidade IN ('bloqueador', 'alta', 'media', 'baixa')),
    prioridade         TEXT CHECK (prioridade IN ('p1', 'p2', 'p3', 'p4')),
    causa_raiz         TEXT,
    correcao_aplicada  TEXT,
    pr_link            TEXT,
    data_correcao      DATE,
    status_regressao   TEXT CHECK (status_regressao IN ('pendente', 'passou', 'falhou', 'n/a'))
        DEFAULT 'n/a'
);
```

---

## Exemplos Preenchidos

### Registro 1 — Falha bloqueadora: login não redireciona

```
id:                 RUN-2026-001
data_execucao:      2026-03-22 10:15
ambiente:           staging
build_commit:       c355d1a
executor:           ana@clinicapremium.com.br
tipo:               manual
area:               auth
caso_teste_id:      TC-AUTH-01
passou:             false
evidencias_links:   evidencias/2026-03-22/TC-AUTH-01_fail.png, evidencias/2026-03-22/TC-AUTH-01_fail.har
bug_id:             BUG-001
descricao_falha:    Após clicar em "Entrar" com credenciais válidas, a página retorna erro
                    "Erro de conexão. Tente novamente em instantes." e permanece em /login.
passos_reproducao:  1. Acesse /login?callbackUrl=%2Fdashboard
                    2. Preencha carlos@clinicapremium.com.br e senha correta
                    3. Clique em "Entrar"
resultado_esperado: Redirecionamento para /dashboard em até 5s
resultado_obtido:   Mensagem de erro exibida, permanece em /login
severidade:         bloqueador
prioridade:         p1
causa_raiz:         DATABASE_URL inválida na variável de ambiente do Vercel staging —
                    prisma não conseguia conectar, authorize() lançou exception
correcao_aplicada:  Atualizar DATABASE_URL no painel do Vercel para apontar para
                    o pool de conexões correto do Supabase
pr_link:            https://github.com/org/modo-prontuario/pull/47
data_correcao:      2026-03-22
status_regressao:   passou
```

---

### Registro 2 — Falha alta: stats do dashboard retornam 500

```
id:                 RUN-2026-002
data_execucao:      2026-03-22 11:00
ambiente:           staging
build_commit:       c355d1a
executor:           playwright (CI automatizado)
tipo:               automatizado
area:               dashboard
caso_teste_id:      dashboard.spec.ts — "stats do dashboard são exibidas"
passou:             false
evidencias_links:   playwright-report/index.html, test-results/artifacts/dashboard-stats/screenshot.png
bug_id:             BUG-002
descricao_falha:    API /api/dashboard/stats retorna status 500 com mensagem
                    "Internal Server Error" — os cards de estatísticas ficam em skeleton infinito.
passos_reproducao:  1. Fazer login
                    2. Acessar /dashboard
                    3. Aguardar 15s — cards nunca aparecem
                    4. Network: GET /api/dashboard/stats → 500
resultado_esperado: Cards exibem valores numéricos em até 5s
resultado_obtido:   Cards ficam em estado de skeleton, console exibe "Failed to fetch"
severidade:         alta
prioridade:         p2
causa_raiz:         Query Prisma em /api/dashboard/stats usando campo `consultasHoje`
                    que não existe no schema atual — prisma lançou PrismaClientValidationError
correcao_aplicada:  Remover campo inexistente da query, usar contagem de agendamentos
                    do dia com filtro de dataHora
pr_link:            https://github.com/org/modo-prontuario/pull/48
data_correcao:      2026-03-23
status_regressao:   passou
```

---

### Registro 3 — Teste passou: filtro de status de prontuários

```
id:                 RUN-2026-003
data_execucao:      2026-03-23 09:30
ambiente:           staging
build_commit:       a8f921b
executor:           playwright (CI automatizado)
tipo:               automatizado
area:               prontuarios
caso_teste_id:      prontuarios.spec.ts — "filtro por status ABERTO atualiza URL"
passou:             true
evidencias_links:   playwright-report/index.html
bug_id:             (vazio)
descricao_falha:    (vazio)
passos_reproducao:  (vazio — não aplicável para testes que passaram)
resultado_esperado: URL inclui status=ABERTO, tabela exibe apenas prontuários abertos
resultado_obtido:   Conforme esperado
severidade:         (vazio)
prioridade:         (vazio)
causa_raiz:         (vazio)
correcao_aplicada:  (vazio)
pr_link:            (vazio)
data_correcao:      (vazio)
status_regressao:   n/a
```

---

## Fluxo de Trabalho Recomendado

```
DESCOBERTA → TRIAGE → CORREÇÃO → REGRESSÃO → FECHAMENTO
```

### 1. Descoberta
- Teste falha (manual ou automatizado)
- Coletar evidências imediatamente (screenshot, HAR, console)
- Criar registro com campos básicos preenchidos (`passou: false`, `descricao_falha`, `evidencias_links`)

### 2. Triage
- Classificar `severidade` e `prioridade`
- Identificar `causa_raiz` (investigação técnica)
- Atribuir responsável pela correção
- Gerar `bug_id` no tracker (GitHub Issues, Linear, Jira, etc.)

### 3. Correção
- Desenvolvedor implementa a correção
- PR aberto com link para o `bug_id`
- Preencher `pr_link`, `correcao_aplicada`

### 4. Regressão
- Após merge do PR, reexecutar o caso de teste que falhou
- Atualizar `status_regressao`: `passou` ou `falhou`
- Se `falhou`: retornar para Triage

### 5. Fechamento
- `status_regressao: passou` → fechar o bug no tracker
- Preencher `data_correcao`
- Adicionar o caso ao próximo ciclo de smoke test

---

## Métricas para Acompanhar

| Métrica | Como Calcular | Meta |
|---|---|---|
| **Taxa de falha por área** | `falhas_area / total_testes_area × 100` | < 5% por área |
| **Top causas raiz** | Agrupar por `causa_raiz`, contar ocorrências | Top 3 devem ter plano de ação |
| **MTTR** (Mean Time to Restore) | `data_correcao - data_execucao` (em horas) | < 24h para bloqueadores |
| **Recorrência de bugs** | Bugs que reabrem após `status_regressao: passou` | 0 reincidências em P1 |
| **Cobertura de casos** | `casos_executados / casos_totais × 100` | > 90% em cada ciclo |
| **Flakiness rate** | Testes que falham e depois passam sem mudança de código | < 2% da suíte |

### Exemplo de Dashboard de Métricas (Google Sheets)

Crie abas com:
1. **Execuções:** tabela principal com todos os registros
2. **Por área:** `=COUNTIF(area, "dashboard")` para cada área
3. **MTTR:** `=AVERAGEIF(passou, FALSE, data_correcao - data_execucao)`
4. **Tendência:** gráfico de linha com taxa de falha por sprint/semana
