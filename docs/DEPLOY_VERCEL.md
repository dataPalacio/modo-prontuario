# Guia de Deploy no Vercel — Prontuário HOF

Este guia descreve o passo a passo para fazer o deploy do Prontuário HOF (Next.js + Prisma + Supabase PostgreSQL) na plataforma Vercel.

## 1. Pré-requisitos

1. Uma conta no [Github](https://github.com/), [GitLab](https://about.gitlab.com/) ou [Bitbucket](https://bitbucket.org/).
2. Uma conta na [Vercel](https://vercel.com/).
3. Uma conta no [Supabase](https://supabase.com/) para o banco de dados PostgreSQL.
4. O código do projeto devidamente submetido (commit/push) ao seu repositório remoto.

## 2. Preparando o Banco de Dados (Supabase)

A Vercel precisa se conectar ao seu banco de dados de produção para realizar as consultas e salvar informações.

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard) e crie um novo projeto/banco de dados (ou use um já existente).
2. Na aba **Dashboard**, procure pela opção **Connect** ou vá em **Settings > Database**.
3. Selecione a aba **URI** e certifique-se de marcar a opção **Use connection pooling** (extremamente recomendado para ambientes serverless como a Vercel, pois evita estourar o limite de conexões simultâneas).
4. Copie a URL gerada (ela começa com `postgresql://` e tipicamente usa a porta 6543 do pooler com `?pgbouncer=true`). Guarde-a para usar na Vercel.

## 3. Preparando o Projeto na Vercel

1. Acesse o [dashboard da Vercel](https://vercel.com/dashboard).
2. Clique no botão **"Add New..."** e escolha a opção **"Project"**.
3. Conecte sua conta do GitHub/GitLab e procure pelo repositório do **Prontuário HOF** (`modo-prontuario`).
4. Clique em **"Import"**.

## 4. Configurando o Deploy

A Vercel reconhecerá automaticamente que o projeto utiliza Next.js. Antes de clicar em Deploy, algumas configurações são cruciais:

### Comandos de Build

A Vercel já preenche o "Build Command" com `next build`. No entanto, como utilizamos o Prisma ORM, o Prisma Client precisa ser gerado antes que o Next.js tente fazer o build.

1. Expanda a seção **"Build and Output Settings"**.
2. No campo **"Build Command"**, certifique-se de que o comando esteja assim (ou ative override se precisar subscrever):

   ```bash
   npx prisma generate && next build
   ```

### Variáveis de Ambiente (Environment Variables)

Para que sua aplicação rode em produção de forma funcional, todas as chaves secretas e configurações devem ser carregadas aqui. Expanda a aba **Environment Variables** e adicione:

* **`DATABASE_URL`**: A URL de conexão com seu banco Supabase (a connection string do Pooler que você obteve no Passo 2). Lembre-se, use a URL com *connection pooling* (ex: porta 6543) com `?pgbouncer=true`.
* **`AUTH_URL`**: O domínio em que a sua aplicação vai rodar. Em produção, use a URL final do projeto na Vercel ou domínio customizado.
* **`AUTH_SECRET`**: Um token criptográfico forte para o Auth.js v5. Gere com `openssl rand -base64 32`.
* **`NEXTAUTH_URL`**: O domínio em que a sua aplicação vai rodar. *Dica: Você pode preencher este campo provisoriamente com uma URL genérica, ou não preenchê-lo ainda, e deixar o próprio sistema de deploy automático da Vercel gerenciá-lo com as "System Environment Variables". Depois que aplicar o domínio definitivo, atualize esse valor.*
* **`NEXTAUTH_SECRET`**: Um token criptográfico forte. No terminal da sua máquina, rode `openssl rand -base64 32` e cole aqui o valor gerado.
* **`AES_SECRET_KEY`**: Chave hex de 64 caracteres usada para criptografar CPF em repouso. Gere com `openssl rand -hex 32`.
* Outras APIs como, por exemplo, `UPLOADTHING_SECRET`, `RESEND_API_KEY` (se você as for configurar).

### Prisma 7 e PostgreSQL

O projeto usa **Prisma 7** com o adapter oficial PostgreSQL (`@prisma/adapter-pg`). Isso implica duas regras no deploy:

1. A variável obrigatória para o runtime é **apenas `DATABASE_URL`**.
2. O Prisma Client é inicializado com adapter Node Postgres em [src/lib/prisma.ts](c:\git-clones\modo-prontuario\src\lib\prisma.ts), então a build da Vercel precisa apenas conseguir resolver essa URL durante o build e no runtime.

## 5. Clicando em Deploy

1. Após as configurações, clique no botão azul **"Deploy"**.
2. A Vercel começará a "buildar" seu projeto. Isso inclui:
   * Baixar o código.
   * Rodar `npx prisma generate` (para criar o client do Prisma).
   * Rodar `next build` (compilar o TypeScript e o Next).
   * Realizar o deploy nas bordas (Edge network) da Vercel.
3. Aguarde o processo finalizar (pode demorar em torno de 1 a 3 minutos).
4. Quando tudo terminar, você verá as bolinhas explodindo em confetes e uma prévia de sua tela!

## 6. Sincronizando o Banco de Dados (Migrations)

O projeto foi *buildado* corretamente, MAS o seu banco de dados Supabase novo está vazio. Precisamos rodar os comandos do Prisma (`push` ou `migrate`) no banco.

Uma das formas mais fáceis é utilizar o próprio terminal local:

1. No seu computador, edite provisoriamente o seu `.env` na raiz do projeto ou altere diretamente pelo terminal.
2. Troque o valor de `DATABASE_URL` para a **URL de produção do banco Supabase** que você registrou na Vercel.
3. No terminal da sua máquina, execute:

    ```bash
    npx prisma db push
    # Isso vai criar as tabelas 'Clinica', 'Prontuario', etc., no banco de dados em nuvem.
    ```

4. Se quiser popular com os dados de demonstração iniciais, corra também:

    ```bash
    npm run db:seed
    ```

   *(Cuidado: só faça o *seed* em ambientes de teste. O seed pode criar usuários fictícios no banco produtivo).*
5. **Atenção:** Logo após terminar, lembre-se de reverter a sua string do banco local (no seu `.env`) para não continuar apontando para produção!

## 7. Pronto! 🚀

Acesse a URL fornecida pela página de deploy da Vercel (geralmente `seu-projeto.vercel.app`).
Seu **MicroSaaS de Prontuário HOF** está online, rápido e rodando em um provedor premium e gratuito.
