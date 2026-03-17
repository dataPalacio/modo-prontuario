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

| Campo  | Valor                          |
| ------ | ------------------------------ |
| E-mail | `carlos@clinicapremium.com.br` |
| Senha  | `123456`                       |

## Scripts Disponíveis

| Comando                  | Descrição                       |
| ------------------------ | ------------------------------- |
| `npm run dev`            | Servidor de desenvolvimento     |
| `npm run build`          | Build de produção               |
| `npm run start`          | Iniciar em produção             |
| `npm run lint`           | Verificar linting               |
| `npx prisma studio`      | Interface visual do banco       |
| `npm run db:seed`        | Popular banco com dados demo    |

---

## Solução de Problemas: Login Trava / Timeout de Banco de Dados

### Sintoma

Login demora ~20 s e falha com `PrismaClientKnownRequestError` nos logs do Next.js.

### Causa raiz

As portas PostgreSQL (`5432` e `6543`) do Supabase Cloud são bloqueadas por firewalls corporativos/ISPs. Além disso, o hostname de conexão direta (`db.*.supabase.co`) resolve apenas para IPv6, que não está disponível em todas as redes.

### Diagnóstico rápido

```bash
# Testar se as portas estão acessíveis (resultado deve ser "True")
$r = Test-NetConnection aws-1-sa-east-1.pooler.supabase.com -Port 6543 -WarningAction SilentlyContinue
Write-Host $r.TcpTestSucceeded
```

### Soluções

#### Opção A — Mudar de rede (mais rápido)

Use um hotspot de celular ou conexão sem restrições de firewall.

#### Opção B — PostgreSQL local (sem dependência de rede externa)

1. Instale o [PostgreSQL 17](https://www.postgresql.org/download/windows/) e crie um banco:

   ```sql
   CREATE DATABASE prontuariohof;
   ```

2. Edite `.env.local` para apontar para o banco local (comente as linhas Supabase):

   ```env
   DATABASE_URL="postgresql://postgres:sua_senha@localhost:5432/prontuariohof"
   # DIRECT_URL não é necessário para conexão local — remova ou deixe vazio
   ```

3. Aplique o schema e popule os dados:

   ```bash
   npm run db:push
   npm run db:seed
   ```

#### Opção C — Supabase local com Docker

```bash
npx supabase start   # requer Docker Desktop instalado
# Copie as URLs geradas para DATABASE_URL e DIRECT_URL no .env.local
```

## Troubleshooting

### Erro de conexão com banco

- Verifique se `DATABASE_URL` no `.env` está correto
- O Supabase usando Connection Pooler (porta 6543) requer `?pgbouncer=true` na URL.

### Erro de autenticação

- Verifique se `NEXTAUTH_SECRET` está configurado
- Execute `npm run db:seed` para criar o usuário demo
