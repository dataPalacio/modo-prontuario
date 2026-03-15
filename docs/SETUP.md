# Guia de Instalação Local — Prontuário HOF

## Pré-requisitos

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Git**
- Conta gratuita no [Supabase](https://supabase.com) (PostgreSQL)

## Passo a Passo

### 1. Clonar o repositório

```bash
git clone <repo-url>
cd modo-prontuario
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite `.env` com suas credenciais:

```env
# Banco de dados (obtenha em https://supabase.com/dashboard)
DATABASE_URL="postgresql://..."

# Auth (gere um segredo aleatório)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="gere-com: openssl rand -base64 32"
```

### 4. Configurar banco de dados

```bash
# Gerar Prisma Client
npx prisma generate

# Criar tabelas no banco
npx prisma db push

# Popular com dados de demonstração
npx prisma db seed
```

### 5. Executar

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

### Credenciais de demonstração

| Campo | Valor |
|-------|-------|
| E-mail | carlos@clinicapremium.com.br |
| Senha | 123456 |

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Iniciar em produção |
| `npm run lint` | Verificar linting |
| `npx prisma studio` | Interface visual do banco |
| `npx prisma db seed` | Popular banco com dados demo |

## Troubleshooting

### Erro de conexão com banco
- Verifique se `DATABASE_URL` no `.env` está correto
- O Supabase usando Connection Pooler (porta 6543) requer `?pgbouncer=true` na url.

### Erro de autenticação
- Verifique se `NEXTAUTH_SECRET` está configurado
- Execute `npx prisma db seed` para criar o usuário demo
