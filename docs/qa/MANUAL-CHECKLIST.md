# Checklist de Testes Manuais — Prontuário HOF

**Versão:** 1.0
**Ambiente:** Staging
**URL base:** `https://modo-prontuario-htt1ojxj4-gfpalacioeng-7351s-projects.vercel.app`

> **Como usar:** Execute cada item na ordem, marque ✅ (passou) ou ❌ (falhou) e anote evidências em falhas.

---

## Pré-condições Gerais

- Navegador: Google Chrome (versão atual)
- DevTools aberto: F12 → aba Console limpa e aba Network ativa
- Conta de teste disponível: `carlos@clinicapremium.com.br`
- Conexão de internet estável

---

## 1. Autenticação

### TC-AUTH-01 — Login válido

| Campo | Detalhe |
|---|---|
| **Objetivo** | Verificar que o login com credenciais válidas redireciona para o dashboard |
| **Severidade** | Bloqueador |
| **Tags** | auth, login |

**Passos:**
1. Acesse `/login?callbackUrl=%2Fdashboard`
2. Preencha o e-mail com `carlos@clinicapremium.com.br`
3. Preencha a senha correta
4. Clique em "Entrar"

**Resultado esperado:**
- Redirecionamento para `/dashboard` em menos de 5s
- Sem mensagens de erro
- Sidebar e header visíveis

**Em caso de falha, colete:**
- Screenshot da tela
- Aba Console: erros em vermelho
- Aba Network: status da requisição para `/api/auth/callback/credentials`
- Horário e URL exata

---

### TC-AUTH-02 — Login com credenciais inválidas

| Campo | Detalhe |
|---|---|
| **Objetivo** | Verificar que credenciais incorretas exibem mensagem de erro |
| **Severidade** | Alta |
| **Tags** | auth, login, error-handling |

**Passos:**
1. Acesse `/login`
2. Preencha o e-mail com `invalido@teste.com`
3. Preencha qualquer senha incorreta
4. Clique em "Entrar"

**Resultado esperado:**
- Permanece em `/login`
- Mensagem de erro visível: "E-mail ou senha inválidos"
- Nenhum redirecionamento

---

### TC-AUTH-03 — Acesso a rota protegida sem sessão

| Campo | Detalhe |
|---|---|
| **Objetivo** | Verificar que rotas protegidas redirecionam para login sem sessão ativa |
| **Severidade** | Bloqueador |
| **Tags** | auth, segurança |

**Passos:**
1. Abra uma aba anônima
2. Acesse diretamente `/dashboard`

**Resultado esperado:**
- Redirecionamento automático para `/login`

Repita para: `/pacientes`, `/prontuarios`

---

## 2. Dashboard

### TC-DASH-01 — Carregamento geral

| Campo | Detalhe |
|---|---|
| **Objetivo** | Verificar que o dashboard carrega corretamente após login |
| **Severidade** | Bloqueador |
| **Tags** | dashboard, ui |

**Passos:**
1. Faça login com credenciais válidas
2. Observe o carregamento do dashboard
3. Verifique a aba Console por erros

**Resultado esperado:**
- Dashboard carrega em menos de 5s
- Sidebar com menu lateral visível
- Header com barra de busca visível
- Seção de estatísticas (cards ou skeleton) visível
- Nenhum erro vermelho no Console

---

### TC-DASH-02 — Cards de estatísticas

| Campo | Detalhe |
|---|---|
| **Objetivo** | Verificar que as estatísticas da clínica são exibidas |
| **Severidade** | Alta |
| **Tags** | dashboard, api |

**Passos:**
1. Acesse `/dashboard`
2. Aguarde o carregamento completo (máx. 10s)
3. Verifique os cards de: Pacientes Ativos, Prontuários, Consultas Hoje, Procedimentos/Mês

**Resultado esperado:**
- Todos os 4 cards visíveis com valores numéricos ou "—"
- Sem mensagem de erro ou "0" suspeito
- Aba Network: chamada para `/api/dashboard/stats` retorna 200

---

### TC-DASH-03 — Navegação pelo menu lateral

