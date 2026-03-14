# 🦷 Prontuário HOF — Sistema de Prontuário Digital para Harmonização Orofacial

## Sobre o Projeto

Sistema web MicroSaaS para gestão de prontuários eletrônicos especializados em procedimentos de **Harmonização Orofacial (HOF)**, em conformidade com CFM, CFO, CFBM e LGPD.

Desenvolvido para profissionais habilitados: médicos, cirurgiões-dentistas com especialização, e biomédicos estetas.

## ✅ Funcionalidades

- [x] Cadastro e gestão de pacientes
- [x] Prontuário eletrônico completo com anamnese HOF
- [x] Registro de procedimentos com rastreabilidade de produtos/lotes
- [ ] Upload de fotos clínicas (antes/depois)
- [ ] TCLE digital com assinatura eletrônica
- [ ] Geração de PDF do prontuário
- [ ] Agenda de consultas
- [ ] Relatórios e estatísticas
- [x] Multi-profissional por clínica
- [x] Log de auditoria (LGPD)

## 🏗 Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14+ (App Router) + TypeScript |
| UI | Tailwind CSS + CSS customizado (Paleta HOF) |
| Formulários | React Hook Form + Zod |
| Estado | Zustand |
| Backend | Next.js API Routes (Serverless) |
| Auth | NextAuth.js v5 (JWT) |
| ORM | Prisma |
| Banco de Dados | PostgreSQL (Neon.tech) |
| Upload | Uploadthing |
| E-mail | Resend |
| Hospedagem | Vercel |
| IA | Google Vertex AI |

## 🚀 Início Rápido

```bash
# 1. Clone o repositório
git clone <repo-url>
cd modo-prontuario

# 2. Instale as dependências
npm install

# 3. Configure variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# 4. Configure o banco de dados
npx prisma generate
npx prisma db push
npx prisma db seed

# 5. Execute
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

**Credenciais demo:**
- E-mail: carlos@clinicapremium.com.br
- Senha: 123456

## 📁 Estrutura do Projeto

```
modo-prontuario/
├── prisma/             # Schema + Seeds + Migrations
├── src/
│   ├── app/            # Next.js App Router (pages + API)
│   │   ├── (auth)/     # Login, Register
│   │   ├── (dashboard)/# Dashboard, Pacientes, Prontuários
│   │   └── api/        # API Routes
│   ├── components/     # Componentes React
│   ├── lib/            # Prisma, Auth, Utils, Validações
│   ├── store/          # Zustand store
│   └── types/          # TypeScript types
├── docs/               # Documentação
├── .skills/            # Skills para IA
└── agents/             # Google Vertex AI Agents
```

## ⚖️ Conformidade Legal

- **CFM 1.638/2002** — Prontuário médico
- **CFO 91/2009** — Prontuário odontológico
- **CFBM 320/2020** — Harmonização facial (biomédicos)
- **LGPD (Lei 13.709/2018)** — Proteção de dados sensíveis
- **ANVISA** — Rastreabilidade de produtos

## 📄 Licença

MIT © 2025 Prontuário HOF
