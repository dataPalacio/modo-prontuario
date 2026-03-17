# CHANGELOG

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

## [0.3.0] - 2026-03-17

### Adicionado — Fase 2: Core Business REAL (Sprint 3–6)

#### Pacientes — CRUD Completo
- **`GET /api/pacientes/[id]`** — Retorna paciente com CPF decriptografado (AES-256-GCM), prontuários vinculados e audit log de visualização
- **`PUT /api/pacientes/[id]`** — Atualização de dados demográficos com validação Zod; audit log registra delta antes/depois
- **`DELETE /api/pacientes/[id]`** — Soft delete via `deletedAt` (exclusivo ADMIN); nunca deleta fisicamente conforme retenção LGPD/CFM 20 anos
- **`GET /api/pacientes/exportar?pacienteId=`** — Portabilidade de dados conforme LGPD Art. 18; inclui todos os prontuários, procedimentos e TCLEs; CPF decriptografado; audit log `DADOS_EXPORTADOS` obrigatório

#### Prontuários — CRUD Completo
- **`GET /api/prontuarios/[id]`** — Eager load completo (paciente, profissional, procedimentos, evoluções, fotos, TCLE); audit log `PRONTUARIO_VISUALIZADO`
- **`PUT /api/prontuarios/[id]`** — Rejeita mutações em prontuários `ASSINADO` ou `ARQUIVADO` (422); somente profissional responsável ou ADMIN pode editar
- **`DELETE /api/prontuarios/[id]`** — Soft delete (`deletedAt`) + status `ARQUIVADO`; exclusivo ADMIN; audit log `PRONTUARIO_ARQUIVADO`
- **`POST /api/prontuarios/[id]/assinar`** — Gera hash SHA-256 do conteúdo completo (CFM); seta `status = ASSINADO`, `assinadoPor`, `assinadoEm`, `hashIntegridade`; prontuário torna-se imutável

#### TCLE — Persistência + Assinatura
- **`GET /api/tcle?prontuarioId=`** — Retorna TCLE do prontuário
- **`POST /api/tcle`** — Cria TCLE (1:1 por prontuário); versão do template registrada; rejeita criação em prontuários assinados/arquivados
- **`POST /api/tcle/[id]/assinar`** — Registra assinatura digital (base64 PNG), IP real do paciente, user-agent; TCLE assinado é imutável; audit log `TCLE_ASSINADO`

#### Procedimentos + Rastreabilidade ANVISA
- **`GET /api/procedimentos?prontuarioId=`** — Lista procedimentos com verificação cross-tenant
- **`POST /api/procedimentos`** — Campo `lote` obrigatório (rastreabilidade CFM/ANVISA); atualiza status do prontuário para `EM_ANDAMENTO`; rejeita adição em prontuários assinados
- **`GET /api/procedimentos/[id]`** — Retorna procedimento individual com verificação cross-tenant
- **`DELETE /api/procedimentos/[id]`** — Remove apenas de prontuários editáveis; audit log `PROCEDIMENTO_REMOVIDO`
- **`GET /api/procedimentos/rastreabilidade?lote=`** — **Recall ANVISA**: lista todos os pacientes da clínica que receberam produto do lote informado, com dados de contato e datas de atendimento

#### Evoluções / Retornos
- **`GET /api/evolucoes?prontuarioId=`** — Lista evoluções com verificação cross-tenant
- **`POST /api/evolucoes`** — Campos: descrição, satisfação 1–5, retornoNecessário, dataRetorno; rejeita criação em prontuários arquivados
- **`DELETE /api/evolucoes/[id]`** — Remove apenas de prontuários editáveis; audit log `EVOLUCAO_REMOVIDA`

#### Audit Log — Completo
- **`GET /api/audit`** — Acesso exclusivo ADMIN; paginação + filtros por entidade, ação, período e usuário; inclui dados do profissional por include
- **`GET /api/dashboard/stats`** — 8 métricas em paralelo via `Promise.all`: total pacientes, prontuários, procedimentos, retornos pendentes, prontuários últimos 30 dias, distribuição por status, últimos 10 prontuários, top 5 procedimentos por tipo

### Alterado

- **`src/lib/audit.ts`** — `AUDIT_ACOES` expandido com: `TCLE_CRIADO`, `PROCEDIMENTO_REMOVIDO`, `RASTREABILIDADE_CONSULTADA`, `EVOLUCAO_CRIADA`, `EVOLUCAO_REMOVIDA`

### Segurança

- CPF nunca exposto em listagens — apenas em `GET /api/pacientes/[id]` e exportação LGPD
- `clinicaId` sempre extraído da sessão JWT, nunca do body da requisição
- Prontuários e TCLEs assinados rejeitam toda mutação (HTTP 422)
- Verificação cross-tenant em todos os relacionamentos (procedimentos, evoluções, fotos, TCLE)
- ADMIN-only para: excluir pacientes, arquivar prontuários, visualizar audit log
