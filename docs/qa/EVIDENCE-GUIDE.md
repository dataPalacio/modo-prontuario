# Guia de Coleta de Evidências — Prontuário HOF

## Quando Coletar

Sempre que um teste falhar — manual ou automatizado — colete evidências **imediatamente**, antes de fechar ou recarregar a página.

---

## 1. Screenshot

### Chrome / Edge
- **Windows:** `Win + Shift + S` (recorte) ou `PrtScn` (tela inteira)
- **Extensão recomendada:** [GoFullPage](https://chrome.google.com/webstore/detail/gofullpage-full-page-scre/fdpohaocaechamamjfhhcgjobfglohcf) — captura a página inteira, incluindo partes fora da tela

### DevTools Screenshot
1. Abra DevTools (`F12`)
2. `Ctrl + Shift + P` → digite "screenshot"
3. Selecione "Capture full size screenshot"

---

## 2. Console Logs

### Exportar erros do console
1. Abra DevTools → aba **Console**
2. Filtre por "Errors" (ícone de círculo vermelho)
3. Clique com botão direito em qualquer mensagem → **"Save as..."**
4. Ou selecione tudo (`Ctrl + A`) e copie para um arquivo `.txt`

### O que buscar
- Mensagens vermelhas (erros JavaScript)
- Mensagens com `TypeError`, `ReferenceError`, `Failed to fetch`
- Avisos de `Unhandled Promise Rejection`
- Erros relacionados a `auth`, `prisma`, `API`

---

## 3. Network (HAR)

O arquivo HAR contém todas as requisições HTTP — essencial para diagnosticar problemas de API.

### Exportar HAR
1. Abra DevTools → aba **Network**
2. Ative a gravação (círculo vermelho deve estar ativo)
3. **Marque "Preserve log"** para não perder registros ao navegar
4. Reproduza o erro
5. Clique com botão direito em qualquer requisição → **"Save all as HAR with content"**
6. Salve com a nomenclatura padrão

### Como filtrar no HAR
- Use a barra de filtro: `status-code:4xx` ou `status-code:5xx`
- Ou abra o `.har` em [HAR Analyzer](https://toolbox.googleapps.com/apps/har_analyzer/)

### O que buscar
- Requisições com status `401`, `403`, `404`, `500`, `502`, `503`
- Tempo de resposta acima de 5s (possível timeout de banco)
- Requisições bloqueadas por CSP (aparece como `ERR_BLOCKED_BY_CSP`)

---

## 4. Vídeo Curto

Para fluxos complexos (multi-step), grave um vídeo curto mostrando cada passo até a falha.

**Ferramentas gratuitas:**
- **ShareX** (Windows) — atalho configurável, salva localmente
- **Loom** — compartilhamento fácil via link
- **OBS Studio** — para gravações mais longas

**Duração recomendada:** máximo 2 minutos. Fale o que está fazendo em cada passo.

---

## 5. Informações Obrigatórias em Qualquer Falha

Inclua SEMPRE:

```
Data/hora: YYYY-MM-DD HH:MM (ex.: 2026-03-22 14:35)
Ambiente: staging / local
URL: https://...
Navegador: Chrome 125.0.6422.60 (ou similar)
Ação realizada: "Cliquei em 'Entrar' após preencher o formulário de login"
Resultado esperado: Redirecionamento para /dashboard
Resultado obtido: Permanece em /login com mensagem X
```

---

## 6. Padrão de Nomenclatura de Arquivos

```
YYYY-MM-DD_HH-MM_area_descricao-curta.extensao
```

**Exemplos:**
```
2026-03-22_14-30_login_erro-credenciais-invalidas.png
2026-03-22_14-35_dashboard_stats-nao-carregam.har
2026-03-22_15-00_prontuario_formulario-etapa2-travado.mp4
2026-03-22_15-10_pacientes_busca-cpf-retorna-500.txt
```

**Áreas:** `login`, `dashboard`, `pacientes`, `prontuarios`, `agenda`, `configuracoes`

---

## 7. Informações Sensíveis — O Que NÃO Incluir

- **Nunca** inclua senhas em screenshots, vídeos ou HAR
- **Nunca** exporte HAR de sessão de produção com dados reais de pacientes (CPF, nome completo)
- Se o HAR contiver dados sensíveis, use o filtro do DevTools antes de exportar
- Máscare CPFs em screenshots: `XXX.XXX.XXX-XX`

---

## 8. Onde Armazenar as Evidências

**Localmente durante o teste:**
```
evidencias/
└── YYYY-MM-DD/
    ├── TC-AUTH-01_pass.png
    ├── TC-DASH-02_fail.png
    └── TC-DASH-02_fail.har
```

**Relatório de execução:** Adicione os links para os arquivos no [modelo de banco de registros](./TEST-RECORDS-TEMPLATE.md).

**Playwright (automatizado):** Screenshots e traces são salvos automaticamente em `test-results/artifacts/` quando um teste falha.
