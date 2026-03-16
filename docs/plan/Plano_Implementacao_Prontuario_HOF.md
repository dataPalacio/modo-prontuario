# PLANO DE IMPLEMENTAÇÃO DETALHADO
## Prontuário HOF — Roadmap Técnico Completo 2026

**Documento:** Roadmap de Implementação  
**Data:** 15/03/2026  
**Versão:** 1.0  
**Status:** Em Planejamento  
**Equipe:** 1-2 Desenvolvedores Senior Full-Stack  
**Duração Total:** 16 semanas (81 dias úteis) com 1 dev | 8 semanas (4 sprints) com 2 devs

---

## 📋 ÍNDICE

1. Visão Geral do Plano
2. Estratégia de Implementação
3. Fases de Desenvolvimento (P0 → P3)
4. Sprint-by-Sprint (Semanas 1-16)
5. Instruções Técnicas Detalhadas por Módulo
6. Checklist de Implementação
7. Testing & QA Strategy
8. Documentação & Deployment

---

# 1. VISÃO GERAL DO PLANO

## 1.1 Objetivos Principais

| Objetivo | Critério de Sucesso | Prazo |
|----------|-------------------|-------|
| 🔴 **Segurança Crítica (P0)** | Auth, Multi-tenant, Cripto, Headers | Sprint 1-2 |
| 🟠 **Core Business (P1)** | CRUD Pacientes, Prontuários, TCLE, APIs | Sprint 3-6 |
| 🟡 **Funcionalidades Secundárias (P2)** | Dashboard, Relatórios, Upload, Agenda | Sprint 7-12 |
| 🟢 **Integrações Avançadas (P3)** | Agentes IA, Google Calendar, Webhooks | Sprint 13-16 |

## 1.2 Princípios de Implementação

```
┌─────────────────────────────────────────────────────────┐
│  PRINCÍPIOS DE DESENVOLVIMENTO                          │
├─────────────────────────────────────────────────────────┤
│ ✅ P0 antes de P1 — Segurança é pré-requisito          │
│ ✅ TDD — Testes escritos antes do código                │
│ ✅ Code Review — Toda mudança precisa de revisão        │
│ ✅ Documentação — Inline + README + Postman             │
│ ✅ Commits Atômicos — Um objetivo por commit            │
│ ✅ Branches por Feature — git-flow strict               │
│ ✅ Testes de Regressão — Suite rodando em CI/CD        │
│ ✅ LGPD First — Compliance desde o início               │
└─────────────────────────────────────────────────────────┘
```

## 1.3 Stack Confirmado

```javascript
// Backend
- Runtime: Node.js 18+
- Framework: Next.js 16 (App Router)
- Auth: NextAuth v5 (fixar em ^5.0.0-beta.30 com lock)
- Database: Supabase PostgreSQL
- ORM: Prisma 7
- Encryption: crypto-js (AES-256-GCM)
- Validation: Zod
- Logging: Winston + Sentry
- IA: Vertex AI (Google Cloud)
- File Storage: Uploadthing

// Frontend
- React 19
- TypeScript 5.x
- TailwindCSS 3
- shadcn/ui
- Recharts (visualização)
- @react-pdf/renderer (PDF)
- SignatureCanvas
- React Hook Form

// DevOps
- Git: GitHub (private)
- CI/CD: GitHub Actions
- Hosting: Vercel
- Database Backup: Supabase + pg_dump
- Monitoring: Sentry + Custom Dashboards
```

---

# 2. ESTRATÉGIA DE IMPLEMENTAÇÃO

## 2.1 Modelo de Desenvolvimento: Fases Paralelas

```
FASE 1 (Sprint 1-2): FUNDAÇÃO CRÍTICA
├── Auth + Middleware (5 dias)
├── Multi-tenancy (3 dias)
├── Criptografia + Security Headers (2 dias)
├── Estrutura de Testes (2 dias)
└── Infra Logging/Monitoring (2 dias)

FASE 2 (Sprint 3-6): CORE BUSINESS REAL
├── Pacientes CRUD Completo (3 dias)
├── Prontuários CRUD Completo (8 dias)
├── TCLE + Assinatura Persistida (4 dias)
├── Procedimentos + Rastreabilidade (4 dias)
├── API Routes Todas (8 dias)
└── Audit Log Completo (3 dias)

FASE 3 (Sprint 7-12): FUNCIONALIDADES SECUNDÁRIAS
├── Dashboard com Dados Reais (2 dias)
├── Relatórios + Export (4 dias)
├── Upload Fotos + Comparador (4 dias)
├── Agenda + Agendamentos (5 dias)
├── Configurações CRUD (3 dias)
└── PDF Generation (3 dias)

FASE 4 (Sprint 13-16): INTEGRAÇÕES AVANÇADAS
├── Agentes IA Anamnese (4 dias)
├── Agentes IA TCLE (2 dias)
├── Agentes IA Relatórios (2 dias)
├── Google Calendar Sync (3 dias)
├── LGPD Compliance Restante (4 dias)
└── Performance + Testes E2E (8 dias)
```

## 2.2 Matriz de Dependências

```
PRE-REQUISITO              → DEPENDE DE
────────────────────────────────────────────
Middleware                 → (nenhum)
Auth Completo              → Middleware
Multi-tenant               → Auth
Criptografia              → (nenhum)
Headers Segurança         → (nenhum)
────────────────────────────────────────────
Pacientes CRUD            → Auth, Multi-tenant
Prontuários CRUD          → Auth, Multi-tenant, Pacientes
TCLE Persistência         → Auth, Prontuários
Procedimentos             → Auth, Prontuários
Audit Log                 → Auth, Multi-tenant
────────────────────────────────────────────
Dashboard                 → Pacientes CRUD, Prontuários CRUD
Relatórios                → Audit Log, Procedimentos
Fotos                     → Auth, Prontuários, Uploadthing
Agenda                    → Auth, Pacientes
────────────────────────────────────────────
Agentes IA                → Prontuários CRUD, Vertex AI Setup
Google Calendar           → Agenda
LGPD Final                → Tudo acima
```

---

# 3. FASES DE DESENVOLVIMENTO

## 3.1 FASE 1: FUNDAÇÃO CRÍTICA (Sprint 1-2) — 10 dias

### Meta: Segurança mínima para usar em produção

**Status:** 🔴 CRÍTICO - BLOQUEIA TUDO MAIS

---

### TAREFA 1.1: Middleware de Proteção de Rotas (5 dias)

**Objetivo:** Nenhuma rota do dashboard é acessível sem autenticação

**Dependências:** NextAuth v5 já configurado

**Arquivos a Criar/Modificar:**
```
src/middleware.ts                    (NOVO)
src/lib/auth.ts                      (MODIFICAR)
src/app/(dashboard)/layout.tsx       (MODIFICAR)
```

#### Passo 1.1.1: Criar middleware.ts

```typescript
// src/middleware.ts
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const publicRoutes = [
  "/login",
  "/register",
  "/esqueci-senha",
  "/reset-password",
  "/api/auth",  // NextAuth routes
];

const apiPublicRoutes = [
  "/api/auth",
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Verificar se é rota pública
  const isPublicRoute = publicRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Se é rota pública, permitir
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Verificar autenticação
  const session = await auth();

  // Se não tem sessão e tenta acessar rota protegida
  if (!session) {
    // Redirecionar para login
    const loginUrl = new URL("/login", request.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validar clinicaId na sessão
  if (!session.user?.clinicaId) {
    return NextResponse.redirect(
      new URL("/login?error=InvalidSession", request.nextUrl.origin)
    );
  }

  // Adicionar clinicaId aos headers para uso em Server Components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-clinica-id", session.user.clinicaId);
  requestHeaders.set("x-user-id", session.user.id);
  requestHeaders.set("x-user-role", session.user.role);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Configurar rotas onde middleware deve rodar
export const config = {
  matcher: [
    // Proteger rotas do dashboard
    "/dashboard/:path*",
    "/pacientes/:path*",
    "/prontuarios/:path*",
    "/procedimentos/:path*",
    "/fotos/:path*",
    "/agenda/:path*",
    "/relatorios/:path*",
    "/configuracoes/:path*",
    // Proteger todas as APIs (exceto auth)
    "/api/:path((?!auth).*)",
  ],
};
```

