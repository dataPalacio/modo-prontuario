---
name: security-best-practices
description: "Review web security and data protection practices. Use for auth, encryption, secrets, access control, logging and headers."
argument-hint: "Descreva o fluxo, endpoint ou risco de seguranca que deve ser avaliado."
---

# Security Best Practices

## Origem

- Repositório: `supercent-io/skills-template`
- Popularidade: `#163 global (13.6K installs)`
- Tipo: `Segurança · Compliance`

## Descrição

Práticas de segurança para aplicações web: sanitização de inputs, proteção contra CSRF, XSS e SQLi, gestão segura de secrets, headers HTTP de segurança e logging de eventos críticos.

## Instalação

```bash
npx skills add supercent-io/skills-template/security-best-practices
```

## Aplicação no Projeto HOF

### Checklist de segurança HOF

```text
CRIPTOGRAFIA:
- CPF criptografado com AES-256-GCM
- ENCRYPTION_KEY em variável de ambiente
- bcrypt com 12 rounds para senhas
- JWT com expiração de 8h

SANITIZAÇÃO:
- Validação Zod em todos os inputs de API
- Prisma ORM previne SQLi por padrão
- CPF e dados sensíveis nunca expostos em logs

CONTROLE DE ACESSO:
- session = await auth() como primeira operação
- Verificação de Role para operações restritas
- clinicaId da sessão, nunca do request body
```

### Variáveis de ambiente críticas

```env
AUTH_SECRET="<gere com: openssl rand -base64 32>"
ENCRYPTION_KEY="<gere com: openssl rand -hex 32>"
DATABASE_URL="postgresql://[usuario]:[senha]@[host]:6543/postgres?pgbouncer=true"
```

## Agentes que usam esta skill

- LGPD Guardian
- Backend Prisma