| Campo | Detalhe |
|---|---|
| **Objetivo** | Verificar que todos os links do menu lateral funcionam |
| **Severidade** | Alta |
| **Tags** | dashboard, navegacao |

**Passos:**
1. Acesse `/dashboard`
2. Clique em cada item do menu: Pacientes, Prontuários, Procedimentos, Agenda, Fotos Clínicas, Relatórios, IA Assistente, Configurações
3. Verifique o carregamento de cada página

**Resultado esperado:**
- URL muda para a rota correspondente
- Página carrega sem erros
- Item de menu ativo é destacado visualmente

---

### TC-DASH-04 — Prontuários Recentes

| Campo | Detalhe |
|---|---|
| **Objetivo** | Verificar a seção de prontuários recentes no dashboard |
| **Severidade** | Média |
| **Tags** | dashboard, prontuario |

**Passos:**
1. Acesse `/dashboard`
2. Verifique a seção "Prontuários Recentes"
3. Se houver prontuários, clique em um deles

**Resultado esperado:**
- Tabela com prontuários ou mensagem "Nenhum prontuário encontrado"
- Link de prontuário leva para `/prontuarios/[id]`

---

## 3. Pacientes

### TC-PAC-01 — Listagem de pacientes

| Campo | Detalhe |
|---|---|
| **Objetivo** | Verificar que a lista de pacientes carrega corretamente |
| **Severidade** | Bloqueador |
| **Tags** | pacientes, ui, api |

**Passos:**
1. Clique em "Pacientes" no menu
2. Observe a tabela carregada

**Resultado esperado:**
- Tabela com colunas: Paciente, Idade/Nasc, Contato, Prontuários, Ações
- Dados visíveis OU estado vazio formatado "Nenhum paciente cadastrado"
- Botão "Novo Paciente" visível no canto superior direito
- Sem aviso de "banco indisponível" (em staging com DB real)

---

### TC-PAC-02 — Busca por nome

| Campo | Detalhe |
|---|---|
| **Objetivo** | Verificar que a busca por nome filtra resultados corretamente |
| **Severidade** | Alta |
| **Tags** | pacientes, busca |

**Passos:**
1. Acesse `/pacientes`
2. No campo de busca, digite parte do nome de um paciente cadastrado
3. Clique em "Buscar" ou pressione Enter

**Resultado esperado:**
- URL inclui `?q=...` com o termo buscado
- Resultados filtrados exibem apenas pacientes com o nome correspondente
- Se não encontrado: "Nenhum paciente encontrado com essa busca."

---

### TC-PAC-03 — Formulário de novo paciente

| Campo | Detalhe |
|---|---|
| **Objetivo** | Verificar o formulário de criação de novo paciente |
| **Severidade** | Alta |
| **Tags** | pacientes, formulario |

**Passos:**
1. Clique em "Novo Paciente"
2. Verifique a presença dos campos: Nome, CPF, Data de Nascimento, Gênero, Telefone, E-mail
3. Tente submeter sem preencher campos obrigatórios
4. Preencha todos os campos com dados válidos de teste (não usar dados reais de pacientes)
5. Submeta o formulário

**Resultado esperado:**
- Passo 3: validação impede submissão, campos com erro sinalizados
- Passo 5: redirecionamento para `/pacientes/[id]` do novo paciente
- Novo paciente aparece na listagem

**Dados de teste sugeridos:**
```
Nome: Paciente Teste QA
CPF: (usar gerador de CPF válido, ex.: 000.000.001-91)
Data Nasc: 01/01/1990
Gênero: Feminino
Telefone: (11) 99999-0001
```

---

### TC-PAC-04 — Detalhe do paciente

| Campo | Detalhe |
|---|---|
| **Objetivo** | Verificar que a página de detalhe do paciente carrega corretamente |
| **Severidade** | Alta |
| **Tags** | pacientes, detalhe |

**Passos:**
1. Na lista de pacientes, clique em um paciente
2. Observe a página carregada