#### Passo 1.1.2: Atualizar auth.ts

```typescript
// src/lib/auth.ts - MODIFICAR JWT callback

export const authConfig = {
  // ... config anterior mantida ...
  callbacks: {
    jwt: async ({ token, user, account }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.clinicaId = user.clinicaId;
        token.numeroConselho = user.numeroConselho;
        token.conselho = user.conselho;
        token.iat = Math.floor(Date.now() / 1000);
      }
      return token;
    },

    session: async ({ session, token }) => {
      session.user = {
        ...session.user,
        id: token.id as string,
        role: token.role as "ADMIN" | "MEDICO" | "ENFERMEIRO",
        clinicaId: token.clinicaId as string,
        numeroConselho: token.numeroConselho as string,
        conselho: token.conselho as string,
      };
      return session;
    },

    redirect: async ({ url, baseUrl }) => {
      // Se está vindo de login, redirecionar para dashboard
      if (url.startsWith(baseUrl)) {
        return `${baseUrl}/dashboard`;
      }
      return baseUrl;
    },
  },
};
```

#### Passo 1.1.3: Criar tipo TypeScript para sessão

```typescript
// src/types/auth.ts (NOVO)
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      role: "ADMIN" | "MEDICO" | "ENFERMEIRO";
      clinicaId: string;
      numeroConselho: string;
      conselho: string;
    };
  }

  interface User {
    id: string;
    role: "ADMIN" | "MEDICO" | "ENFERMEIRO";
    clinicaId: string;
    numeroConselho: string;
    conselho: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "MEDICO" | "ENFERMEIRO";
    clinicaId: string;
    numeroConselho: string;
    conselho: string;
    iat: number;
  }
}
```

#### Passo 1.1.4: Criar helper para acessar sessão em Server Components

```typescript
// src/lib/session.ts (NOVO)
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function getSession() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  return session;
}

export async function getSessionOrNull() {
  return await auth();
}

export async function getClinicaId() {
  const session = await getSession();
  return session.user.clinicaId;
}

export async function getUserId() {
  const session = await getSession();
  return session.user.id;
}
```

#### Passo 1.1.5: Testar Middleware

```bash
# 1. Tentar acessar rota protegida sem autenticação
# Esperado: Redirecionar para /login

# 2. Login com credenciais válidas
# Esperado: Redirecionar para /dashboard

# 3. Acessar API sem sessão
# Esperado: Retornar 401 Unauthorized
```

**Checklist:**
- [ ] Arquivo middleware.ts criado
- [ ] Auth types atualizado
- [ ] Helper getSession criado
- [ ] Testes de redirecionamento passando
- [ ] Rotas do dashboard protegidas
- [ ] APIs protegidas (POST, PUT, DELETE)

**Tempo Estimado:** 1.5 dias
**Próxima:** Tarefa 1.2

---

### TAREFA 1.2: Autenticação Completa (Login/Register/Reset) (3 dias)

**Objetivo:** Sistema de autenticação funcional end-to-end

**Status:** 🔴 CRÍTICO

#### Passo 1.2.1: Implementar Login Real

```typescript
// src/app/(auth)/login/page.tsx - MODIFICAR

"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result?.ok) {
        setError(result?.error || "Credenciais inválidas");
        setLoading(false);
        return;
      }

      // Sucesso - redirecionar
      router.push(callbackUrl);
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2">HOF Prontuário</h1>
        <p className="text-gray-600 mb-8">Sistema de Prontuário Eletrônico</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              E-mail Profissional
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Senha</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500"
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2 text-sm text-gray-600">
          <p>
            Sem conta?{" "}
            <a href="/register" className="text-blue-600 hover:underline">
              Cadastre-se aqui
            </a>
          </p>
          <p>
            <a href="/esqueci-senha" className="text-blue-600 hover:underline">
              Esqueceu a senha?
            </a>
          </p>
        </div>

        <div className="mt-8 pt-8 border-t space-y-2 text-xs text-gray-500">
          <p>✅ Certificado CFM</p>
          <p>✅ Conforme LGPD</p>
          <p>✅ Backup Automático</p>
        </div>
      </div>
    </div>
  );
}
```

#### Passo 1.2.2: Criar Register Page

```typescript
// src/app/(auth)/register/page.tsx (NOVO)

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    email: "",
    conselho: "CFM",
    numeroConselho: "",
    especialidade: "",
    password: "",
    passwordConfirm: "",
    agreeTerms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.passwordConfirm) {
      setError("Senhas não correspondem");
      return;
    }

    if (!formData.agreeTerms) {
      setError("Você deve concordar com os Termos de Uso");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeCompleto: formData.nomeCompleto,
          email: formData.email,
          conselho: formData.conselho,
          numeroConselho: formData.numeroConselho,
          especialidade: formData.especialidade,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Erro ao cadastrar");
        setLoading(false);
        return;
      }

      // Sucesso - redirecionar para login
      router.push("/login?registered=true");
    } catch (err) {
      setError("Erro ao cadastrar. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2">Cadastro Profissional</h1>
        <p className="text-gray-600 mb-8">Crie sua conta HOF Prontuário</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Nome Completo"
            value={formData.nomeCompleto}
            onChange={(e) =>
              setFormData({ ...formData, nomeCompleto: e.target.value })
            }
            required
            disabled={loading}
          />

          <Input
            type="email"
            placeholder="E-mail Profissional"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={loading}
          />

          <div className="grid grid-cols-2 gap-2">
            <select
              value={formData.conselho}
              onChange={(e) =>
                setFormData({ ...formData, conselho: e.target.value })
              }
              className="px-3 py-2 border rounded"
              disabled={loading}
            >
              <option value="CFM">CFM</option>
              <option value="COREN">COREN</option>
              <option value="CRO">CRO</option>
            </select>

            <Input
              placeholder="Número"
              value={formData.numeroConselho}
              onChange={(e) =>
                setFormData({ ...formData, numeroConselho: e.target.value })
              }
              required
              disabled={loading}
            />
          </div>

          <Input
            placeholder="Especialidade"
            value={formData.especialidade}
            onChange={(e) =>
              setFormData({ ...formData, especialidade: e.target.value })
            }
            disabled={loading}
          />

          <Input
            type="password"
            placeholder="Senha (min. 8 caracteres)"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
            disabled={loading}
            minLength={8}
          />

          <Input
            type="password"
            placeholder="Confirmar Senha"
            value={formData.passwordConfirm}
            onChange={(e) =>
              setFormData({ ...formData, passwordConfirm: e.target.value })
            }
            required
            disabled={loading}
            minLength={8}
          />

          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={formData.agreeTerms}
              onChange={(e) =>
                setFormData({ ...formData, agreeTerms: e.target.checked })
              }
              disabled={loading}
              className="mr-2"
            />
            Concordo com os Termos de Uso e Política de Privacidade
          </label>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Já tem conta?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Faça login aqui
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
```

#### Passo 1.2.3: Criar API de Register

