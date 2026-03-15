<div align="center">
  <h1>🦷 Prontuário HOF</h1>
  <p><strong>MicroSaaS de Prontuário Digital para Harmonização Orofacial</strong></p>
  <p>Conforme CFM 1.638/2002 · CFO 91/2009 · CFBM 320/2020 · LGPD</p>

  ![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
  ![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E?logo=supabase)
</div>

---

## 🚀 Sobre

Sistema web MicroSaaS para gestão de **prontuários eletrônicos** especializados em procedimentos de **Harmonização Orofacial (HOF)** — toxina botulínica, ácido hialurônico, bioestimuladores, fios de PDO, rinomodelação e outros.

## 📋 Funcionalidades

- ✅ **Dashboard** com visão geral da clínica
- ✅ **Cadastro de Pacientes** com busca e filtros
- ✅ **Prontuário Eletrônico** multi-step (Paciente → Anamnese → Procedimento → TCLE)
- ✅ **Rastreabilidade** de produtos e lotes (ANVISA)
- ✅ **Anamnese estruturada** para HOF
- ✅ **TCLE Digital** com assinatura
- ✅ **Multi-clínica** (multi-tenant preparado)
- ✅ **Audit Log** para LGPD
- ✅ **Soft Delete** (20 anos de retenção - CFM)

## 🚀 Quick Start

```bash
# 1. Instale as dependências
npm install

# 2. Configure as variáveis de ambiente baseadas no .env.example
cp .env.example .env

# 3. Configure o banco e popule os dados da demonstração
npm run db:generate
npm run db:push
npm run db:seed

# 4. Inicie o app
npm run dev
```

**Acesse:** http://localhost:3000  
**Login demo:** carlos@clinicapremium.com.br / 123456

## 📁 Estrutura

```
modo-prontuario/
├── prisma/          # Schema, seed, migrations
├── src/
│   ├── app/         # Next.js App Router
│   ├── components/  # Componentes React
│   ├── lib/         # Prisma, Auth, Utils, Validações
│   ├── store/       # Zustand store
│   └── types/       # TypeScript types
├── docs/            # Documentação técnica
├── .skills/         # Skills para IA
└── agents/          # Google Vertex AI Agents
```

## 📄 Documentação

- [README do Projeto](./docs/README.md)
- [Arquitetura](./docs/ARCHITECTURE.md)
- [Segurança & LGPD](./docs/SECURITY.md)
- [Setup Local](./docs/SETUP.md)

## ⚖️ Conformidade Legal

- **CFM 1.638/2002** — Prontuário médico
- **CFO 91/2009** — Prontuário odontológico
- **CFBM 320/2020** — Harmonização facial (biomédicos)
- **LGPD (Lei 13.709/2018)** — Proteção de dados sensíveis de saúde
- **ANVISA** — Rastreabilidade de produtos

## 📄 Licença

MIT © 2025 Prontuário HOF
