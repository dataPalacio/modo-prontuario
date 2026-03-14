# CHANGELOG

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

## [0.1.0] - 2025-03-14

### Adicionado
- **Estrutura do projeto** — Next.js 14 com App Router e TypeScript
- **Schema Prisma** — Entidades: Clinica, Profissional, Paciente, Prontuario, Procedimento, Evolucao, FotoClinica, Tcle, AuditLog
- **Identidade visual** — Paleta clínico-premium HOF com CSS customizado
- **Dashboard** — Visão geral com stats, prontuários recentes e agenda do dia
- **Pacientes** — Listagem com busca, avatares dinâmicos e paginação
- **Prontuários** — Listagem com filtro por status
- **Novo Prontuário** — Formulário multi-step (Paciente → Anamnese → Procedimento → TCLE)
- **Login** — Página de autenticação com gradiente premium e badges de compliance
- **Sidebar** — Navegação colapsável com indicador LGPD
- **API Routes** — Endpoints para pacientes e prontuários
- **Autenticação** — NextAuth v5 com JWT (8h de expiração)
- **Validações** — Schemas Zod para paciente, prontuário e procedimento
- **Utilitários** — Formatação BR (CPF, telefone, data), validação de CPF, hash SHA-256
- **Seed** — Dados de demonstração (clínica, profissional, pacientes, prontuário)
- **Documentação** — README, ARCHITECTURE, SECURITY, SETUP
- **LGPD** — Audit Log, soft delete, criptografia de dados sensíveis (estrutura)