```typescript
// src/app/api/auth/register/route.ts (NOVO)

import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

const registerSchema = z.object({
  nomeCompleto: z.string().min(3),
  email: z.string().email(),
  conselho: z.enum(["CFM", "COREN", "CRO"]),
  numeroConselho: z.string().min(1),
  especialidade: z.string().optional(),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    // Verificar se e-mail já existe
    const existingProfissional = await prisma.profissional.findUnique({
      where: { email: data.email },
    });

    if (existingProfissional) {
      return NextResponse.json(
        { message: "E-mail já cadastrado" },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await hash(data.password, 12);

    // Criar clínica padrão (pode ser associada depois)
    const clinica = await prisma.clinica.create({
      data: {
        nomeFantasia: `Clínica de ${data.nomeCompleto}`,
        cnpj: "00000000000000", // Será atualizado depois
        crmResponsavel: data.numeroConselho,
      },
    });

    // Criar profissional
    const profissional = await prisma.profissional.create({
      data: {
        nomeCompleto: data.nomeCompleto,
        email: data.email,
        conselho: data.conselho,
        numeroConselho: data.numeroConselho,
        especialidade: data.especialidade || "",
        password: hashedPassword,
        clinicaId: clinica.id,
        role: "MEDICO",
      },
    });

    return NextResponse.json(
      {
        message: "Cadastro realizado com sucesso",
        profissional: {
          id: profissional.id,
          email: profissional.email,
          nome: profissional.nomeCompleto,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Dados inválidos", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Register error:", error);
    return NextResponse.json(
      { message: "Erro ao cadastrar" },
      { status: 500 }
    );
  }
}
```

#### Passo 1.2.4: Criar API de Forgot Password

```typescript
// src/app/api/auth/forgot-password/route.ts (NOVO)

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { sendResetEmail } from "@/lib/email";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    const profissional = await prisma.profissional.findUnique({
      where: { email },
    });

    // Sempre retornar sucesso (por segurança, não revelar se email existe)
    if (!profissional) {
      return NextResponse.json(
        { message: "Se o e-mail existir, receberá instruções de reset" },
        { status: 200 }
      );
    }

    // Gerar token de reset
    const resetToken = randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Salvar token no banco (adicionar campos em schema)
    await prisma.profissional.update({
      where: { id: profissional.id },
      data: {
        resetToken,
        resetTokenExpires,
      },
    });

    // Enviar email
    await sendResetEmail(profissional.email, resetToken);

    return NextResponse.json(
      { message: "Se o e-mail existir, receberá instruções de reset" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Erro ao processar requisição" },
      { status: 500 }
    );
  }
}
```

#### Passo 1.2.5: Setup Resend Email

```typescript
// src/lib/email.ts (NOVO)

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendResetEmail(email: string, resetToken: string) {
  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

  return await resend.emails.send({
    from: "noreply@prontuariohof.com",
    to: email,
    subject: "Redefinir Senha - Prontuário HOF",
    html: `
      <h1>Redefinição de Senha</h1>
      <p>Clique no link abaixo para redefinir sua senha:</p>
      <a href="${resetLink}">Redefinir Senha</a>
      <p>Este link expira em 24 horas.</p>
      <p>Se não solicitou esta ação, ignore este e-mail.</p>
    `,
  });
}

export async function sendConfirmationEmail(email: string) {
  return await resend.emails.send({
    from: "noreply@prontuariohof.com",
    to: email,
    subject: "Bem-vindo ao Prontuário HOF",
    html: `
      <h1>Bem-vindo ao Prontuário HOF</h1>
      <p>Sua conta foi criada com sucesso!</p>
      <a href="${process.env.NEXTAUTH_URL}/login">Fazer Login</a>
    `,
  });
}
```

**Checklist:**
- [ ] Login page implementada e funcional
- [ ] Register page implementada
- [ ] API /api/auth/register funcional
- [ ] API /api/auth/forgot-password funcional
- [ ] Resend configurado e testado
- [ ] Reset email template criado

**Tempo Estimado:** 3 dias
**Próxima:** Tarefa 1.3

---

### TAREFA 1.3: Multi-tenancy Implementação Completa (3 dias)

**Objetivo:** Isolamento total de dados entre clínicas

**Status:** 🔴 CRÍTICO

#### Passo 1.3.1: Criar Helper de Multi-tenancy

```typescript
// src/lib/multi-tenant.ts (NOVO)

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * Obtém clinicaId da sessão (server-side)
 * Sempre seguro pois vem do JWT
 */
export async function getClinicaIdFromSession(): Promise<string> {
  const session = await auth();
  
  if (!session?.user?.clinicaId) {
    throw new Error("Session clinicaId not found");
  }

  return session.user.clinicaId;
}

/**
 * Obtém clinicaId dos headers (middleware)
 * Seguro pois vem do middleware verificado
 */
export function getClinicaIdFromHeaders(): string {
  const headersList = headers();
  const clinicaId = headersList.get("x-clinica-id");

  if (!clinicaId) {
    throw new Error("x-clinica-id header not found");
  }

  return clinicaId;
}

/**
 * Verifica se usuário tem acesso a clinicaId específica
 */
export async function verifyClinicaAccess(clinicaId: string): Promise<boolean> {
  const userClinicaId = await getClinicaIdFromSession();
  return userClinicaId === clinicaId;
}
```

#### Passo 1.3.2: Criar Database Filters com Prisma Middleware

```typescript
// src/lib/prisma.ts (MODIFICAR ou NOVO)

import { PrismaClient } from "@prisma/client";
import { getClinicaIdFromSession } from "@/lib/multi-tenant";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient().$extends({
    // Middleware automático para multi-tenancy
    query: {
      paciente: {
        async findMany({ args, query }) {
          // Adicionar filtro clinicaId automaticamente
          const clinicaId = await getClinicaIdFromSession().catch(() => null);
          if (clinicaId) {
            args.where = {
              ...args.where,
              clinicaId,
            };
          }
          return query(args);
        },
        async findUnique({ args, query }) {
          const clinicaId = await getClinicaIdFromSession();
          const paciente = await query(args);
          
          // Validar que paciente pertence à clínica do usuário
          if (paciente && paciente.clinicaId !== clinicaId) {
            throw new Error("Access denied");
          }
          return paciente;
        },
      },
      prontuario: {
        async findMany({ args, query }) {
          const clinicaId = await getClinicaIdFromSession().catch(() => null);
          if (clinicaId) {
            args.where = {
              ...args.where,
              prontuario: {
                clinicaId,
              },
            };
          }
          return query(args);
        },
      },
    },
  });

if (process.env.NODE_ENV !== "production")
  globalForPrisma.prisma = prisma;
```

#### Passo 1.3.3: Atualizar API Routes com Multi-tenancy

```typescript
// src/app/api/pacientes/route.ts (MODIFICAR)

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Sempre usar clinicaId da sessão (NUNCA do query param)
    const clinicaId = session.user.clinicaId;

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";
    const limit = 10;
    const skip = (page - 1) * limit;

    // Query com filtro obrigatório de clinicaId
    const [pacientes, total] = await Promise.all([
      prisma.paciente.findMany({
        where: {
          clinicaId, // ← OBRIGATÓRIO
          OR: [
            { nomeCompleto: { contains: search, mode: "insensitive" } },
            { cpf: { contains: search } },
          ],
          deletedAt: null, // Soft delete
        },
        include: {
          _count: { select: { prontuarios: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.paciente.count({
        where: {
          clinicaId,
          OR: [
            { nomeCompleto: { contains: search, mode: "insensitive" } },
            { cpf: { contains: search } },
          ],
          deletedAt: null,
        },
      }),
    ]);

    return NextResponse.json({
      pacientes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/pacientes error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const clinicaId = session.user.clinicaId;

    // Validar com Zod
    // const validated = pacienteSchema.parse(body);

    // Criar com clinicaId obrigatório
    const paciente = await prisma.paciente.create({
      data: {
        ...body,
        clinicaId, // ← Sempre da sessão, nunca do cliente
      },
    });

    return NextResponse.json(paciente, { status: 201 });
  } catch (error) {
    console.error("POST /api/pacientes error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
```

