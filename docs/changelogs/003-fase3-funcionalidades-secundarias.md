# CHANGELOG

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

## [0.4.0] - 2026-03-17

### Adicionado — Fase 3: Funcionalidades Secundárias (Sprint 7–12)

#### Fotos Clínicas
- **`GET /api/fotos?prontuarioId=`** — Lista fotos de um prontuário com verificação cross-tenant
- **`GET /api/fotos?pacienteId=`** — Lista todas as fotos do paciente com metadados do prontuário (para comparador antes/depois)
- **`POST /api/fotos`** — Registra URL de foto já upada via Uploadthing; tipos: `ANTES`, `DEPOIS`, `INTRAOPERATORIO`, `RETORNO`; campo `angulo` opcional (FRONTAL, PERFIL_D, etc.); audit log `FOTO_ADICIONADA`
- **`GET /api/fotos/[id]`** — Retorna foto individual com verificação cross-tenant
- **`DELETE /api/fotos/[id]`** — Remove foto; bloqueado em prontuários `ASSINADO`/`ARQUIVADO`; audit log `FOTO_REMOVIDA`

#### Relatórios + Export
- **`GET /api/relatorios?tipo=procedimentos`** — Todos os procedimentos da clínica com filtro por período e profissional; inclui dados do paciente e profissional
- **`GET /api/relatorios?tipo=pacientes`** — Listagem de pacientes com contador de prontuários; filtro por data de cadastro
- **`GET /api/relatorios?tipo=auditoria`** — Logs de auditoria completos (exclusivo ADMIN); filtros por usuário, ação e período
- **`GET /api/relatorios?tipo=retornos`** — Evoluções com retorno necessário no período; inclui contato do paciente e profissional responsável
- Todos os relatórios: paginação (`page`, `pageSize` máx 200), audit log `RELATORIO_GERADO`

#### Configurações
- **`GET /api/configuracoes/perfil`** — Retorna perfil completo do profissional autenticado incluindo dados da clínica e plano
- **`PUT /api/configuracoes/perfil`** — Atualiza nome, especialidade, assinatura digital; suporte a troca de senha (requer `senhaAtual` + `novaSenha`); senha hasheda com bcrypt 12 rounds; audit log `PERFIL_EDITADO` / `SENHA_ALTERADA`
- **`GET /api/configuracoes/clinica`** — Dados da clínica com contadores de profissionais, pacientes e prontuários
- **`PUT /api/configuracoes/clinica`** — Atualiza nome, CNPJ, endereço, telefone, email, logo (exclusivo ADMIN); audit log `CLINICA_EDITADA`

#### Agenda + Agendamentos
- **Modelo `Agendamento`** adicionado ao schema Prisma com campos: `dataHora`, `duracaoMinutos`, `tipo` (CONSULTA/RETORNO/PROCEDIMENTO/AVALIACAO), `status` (AGENDADO/CONFIRMADO/REALIZADO/CANCELADO/FALTOU), `prontuarioId` (vinculação pós-atendimento)
- **`GET /api/agenda`** — Listagem com filtros por profissional, paciente, status, período; paginada
- **`POST /api/agenda`** — Criação com **detecção automática de conflito de horário** para o profissional; retorna HTTP 409 com detalhes do conflito; audit log `AGENDAMENTO_CRIADO`
- **`GET /api/agenda/[id]`** — Retorna agendamento individual com dados do paciente e profissional
- **`PUT /api/agenda/[id]`** — Atualiza agendamento; bloqueia edição de status finais (`REALIZADO`, `CANCELADO`, `FALTOU`); audit log diferencia atualização de cancelamento
- **`DELETE /api/agenda/[id]`** — Cancela via `status = CANCELADO` (sem delete físico); bloqueia cancelamento de agendamentos realizados

#### Health Check
- **`GET /api/health`** — Health check público (sem auth); verifica conectividade com o banco; retorna `latencyMs`, versão e status dos serviços; HTTP 503 se banco indisponível; usado por Vercel e uptime monitors

### Alterado

- **`prisma/schema.prisma`** — Adicionado modelo `Agendamento` com relações para `Clinica`, `Paciente` e `Profissional`; enums `TipoAgendamento` e `StatusAgendamento`; índices em `clinicaId`, `profissionalId`, `dataHora`
- **`src/lib/audit.ts`** — `AUDIT_ACOES` expandido com: `FOTO_ADICIONADA`, `FOTO_REMOVIDA`, `RELATORIO_GERADO`, `PERFIL_EDITADO`, `SENHA_ALTERADA`, `CLINICA_EDITADA`, `AGENDAMENTO_CRIADO`, `AGENDAMENTO_ATUALIZADO`, `AGENDAMENTO_CANCELADO`

### Próximos passos — Fase 4

- Agentes IA (Vertex AI): preenchimento automático de anamnese, TCLE e relatórios
- Google Calendar: sincronização bidirecional da agenda
- LGPD Compliance final: DPO, backup offsite, política de privacidade publicada, retenção 20 anos verificada
- Performance + Testes E2E (Playwright)