**Resultado esperado:**
- URL: `/pacientes/[id]`
- Dados do paciente visíveis (nome, CPF mascarado, contato)
- Lista de prontuários do paciente (ou estado vazio)
- Sem erros no Console

---

## 4. Prontuários

### TC-PRON-01 — Listagem de prontuários

| Campo | Detalhe |
|---|---|
| **Objetivo** | Verificar que a lista de prontuários carrega corretamente |
| **Severidade** | Bloqueador |
| **Tags** | prontuario, ui, api |

**Passos:**
1. Clique em "Prontuários" no menu
2. Observe a tabela carregada

**Resultado esperado:**
- Tabela com colunas: Nº Prontuário, Paciente, Profissional, Procedimento, Data, Status, Ações
- Dados visíveis OU estado vazio formatado
- Filtros de status visíveis: Todos, Aberto, Em Andamento, Assinado, Arquivado
- Botão "Novo Prontuário" visível

---

### TC-PRON-02 — Filtros de status

| Campo | Detalhe |
|---|---|
| **Objetivo** | Verificar que os filtros de status funcionam corretamente |
| **Severidade** | Alta |
| **Tags** | prontuario, filtro |

**Passos:**
1. Acesse `/prontuarios`
2. Clique em cada filtro: Aberto, Em Andamento, Assinado, Arquivado
3. Observe os resultados

**Resultado esperado:**
- URL inclui `?status=ABERTO` (ou respectivo status)
- Apenas prontuários com o status selecionado são exibidos
- Botão do filtro ativo fica visualmente destacado
- Clicar em "Todos" remove o filtro

---

### TC-PRON-03 — Criação de prontuário (multi-step)

| Campo | Detalhe |
|---|---|
| **Objetivo** | Verificar o formulário multi-step de criação de prontuário |
| **Severidade** | Alta |
| **Tags** | prontuario, formulario, fluxo-critico |

**Passos:**
1. Clique em "Novo Prontuário"
2. **Etapa 1 – Seleção de Paciente:** Selecione um paciente existente. Avance.
3. **Etapa 2 – Anamnese:** Preencha a queixa principal e campos de anamnese. Avance.
4. **Etapa 3 – Procedimento:** Selecione um tipo de procedimento e preencha dados. Avance.
5. **Etapa 4 – TCLE/Assinatura:** Revise o TCLE. Capture a assinatura digital. Finalize.

**Resultado esperado:**
- Cada etapa avança ao clicar em "Próximo"
- Não é possível avançar sem preencher campos obrigatórios
- Ao finalizar: prontuário criado com número no formato P-AAAA-XXXX
- Redirecionamento para `/prontuarios/[id]`

---

### TC-PRON-04 — Detalhe do prontuário

| Campo | Detalhe |
|---|---|
| **Objetivo** | Verificar que a página de detalhe exibe todas as seções |
| **Severidade** | Alta |
| **Tags** | prontuario, detalhe |

**Passos:**
1. Acesse um prontuário existente
2. Verifique as seções: dados do paciente, anamnese, procedimentos, evolução, fotos, TCLE
3. Verifique o status e botão de assinatura (se status for ABERTO ou EM_ANDAMENTO)

**Resultado esperado:**
- Todas as seções visíveis
- Dados corretos conforme cadastro
- Botão de assinatura habilitado somente quando aplicável

---

## Guia de Coleta de Evidências

Veja [EVIDENCE-GUIDE.md](./EVIDENCE-GUIDE.md) para instruções detalhadas.

**Resumo rápido para falhas:**
1. Tire screenshot completo da tela (Windows: `PrtScn` ou `Win+Shift+S`)
2. Abra DevTools (F12), vá para Console — copie os erros em vermelho
3. Na aba Network — filtre por erros (status 4xx/5xx) e exporte o HAR
4. Anote: horário, URL, ação que realizou antes da falha
5. Se possível, grave um vídeo curto do fluxo (Loom, ShareX, ou similar)
6. Nomeie os arquivos: `YYYY-MM-DD_HH-MM_area_descricao.ext`
   - Exemplo: `2026-03-22_14-30_login_erro-credenciais-invalidas.png`