#### Passo 1.3.4: Criar Função Helper para Validar Acesso

```typescript
// src/lib/auth-helpers.ts (NOVO)

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * Wrapper para API routes com autenticação + autorização
 */
export async function withAuth<T>(
  handler: (
    request: Request,
    { session, clinicaId, userId }: {
      session: any;
      clinicaId: string;
      userId: string;
    }
  ) => Promise<Response>
) {
  return async (request: Request) => {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return handler(request, {
      session,
      clinicaId: session.user.clinicaId,
      userId: session.user.id,
    });
  };
}

/**
 * Valida se usuário tem acesso a recurso específico
 */
export async function validateResourceAccess(
  resourceClinicaId: string,
  userId: string
): Promise<boolean> {
  const session = await auth();
  
  if (!session?.user?.id || session.user.id !== userId) {
    return false;
  }

  return session.user.clinicaId === resourceClinicaId;
}

/**
 * Obtém rol do usuário
 */
export function getUserRole(session: any): string {
  return session?.user?.role || "GUEST";
}

/**
 * Verifica se usuário é admin da clínica
 */
export function isClinicAdmin(session: any): boolean {
  return session?.user?.role === "ADMIN";
}
```

**Checklist:**
- [ ] Helper de multi-tenancy criado
- [ ] Prisma middleware configurado
- [ ] Todas as APIs atualizadas com clinicaId obrigatório
- [ ] Testes de isolamento passando
- [ ] Validação de acesso a recursos implementada

**Tempo Estimado:** 2 dias

---

### TAREFA 1.4: Headers de Segurança (1 dia)

**Objetivo:** Proteger contra XSS, Clickjacking, etc.

#### Passo 1.4.1: Atualizar next.config.ts

```typescript
// next.config.ts

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  headers: async () => {
    return [
      {
        source: "/:path*",
        headers: [
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              font-src 'self' https://fonts.gstatic.com;
              img-src 'self' data: https:;
              connect-src 'self' https://api.anthropic.com https://*.supabase.co;
              frame-ancestors 'none';
            `.replace(/\n/g, ""),
          },

          // Prevenção de clickjacking
          {
            key: "X-Frame-Options",
            value: "DENY",
          },

          // Prevenção de MIME type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },

          // Habilitar XSS protection
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },

          // Referrer policy
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },

          // HSTS - Force HTTPS por 1 ano
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },

          // Permissions policy
          {
            key: "Permissions-Policy",
            value: [
              "camera=()",
              "microphone=()",
              "geolocation=()",
              "payment=()",
            ].join(", "),
          },
        ],
      },
    ];
  },

  webpack: (config) => {
    // Otimizações webpack se necessário
    return config;
  },
};

module.exports = nextConfig;
```

#### Passo 1.4.2: Configurar Environment Variables

```bash
# .env.production.local

# ✅ Remover valores hardcoded
# ✅ Usar secrets do Vercel

AUTH_SECRET="gerar com: openssl rand -base64 32"
NEXTAUTH_URL="https://prontuariohof.com"

# CPF encryption
AES_SECRET_KEY="gerar com: openssl rand -hex 32"

# Google Cloud / Vertex AI (base64 da service account)
GOOGLE_APPLICATION_CREDENTIALS_B64="base64 da service account"

# Resend
RESEND_API_KEY="re_..."

# Database
DATABASE_URL="postgresql://user:pass@..."
DIRECT_URL="postgresql://user:pass@..."  # Sem pooling

# Sentry
SENTRY_AUTH_TOKEN="..."
```

**Checklist:**
- [ ] next.config.ts com headers CSP/HSTS
- [ ] .env.production.local seguro
- [ ] Testar headers no navegador (DevTools)
- [ ] HSTS preload registrado

**Tempo Estimado:** 1 dia

---

### TAREFA 1.5: Criptografia AES-256 para Dados Sensíveis (2 dias)

**Objetivo:** CPF e dados sensíveis criptografados em repouso

#### Passo 1.5.1: Criar Utility de Criptografia

```typescript
// src/lib/crypto.ts (NOVO)

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits

/**
 * Encriptar dados com AES-256-GCM
 */
