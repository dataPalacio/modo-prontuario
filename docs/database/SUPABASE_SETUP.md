# Início Rápido: Integração com Supabase ⚡

Este guia ensina como integrar o projeto Prontuário HOF com o **Supabase** (PostgreSQL).

## 1. Criando o Projeto no Supabase

1. Crie uma conta no [Supabase](https://supabase.com).
2. Clique em **New Project**, escolha sua organização e um nome (ex: `prontuario-hof`).
3. Crie uma **Database Password** bem segura. (Guarde essa senha).
4. Escolha uma região (ex: *South America - São Paulo*) e clique em **Create New Project**. Aguarde o banco provisionar.

## 2. Obtendo as Strings de Conexão (Variáveis de Ambiente)

O Supabase como padrão trabalha com o *PgBouncer* integrado para Pool de Conexões. Precisamos pegar as URLs:

1. Acesse **Project Settings -> Database**.
2. Desça a página até achar a seção **Connection String** e escolha a aba **URI**.
3. **URL com Pool (Transaction mode)**: Para o Next.js interagir na Vercel/Serverless de forma barata.
   - Verifique que a URL está acessando via porta `6543`.
   - Adicione `?pgbouncer=true` no final da URL.
4. **Direct URL**: Para o Prisma conseguir gerenciar a infraestrutura e rodar migrations.
   - Verifique que a URL está acessando via porta `5432`.

### Passo A: Editando o `.env.local`

Adicione ou atualize as chaves do seu arquivo `.env.local`:

```env
# Conexão transacional para Client (Porta 6543 + pgbouncer)
DATABASE_URL="postgres://[user]:[password]@[host]:6543/postgres?pgbouncer=true"

# Conexão direta para Migrações (Porta 5432)
DIRECT_URL="postgres://[user]:[password]@[host]:5432/postgres"
```

## 3. Gerando as Tabelas no Banco

Com o Supabase configurado e as senhas ajustadas no `.env.local`, você tem dois caminhos para criar a estrutura do Prontuário:

### Cenário A: Executar via painel do Supabase (SQL Editor) - Manual
1. Abra o arquivo [schema_supabase.sql](./schema_supabase.sql) que está nesta mesma pasta nesta IDE e copie todo o seu conteúdo.
2. No painel lateral esquerdo do Supabase do seu projeto, entre no ícone do **SQL Editor**.
3. Clique em **New Query**, cole o código gerado pelo Prisma copiado no passo 1.
4. Aperte o botão verde **Run**. Você verá que as tabelas (`Clinica`, `Paciente`, `Prontuario`, etc) surgirão magicamente!

### Cenário B: Executar via Prisma (Terminal)
Rodar este comando abaixo enviará o Schema atual e criará a estrutura no repositório de forma automática.

```bash
npx prisma db push
```
*(Caso ocorra qualquer erro relacionado a permissões de shadow database, prefira utilizar a opção A).*

## 4. Adequação da Autenticação (NextAuth)

Neste projeto utilizamos o **NextAuth (Auth.js)** para gerenciar sessões independentes. Visto que você agora está operando no Supabase:

- A tabela de usuários chamada pelo NextAuth está atrelada à nossa configuração do `PrismaAdapter`.
- Para o NextAuth funcionar, basta definir o token de segurança dele obrigatoriamente neste `.env.local`:

```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="gerar-token-aleatorio-forte"
```

Os provedores de login (como Login via Email/Senha) já são suportados sem necessitar do serviço `Supabase Auth`, tornando o software muito mais independente do provedor e flexível!

## 5. Testando Funcionalidade Geral

Após sincronizar as tabelas, popule a base (opcional para testes) simulando uma clínica:

```bash
npm run db:seed
```

Suba o projeto (no modo Dev):
```bash
npm run dev
```

Você deve ser capaz de fazer o login na página principal com `carlos@clinicapremium.com.br` | `123456`.
