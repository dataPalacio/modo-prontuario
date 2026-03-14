# 🗄️ Documentação do Banco de Dados

Esta pasta contém as documentações específicas e os scripts de inicialização referentes ao banco de dados do **Prontuário HOF**. 

O sistema foi preparado e otimizado para **PostgreSQL**, com excelente suporte (via Prisma) ao [Supabase](https://supabase.com).

## Conteúdos

1. **[Configuração Supabase (Início Rápido)](./SUPABASE_SETUP.md)**: Passo a passo de como iniciar seu projeto no Supabase, configurar as strings de conexão e conectar sua aplicação com Auth/Prisma.
2. **[schema_supabase.sql](./schema_supabase.sql)**: Exportação do Data Definition Language (DDL) atual do Prisma. Com este arquivo, você pode rodar manualmente a criação das tabelas pelo painel do Supabase com apenas um clique, se não quiser rodar pelo terminal.

## Como Funciona a Integração?

O Prontuário HOF utiliza:
- **NextAuth.js v5 (Auth.js)** para toda a gestão de sessões, utilizando o Prisma Adapter. Sendo assim, os usuários são salvos e acessíveis através da tabela `User` (ou neste caso `Profissional` por nossa modelagem customizada) gerenciada pelo nosso ORM, dentro do próprio Supabase de forma nativa.
- **Prisma ORM** como motor de banco de dados. O Prisma compila schemas em run-time em comandos SQL específicos (dialeto postgres) perfeitamente integrados com o PostgreSQL do Supabase.
- **Multi-Tenant (Pronto)**: Os dados possuem relacionamentos forçados (`clinicaId`). No banco relacional os dados ficam blindados pela API.

*Consulte a documentação do [Supabase Setup](./SUPABASE_SETUP.md) para ligar o projeto agora mesmo.*