export function encrypt(plaintext: string): string {
  const secretKey = Buffer.from(process.env.AES_SECRET_KEY!, "hex");
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, secretKey, iv);

  let encrypted = cipher.update(plaintext, "utf-8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Formato: iv + authTag + encrypted
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decriptar dados
 */
export function decrypt(ciphertext: string): string {
  const secretKey = Buffer.from(process.env.AES_SECRET_KEY!, "hex");
  const parts = ciphertext.split(":");

  if (parts.length !== 3) {
    throw new Error("Invalid ciphertext format");
  }

  const iv = Buffer.from(parts[0], "hex");
  const authTag = Buffer.from(parts[1], "hex");
  const encrypted = parts[2];

  const decipher = crypto.createDecipheriv(ALGORITHM, secretKey, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf-8");
  decrypted += decipher.final("utf-8");

  return decrypted;
}

/**
 * Hash SHA-256 (para índices)
 */
export function hashData(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Gerar hash de integridade para prontuários
 */
export function generateIntegrityHash(data: any): string {
  const jsonString = JSON.stringify(data);
  return crypto
    .createHash("sha256")
    .update(jsonString)
    .digest("hex");
}
```

#### Passo 1.5.2: Atualizar Prisma Schema

```prisma
// prisma/schema.prisma (MODIFICAR Paciente model)

model Paciente {
  id        String   @id @default(cuid())
  
  // Dados de identidade (criptografados)
  nomeCompleto  String
  cpf           String    // Armazenar criptografado
  cpfHash       String    @unique  // Hash para busca
  
  dataNascimento DateTime
  
  // ... outros campos ...

  clinicaId String
  clinica   Clinica @relation(fields: [clinicaId], references: [id])

  deletedAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([clinicaId])
  @@index([cpfHash])
  @@index([createdAt])
}
```

#### Passo 1.5.3: Criar Hooks Prisma para Auto-criptografia

```typescript
// src/lib/prisma-hooks.ts (NOVO)

import { prisma } from "@/lib/prisma";
import { encrypt, decrypt, hashData } from "@/lib/crypto";

/**
 * Interceptar criação de Paciente para criptografar CPF
 */
export function setupPrismaHooks() {
  // Usar middleware do Prisma v5+
  // Ou usar transaction hook no handler específico
}

/**
 * Helper para criar Paciente com CPF criptografado
 */
export async function createPacienteWithEncryption(data: {
  nomeCompleto: string;
  cpf: string;
  dataNascimento: Date;
  clinicaId: string;
}) {
  const cpfEncrypted = encrypt(data.cpf);
  const cpfHash = hashData(data.cpf);

  return prisma.paciente.create({
    data: {
      ...data,
      cpf: cpfEncrypted,
      cpfHash,
    },
  });
}

/**
 * Helper para buscar Paciente e decriptar CPF
 */
export async function getPacienteWithDecryptedCPF(id: string) {
  const paciente = await prisma.paciente.findUnique({ where: { id } });

  if (!paciente) return null;

  return {
    ...paciente,
    cpf: decrypt(paciente.cpf),
  };
}

/**
 * Buscar por CPF (usando hash)
 */
export async function findPacienteByCPF(cpf: string, clinicaId: string) {
  const cpfHash = hashData(cpf);

  const paciente = await prisma.paciente.findFirst({
    where: {
      cpfHash,
      clinicaId,
      deletedAt: null,
    },
  });

  if (!paciente) return null;

  return {
    ...paciente,
    cpf: decrypt(paciente.cpf),
  };
}
```

#### Passo 1.5.4: Atualizar API de Pacientes com Criptografia

```typescript
// src/app/api/pacientes/route.ts (MODIFICAR POST)

import { createPacienteWithEncryption } from "@/lib/prisma-hooks";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const clinicaId = session.user.clinicaId;

    // ✅ Usar helper que criptografa automaticamente
    const paciente = await createPacienteWithEncryption({
      nomeCompleto: body.nomeCompleto,
      cpf: body.cpf,
      dataNascimento: new Date(body.dataNascimento),
      clinicaId,
    });

    return NextResponse.json(paciente, { status: 201 });
  } catch (error) {
    console.error("POST /api/pacientes error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
```

**Checklist:**
- [ ] Utility de criptografia criada
- [ ] Schema Prisma atualizado (cpfHash)
- [ ] Helpers de auto-criptografia criados
- [ ] API atualizada com helpers
- [ ] Testes de encrypt/decrypt passando
- [ ] Busca por CPF funcional com hash

**Tempo Estimado:** 2 dias

---

### TAREFA 1.6: Logging Estruturado (2 dias)

**Objetivo:** Rastrear todas as operações para auditoria LGPD

#### Passo 1.6.1: Setup Winston Logger

```typescript
// src/lib/logger.ts (NOVO)

import winston from "winston";
import * as Sentry from "@sentry/nextjs";

const isDev = process.env.NODE_ENV === "development";

const logger = winston.createLogger({
  level: isDev ? "debug" : "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: "prontuario-hof",
    environment: process.env.NODE_ENV,
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
    }),
  ],
});

export default logger;
```

#### Passo 1.6.2: Criar Modelo de Audit Log

```prisma
// prisma/schema.prisma (ADICIONAR modelo)

model AuditLog {
  id        String   @id @default(cuid())
  
  // Quem fez
  usuarioId String
  usuario   Profissional @relation(fields: [usuarioId], references: [id])

  // O quê fez
  acao      String  // CREATE, READ, UPDATE, DELETE, LOGIN, EXPORT
  entidade  String  // Paciente, Prontuario, etc
  entidadeId String // ID do recurso afetado

  // Detalhes
  descricao String?
  dadosAntigos Json?
  dadosNovos  Json?
  
  // Contexto
  ipAddress String
  userAgent String
  clinicaId String
  clinica   Clinica @relation(fields: [clinicaId], references: [id])

  createdAt DateTime @default(now())

  @@index([usuarioId])
  @@index([clinicaId])
  @@index([createdAt])
  @@index([entidade])
}
```

#### Passo 1.6.3: Criar Helper para Log de Auditoria

```typescript
// src/lib/audit.ts (NOVO)

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

interface AuditLogInput {
  usuarioId: string;
  acao: "CREATE" | "READ" | "UPDATE" | "DELETE" | "LOGIN" | "EXPORT";
  entidade: string;
  entidadeId: string;
  descricao?: string;
  dadosAntigos?: any;
  dadosNovos?: any;
  clinicaId: string;
}

/**
 * Registrar evento de auditoria
 */
export async function logAudit(input: AuditLogInput) {
  try {
    const headersList = headers();
    const ipAddress =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    await prisma.auditLog.create({
      data: {
        usuarioId: input.usuarioId,
        acao: input.acao,
        entidade: input.entidade,
        entidadeId: input.entidadeId,
        descricao: input.descricao,
        dadosAntigos: input.dadosAntigos,
        dadosNovos: input.dadosNovos,
        clinicaId: input.clinicaId,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to log audit:", error);
    // Não falhar a operação se logging falhar
  }
}

/**
 * Registrar login
 */
export async function logLogin(
  usuarioId: string,
  clinicaId: string,
  success: boolean
) {
  await logAudit({
    usuarioId,
    acao: "LOGIN",
    entidade: "Profissional",
    entidadeId: usuarioId,
    descricao: success ? "Login bem-sucedido" : "Tentativa de login falhou",
    clinicaId,
  });
}

/**
 * Obter logs de auditoria
 */
export async function getAuditLogs(clinicaId: string, limit = 100) {
  return prisma.auditLog.findMany({
    where: { clinicaId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      usuario: { select: { nomeCompleto: true, email: true } },
    },
  });
}
```

#### Passo 1.6.4: Integrar Sentry para Monitoring

```typescript
// src/lib/sentry.ts (NOVO)

import * as Sentry from "@sentry/nextjs";

export function initSentry() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      integrations: [
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  }
}

export { Sentry };
```

**Checklist:**
- [ ] Winston logger configurado
- [ ] Modelo AuditLog criado
- [ ] Helper de auditoria implementado
- [ ] Sentry integrado
- [ ] Logs de login funcionando
- [ ] Visualização de audit logs em API

**Tempo Estimado:** 2 dias

---

### RESUMO FASE 1: FUNDAÇÃO CRÍTICA

**Total:** 10 dias (Sprint 1-2)

| Tarefa | Status | Dias |
|--------|--------|------|
| 1.1 Middleware | ✅ | 1.5 |
| 1.2 Auth Completa | ✅ | 3 |
| 1.3 Multi-tenancy | ✅ | 3 |
| 1.4 Headers Segurança | ✅ | 1 |
| 1.5 Criptografia CPF | ✅ | 2 |
| 1.6 Logging Auditoria | ✅ | 2 |
| **FASE 1 TOTAL** | ✅ | **12.5 dias** |

**Saída esperada ao fim da Fase 1:**
- ✅ Sistema de autenticação 100% funcional
- ✅ Multi-tenancy implementado e testado
- ✅ Headers de segurança corretos
- ✅ CPF criptografado em repouso
- ✅ Audit Log funcional
- ✅ Ready for closed beta

---

## 3.2 FASE 2: CORE BUSINESS (Sprint 3-6) — 30 dias

**Meta:** Sistema funcionando com dados REAIS

### TAREFA 2.1: Pacientes CRUD Completo (3 dias)

**Status:** 🟠 ALTO - Bloqueia Prontuários

#### Implementações:
- [x] GET /api/pacientes (listagem com filtros + paginação)
- [ ] GET /api/pacientes/[id] (detalhe + soft delete check)
- [ ] POST /api/pacientes (criação com validação Zod)
- [ ] PUT /api/pacientes/[id] (edição)
- [ ] DELETE /api/pacientes/[id] (soft delete lógico)
- [ ] GET /api/pacientes/exportar (LGPD portabilidade)

**Tempo:** 3 dias
**Dependências:** Middleware, Multi-tenancy, Criptografia

---

### TAREFA 2.2: Prontuários CRUD Real (8 dias)

**Status:** 🔴 CRÍTICO

Substituir 100% dos mocks por banco de dados real

- [ ] Atualizar schema prontuario
- [ ] GET /api/prontuarios (com filtros, status, período)
- [ ] GET /api/prontuarios/[id] (com eager loading correto)
- [ ] POST /api/prontuarios (multipart form)
- [ ] PUT /api/prontuarios/[id]
- [ ] POST /api/prontuarios/[id]/assinar (persistir assinatura)
- [ ] Atualizar páginas remove mocks

**Tempo:** 8 dias
**Dependências:** Pacientes CRUD

---

### TAREFA 2.3: TCLE Persistência + Hash (4 dias)

**Status:** 🟠 ALTO

- [ ] Modelo TcleAssinatura no Prisma
- [ ] POST /api/tcle (salvar assinatura + hash + IP)
- [ ] Gerar PDF de TCLE assinado
- [ ] Calcular hashIntegridade após assinatura
- [ ] Versionamento de TCLE template

**Tempo:** 4 dias
**Dependências:** Prontuários CRUD

---

### TAREFA 2.4: Procedimentos + Rastreabilidade (4 dias)

**Status:** 🟠 ALTO

- [ ] Modelo Procedimento no Prisma
- [ ] API CRUD completa
- [ ] Busca por lote ANVISA
- [ ] Endpoint de recall (dado lote, listar pacientes)
- [ ] Alerta automático vencimento

**Tempo:** 4 dias

---

### TAREFA 2.5: API Routes Completa (8 dias)

**Status:** 🟠 ALTO

Implementar todas as APIs faltantes com:
- Autenticação obrigatória
- Validação Zod
- Multi-tenancy
- Logging auditoria

**Tempo:** 8 dias

---

### TAREFA 2.6: Audit Log em Todas Operações (3 dias)

**Status:** 🟠 ALTO

Integrar logAudit() em:
- Todos os POST/PUT/DELETE
- Logins (sucesso/falha)
- Exports LGPD
- Mudanças de senha

**Tempo:** 3 dias

---

## 3.3 FASE 3: SECUNDÁRIAS (Sprint 7-12) — 23 dias

Funcionalidades importantes mas não bloqueantes

### TAREFA 3.1: Dashboard com Dados Reais (2 dias)

Substituir stats hardcoded por queries Prisma

### TAREFA 3.2: Relatórios + Export PDF (4 dias)

Implementar queries reais, filtros, export

### TAREFA 3.3: Upload Fotos + Comparador (4 dias)

Integração Uploadthing, grid de fotos, before/after

### TAREFA 3.4: Agenda + Agendamentos (5 dias)

Criar modelo, CRUD, conflitos, notificações

### TAREFA 3.5: Configurações CRUD (3 dias)

Perfil, clínica, senha, dados da clínica

### TAREFA 3.6: Geração PDF (3 dias)

@react-pdf/renderer integrado

---

## 3.4 FASE 4: INTEGRAÇÕES (Sprint 13-16) — 15 dias

### TAREFA 4.1: Agentes IA (6 dias)

Anamnese, TCLE, Relatórios com Vertex AI

### TAREFA 4.2: Google Calendar Sync (3 dias)

Integração com Google Calendar para agenda

### TAREFA 4.3: LGPD Compliance Final (4 dias)

DPO, backup offsite, política privacidade, termos

### TAREFA 4.4: Performance + Testes E2E (8 dias)

Suite completa de testes, otimização

---

# 4. CRONOGRAMA SPRINT-BY-SPRINT

## SPRINT 1 (Semana 1-2): Infraestrutura

```
SEGUNDA-FEIRA        | Middleware (1.1)
TERÇA-FEIRA         | Middleware (1.1)
QUARTA-FEIRA        | Login/Register API (1.2)
QUINTA-FEIRA        | Login/Register API (1.2)
SEXTA-FEIRA         | Code Review + Testes

SEGUNDA-FEIRA (S2)   | Multi-tenancy (1.3)
TERÇA-FEIRA         | Multi-tenancy (1.3)
QUARTA-FEIRA        | Headers CSP + Cripto (1.4 + 1.5)
QUINTA-FEIRA        | Criptografia (1.5)
SEXTA-FEIRA         | Code Review + Deploy Staging
```

**Deliverables:**
- Auth funcional
- Middleware protegendo rotas
- Multi-tenancy isolando clínicas
- CPF criptografado

---

## SPRINT 2 (Semana 3-4): Core Pacientes

```
SEGUNDA-FEIRA        | Pacientes CRUD (2.1)
TERÇA-FEIRA         | Pacientes CRUD (2.1)
QUARTA-FEIRA        | Prontuários CRUD Início (2.2)
QUINTA-FEIRA        | Prontuários CRUD (2.2)
SEXTA-FEIRA         | Code Review

SEGUNDA-FEIRA (S4)   | Prontuários CRUD (2.2)
TERÇA-FEIRA         | Prontuários CRUD Final (2.2)
QUARTA-FEIRA        | Audit Log (2.6)
QUINTA-FEIRA        | Testes de Integração
SEXTA-FEIRA         | Deploy Staging
```

**Deliverables:**
- Pacientes listagem/criação/edição real
- Prontuários CRUD 100% funcional
- Audit log registrando operações

---

## SPRINT 3 (Semana 5-6): Prontuários Avançado

```
SEGUNDA-FEIRA        | TCLE Persistência (2.3)
TERÇA-FEIRA         | TCLE Hash + PDF (2.3)
QUARTA-FEIRA        | Procedimentos (2.4)
QUINTA-FEIRA        | Rastreabilidade (2.4)
SEXTA-FEIRA         | Code Review

SEGUNDA-FEIRA (S6)   | API Routes (2.5)
TERÇA-FEIRA         | API Routes (2.5)
QUARTA-FEIRA        | API Routes (2.5)
QUINTA-FEIRA        | Testes API
SEXTA-FEIRA         | Deploy Staging
```

**Deliverables:**
- TCLE assinado e persistido
- Procedimentos com rastreabilidade
- Todas as API routes implementadas

---

**[Continuar com Sprints 4-16 seguindo padrão...]**

---

# 5. INSTRUÇÕES TÉCNICAS DETALHADAS

## 5.1 Padrão de Implementação

### Git Workflow

```bash
# 1. Criar branch por feature
git checkout -b feat/middleware-auth

# 2. Commits atômicos
git commit -m "feat(auth): implement middleware protection"
git commit -m "test(auth): add middleware tests"
git commit -m "docs(auth): update README with auth flow"

# 3. Push e PR
git push origin feat/middleware-auth

# 4. Merge após review (rebase)
git rebase main
git push origin feat/middleware-auth
```

### Code Review Checklist

```markdown
## Code Review Checklist

### Security
- [ ] Sem dados sensíveis em logs
- [ ] Autenticação verificada
- [ ] Multi-tenancy validado
- [ ] SQL injection impossível
- [ ] XSS preventdo (sanitização)

### Performance
- [ ] N+1 queries evitadas
- [ ] Índices de DB presentes
- [ ] Sem múltiplas requisições
- [ ] Cache implementado onde necessário

### Testing
- [ ] Testes unitários presentes
- [ ] Testes de integração
- [ ] Cobertura >80%
- [ ] Testes passando 100%

### Documentation
- [ ] JSDoc comentários
- [ ] README atualizado
- [ ] Postman collection atualizada
- [ ] TypeScript types corretos

### LGPD/Compliance
- [ ] Audit log registrado
- [ ] CPF/dados sensíveis criptografados
- [ ] Soft delete implementado
- [ ] Sem retenção além do permitido
```

### Padrão de Testes

```typescript
// src/app/api/pacientes/__tests__/route.test.ts

import { POST } from "../route";
import { auth } from "@/lib/auth";

jest.mock("@/lib/auth");

describe("POST /api/pacientes", () => {
  it("should require authentication", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(null);

    const request = new Request("http://localhost:3000/api/pacientes", {
      method: "POST",
      body: JSON.stringify({ nomeCompleto: "Test" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it("should create paciente with clinicaId from session", async () => {
    (auth as jest.Mock).mockResolvedValueOnce({
      user: {
        id: "user-1",
        clinicaId: "clinic-1",
      },
    });

    const request = new Request("http://localhost:3000/api/pacientes", {
      method: "POST",
      body: JSON.stringify({
        nomeCompleto: "João Silva",
        cpf: "12345678900",
        dataNascimento: "1990-01-01",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.clinicaId).toBe("clinic-1");
  });
});
```

---

## 5.2 Setup Desenvolvimento Local

### Pré-requisitos

```bash
# Node.js 18+
node --version

# PostgreSQL 14+
psql --version

# Redis (para cache)
redis-cli --version
```

### Setup Inicial

```bash
# 1. Clone e dependências
git clone git@github.com:dataPalacio/modo-prontuario.git
cd modo-prontuario
npm install

# 2. Setup database
cp .env.example .env.local

# Editar .env.local com database local
DATABASE_URL="postgresql://user:password@localhost:5432/prontuario_dev"

# 3. Prisma setup
npm run db:generate  # Gerar prisma client
npm run db:migrate   # Rodar migrations
npm run db:seed      # Seed dados de teste

# 4. Variables de teste
cat > .env.test.local << 'EOF'
AUTH_SECRET="test-secret-123456789012345678901234567890"
AES_SECRET_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
NEXTAUTH_URL="http://localhost:3000"
RESEND_API_KEY="re_test_123"
EOF

# 5. Rodar dev server
npm run dev

# 6. Em outro terminal - rodar testes
npm run test:watch
```

### Docker Compose (Alternativa)

```yaml
# docker-compose.yml

version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_DB: prontuario_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

```bash
# Iniciar stack
docker-compose up -d

# Setup banco
npm run db:migrate
npm run db:seed

# Dev
npm run dev
```

---

# 6. CHECKLIST DE IMPLEMENTAÇÃO COMPLETO

## FASE 1: FUNDAÇÃO CRÍTICA ✅

### Segurança
- [ ] Middleware de proteção em `/src/middleware.ts`
- [ ] NextAuth v5 fully configured
- [ ] JWT tokens com clinicaId
- [ ] Multi-tenancy em todas APIs
- [ ] CPF criptografado AES-256-GCM
- [ ] Headers de segurança CSP/HSTS
- [ ] Audit logging funcional
- [ ] Sentry monitoring configurado

### Testes P0
- [ ] Testes de middleware (protect routes)
- [ ] Testes de auth (login/register)
- [ ] Testes de multi-tenancy (isolamento)
- [ ] Testes de criptografia (encrypt/decrypt)

---

## FASE 2: CORE BUSINESS ✅

### Pacientes
- [ ] GET /api/pacientes (paginado, filtrado)
- [ ] GET /api/pacientes/[id]
- [ ] POST /api/pacientes (com validação Zod)
- [ ] PUT /api/pacientes/[id]
- [ ] DELETE /api/pacientes/[id] (soft delete)
- [ ] GET /api/pacientes/exportar (LGPD)
- [ ] UI listagem real (sem mocks)
- [ ] UI criação/edição real
- [ ] Busca por CPF funcional

### Prontuários
- [ ] GET /api/prontuarios (filtrado por clínica)
- [ ] GET /api/prontuarios/[id]
- [ ] POST /api/prontuarios (full form)
- [ ] PUT /api/prontuarios/[id]
- [ ] POST /api/prontuarios/[id]/assinar
- [ ] GET /api/prontuarios/[id]/pdf
- [ ] UI listagem real
- [ ] UI criação/edição real
- [ ] UI detalhe com tabs funcional

### TCLE
- [ ] Modelo TcleAssinatura schema
- [ ] POST /api/tcle (persistência)
- [ ] SignatureCanvas capturando assinatura
- [ ] Hash integridade calculado
- [ ] IP + User Agent capturado
- [ ] Geração PDF assinado
- [ ] Versionamento TCLE

### Procedimentos
- [ ] GET/POST /api/procedimentos
- [ ] Busca por lote ANVISA
- [ ] Endpoint recall
- [ ] Alerta vencimento
- [ ] UI listagem
- [ ] UI criação/rastreabilidade

### Audit Log
- [ ] Todos POSTs/PUTs/DELETEs logando
- [ ] Logins registrando
- [ ] GET /api/audit funcional
- [ ] Dashboard auditoria visível

---

## FASE 3: FUNCIONALIDADES SECUNDÁRIAS ✅

### Dashboard
- [ ] Stats reais (COUNT queries)
- [ ] Gráficos atualizados
- [ ] Últimos prontuários real
- [ ] Próximas consultas real

### Relatórios
- [ ] Queries reais via Prisma
- [ ] Filtros período/profissional
- [ ] Export PDF funcional
- [ ] Gráficos Recharts atualizado

### Fotos
- [ ] Uploadthing integrado
- [ ] Upload fotos funcional
- [ ] Associação foto/prontuário
- [ ] Grid galeria
- [ ] Comparador antes/depois
- [ ] Lightbox funcional

### Agenda
- [ ] Modelo Agendamento schema
- [ ] CRUD completo API
- [ ] Detecção conflito horário
- [ ] Notificações email
- [ ] UI calendário funcional

### Configurações
- [ ] Perfil profissional (CRUD)
- [ ] Dados clínica (CRUD)
- [ ] Upload foto perfil
- [ ] Mudança de senha
- [ ] Exportar dados clínica

---

## FASE 4: INTEGRAÇÕES ✅

### Agentes IA
- [ ] Vertex AI client setup
- [ ] Agent anamnese integrado
- [ ] Agent TCLE integrado
- [ ] Agent relatórios integrado
- [ ] UI "Preencher com IA" buttons
- [ ] Fallback se indisponível
- [ ] Rate limiting por clínica

### Google Calendar
- [ ] OAuth setup Google
- [ ] Sync agenda bidirecional
- [ ] Notificações push
- [ ] Webhook Google Calendar

### LGPD Final
- [ ] DPO designado formalmente
- [ ] Termos de Uso publicado
- [ ] Política Privacidade publicado
- [ ] Processo incidente 72h
- [ ] Backup offsite automático
- [ ] Retenção 20 anos implementado
- [ ] Consentimento versioning

---

## TESTES & QA

### Unit Tests (>80% coverage)
- [ ] /src/lib/auth.test.ts
- [ ] /src/lib/crypto.test.ts
- [ ] /src/lib/multi-tenant.test.ts
- [ ] /src/app/api/**/*.test.ts

### Integration Tests
- [ ] Auth flow (login → dashboard)
- [ ] Create paciente → prontuário
- [ ] Multi-tenant isolation
- [ ] Encryption/decryption
- [ ] Audit log registration

### E2E Tests (Playwright)
- [ ] Login flow
- [ ] Create paciente
- [ ] Create prontuário
- [ ] Sign TCLE
- [ ] Export dados
- [ ] Access control (403 scenarios)

### Performance Tests
- [ ] Load test 100 concurrent users
- [ ] DB query optimization
- [ ] Lighthouse score >90
- [ ] Core Web Vitals LCP <2.5s

### Security Tests
- [ ] OWASP Top 10 scan
- [ ] LGPD compliance check
- [ ] Penetration testing básico
- [ ] Header security audit

---

## DOCUMENTAÇÃO

### Técnica
- [ ] README completo (setup, deploy, architecture)
- [ ] API Documentation (Postman collection)
- [ ] Database Schema (ER diagram)
- [ ] Architecture Decision Records (ADR)
- [ ] Deployment Guide (Vercel setup)
- [ ] Security Policy (SECURITY.md atualizado factualmente)
- [ ] Contribution Guide (git workflow, PR process)

### Usuário
- [ ] User Manual (features, screenshots)
- [ ] Video Tutorial (primeiros passos)
- [ ] FAQ (troubleshooting)
- [ ] Termos de Uso
- [ ] Política de Privacidade
- [ ] SLA & Compliance Certification

---

# 7. TESTING & QA STRATEGY

## Pyramid de Testes

```
       ╱╲
      ╱  ╲           E2E Tests (5%)
     ╱────╲          Playwright, User journeys
    ╱      ╲
   ╱────────╲
  ╱          ╲       Integration Tests (20%)
 ╱────────────╲      API routes, DB, auth
╱              ╲
╱────────────────╲
╱                  ╲   Unit Tests (75%)
╱──────────────────╲  Functions, utils, crypto
```

### Unit Tests

```typescript
// Example: Crypto tests

describe("Crypto", () => {
  const plaintext = "12345678900"; // CPF

  it("should encrypt and decrypt", () => {
    const encrypted = encrypt(plaintext);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it("should produce different ciphertexts for same plaintext", () => {
    const cipher1 = encrypt(plaintext);
    const cipher2 = encrypt(plaintext);
    expect(cipher1).not.toBe(cipher2); // IV aleatório
  });

  it("should throw on invalid ciphertext", () => {
    expect(() => decrypt("invalid")).toThrow();
  });

  it("should hash consistently", () => {
    const hash1 = hashData(plaintext);
    const hash2 = hashData(plaintext);
    expect(hash1).toBe(hash2);
  });
});
```

### Integration Tests

```typescript
// Example: Auth flow

describe("Auth Integration", () => {
  it("should complete login flow", async () => {
    // 1. Register
    const registerRes = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        nomeCompleto: "Dr. Silva",
        email: "silva@test.com",
        conselho: "CFM",
        numeroConselho: "123456",
        password: "Test@1234",
      }),
    });

    expect(registerRes.status).toBe(201);
    const { profissional } = await registerRes.json();

    // 2. Login
    const loginRes = await signIn("credentials", {
      email: "silva@test.com",
      password: "Test@1234",
    });

    expect(loginRes.ok).toBe(true);

    // 3. Access protected route
    const dashRes = await fetch("/dashboard");
    expect(dashRes.status).toBe(200);
  });
});
```

### E2E Tests (Playwright)

```typescript
// Example: Create Prontuário flow

test("should create prontuário from start to finish", async ({
  page,
  context,
}) => {
  // 1. Login
  await page.goto("/login");
  await page.fill('input[type="email"]', "medico@test.com");
  await page.fill('input[type="password"]', "password123");
  await page.click('button:has-text("Entrar")');
  await page.waitForURL("/dashboard");

  // 2. Navigate to novo prontuário
  await page.click('a:has-text("Novo Prontuário")');

  // 3. Select paciente
  await page.click('select');
  await page.click('option:has-text("João Silva")');

  // 4. Fill anamnese
  await page.fill('input[name="queixaPrincipal"]', "Dor de cabeça");
  await page.click('button:has-text("Próximo")');

  // 5. Fill procedimento
  await page.fill('input[name="procedimento"]', "Prescrição");
  await page.click('button:has-text("Próximo")');

  // 6. Sign TCLE
  const canvasHandle = await page.$("canvas");
  // Simular assinatura
  await page.mouse.move(100, 100);
  await page.mouse.down();
  await page.mouse.move(200, 150);
  await page.mouse.up();

  // 7. Finalizar
  await page.click('button:has-text("Finalizar Prontuário")');
  await page.waitForURL("/prontuarios/*");

  // 8. Verify criação
  const status = await page.textContent('[data-testid="status"]');
  expect(status).toContain("ASSINADO");
});
```

---

# 8. DOCUMENTAÇÃO & DEPLOYMENT

## README Padrão

```markdown
# Prontuário HOF

Sistema de Prontuário Eletrônico conforme LGPD/CFM.

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+
- npm 9+

### Setup Local

\`\`\`bash
git clone git@github.com:dataPalacio/modo-prontuario.git
cd modo-prontuario
npm install
cp .env.example .env.local
# Editar .env.local com suas credenciais
npm run db:migrate
npm run dev
\`\`\`

Acesso: http://localhost:3000

### Deploy em Produção

Ver [DEPLOY.md](./docs/DEPLOY.md)

## 📁 Estrutura do Projeto

\`\`\`
src/
├── app/              # Next.js App Router
├── components/       # React components
├── lib/              # Utilities (auth, db, crypto)
├── types/            # TypeScript types
└── styles/           # Global styles

prisma/
├── schema.prisma     # Database schema
└── migrations/       # Schema migrations

docs/
├── API.md           # API Documentation
├── DEPLOY.md        # Deployment guide
└── SECURITY.md      # Security policy

tests/
├── unit/            # Unit tests
├── integration/     # Integration tests
└── e2e/             # E2E tests (Playwright)
\`\`\`

## 🔐 Security

- Autenticação via NextAuth v5
- Criptografia AES-256-GCM para CPF
- Multi-tenancy completo
- Audit logging de todas operações
- Conformidade LGPD/CFM

## 📚 Documentação

- [API](./docs/API.md) - Postman collection + endpoints
- [Database](./docs/DATABASE.md) - Schema e queries
- [Architecture](./docs/ARCHITECTURE.md) - Decision records
- [Contributing](./CONTRIBUTING.md) - Development guide

## 📝 License

Proprietary - Datapálacio © 2026
```

## Deployment Checklist (Vercel)

```markdown
# Pre-Deployment Checklist

## 1. Code Quality
- [ ] npm run lint (zero errors)
- [ ] npm run type-check (zero errors)
- [ ] npm run test (100% passing)
- [ ] npm run build (zero errors)

## 2. Security
- [ ] .env.production com valores real (secrets)
- [ ] DATABASE_URL sem valor local
- [ ] AUTH_SECRET gerado com `openssl rand -base64 32`
- [ ] GOOGLE_APPLICATION_CREDENTIALS_B64 base64 encoded
- [ ] Nenhuma chave privada no código

## 3. Database
- [ ] Backup antes de deploy (pg_dump)
- [ ] Migrations testadas em staging
- [ ] Schema.prisma alinhado com migrations
- [ ] Indices presentes

## 4. Monitoring
- [ ] Sentry DSN configurado
- [ ] Log aggregation setup
- [ ] Alertas de erro configurados
- [ ] Uptime monitoring ativo

## 5. Documentation
- [ ] API documentation atualizada
- [ ] Runbook para incidents
- [ ] Contato de suporte documentado
- [ ] SLA policy documentada

## 6. Vercel Setup
- [ ] Project linking
- [ ] Environment variables
- [ ] Build command: npm run build
- [ ] Start command: next start
- [ ] Cron jobs se necessário

## Deploy

\`\`\`bash
# 1. Final checks
npm run lint
npm run type-check
npm run test

# 2. Build
npm run build

# 3. Push para main
git push origin main

# 4. Vercel auto-deploys
# Monitorar em https://vercel.com/datapalacios-projects
\`\`\`

## Post-Deployment

- [ ] Verificar health check (GET /api/health)
- [ ] Testar login em produção
- [ ] Verificar logs do Sentry
- [ ] Comunicar deploy ao time
- [ ] Ativar smoke tests
```

---

# CONCLUSÃO

Este plano de implementação fornece uma roadmap completa de **16 semanas (81 dias)** para transformar o Prontuário HOF de protótipo visual para **sistema pronto para produção com dados reais de pacientes**.

**Próximas ações imediatas:**

1. ✅ Revisar este documento com o time
2. ✅ Setup ambiente de desenvolvimento (Docker Compose)
3. ✅ Criar repositório de issues no GitHub (roadmap público)
4. ✅ Agendar kick-off da Fase 1
5. ✅ Preparar staging environment na Vercel
6. ✅ Comunicar timeline a stakeholders

**Contato para dúvidas técnicas:** Documentação completa em `/docs` do repositório.

---

*Plano de Implementação | Prontuário HOF | v1.0 | 15/03/2026*
*Confidencial - Uso exclusivo da equipe técnica*
