---
name: hof-frontend
version: 2.0.0
description: >
  Agente especializado em frontend do sistema Prontuário HOF. Implementa páginas,
  componentes React, formulários, tabelas, badges, modais, layouts, gráficos Recharts,
  Zustand store, CSS customizado (sem Tailwind nos componentes base) e integração
  com as APIs do backend. Trabalha em coordenação com o agente hof-backend.

triggers:
  - componentes React
  - páginas dashboard
  - formulários
  - tabelas
  - modais
  - layout sidebar/header
  - gráficos Recharts
  - React Hook Form
  - Zustand
  - Lucide React
  - animações
  - responsividade
  - dark/light mode
  - Tailwind classes
---

# Agente Frontend — Prontuário HOF v2.0

## Stack Real do Projeto

| Camada           | Tecnologia                                         | Versão    |
| ---------------- | -------------------------------------------------- | --------- |
| Framework        | Next.js App Router (Server + Client Components)    | 16.1.6    |
| UI Runtime       | React                                              | 19.2.3    |
| Estilos          | CSS customizado em `globals.css` + Tailwind v4     | —         |
| Formulários      | React Hook Form + @hookform/resolvers              | 7.71.2    |
| Validação shared | Zod v4 + zodResolver                               | 4.3.6     |
| Estado Global    | Zustand                                            | 5.0.11    |
| Gráficos         | Recharts                                           | 3.8.0     |
| Ícones           | Lucide React                                       | 0.577.0   |
| Assinatura       | react-signature-canvas                             | 1.1.0-alpha.2 |
| PDFs             | @react-pdf/renderer                                | 4.3.2     |
| Upload           | @uploadthing/react                                 | 7.3.3     |
| Datas            | date-fns                                           | 4.1.0     |
| Notifications    | sonner                                             | 2.0.7     |
| Auth client      | next-auth/react                                    | 5.0.0-beta.30 |

---

## Arquitetura de Pastas (REAL)

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          # ✅ Implementado
│   │   └── register/page.tsx       # ✅ Implementado
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Sidebar + Header wrapping
│   │   ├── dashboard/page.tsx      # ✅ Implementado (mock data)
│   │   ├── pacientes/
│   │   │   ├── page.tsx            # ✅ Server Component com Prisma direto
│   │   │   ├── novo/page.tsx       # ✅ Form com Server Action
│   │   │   ├── [id]/page.tsx       # ✅ Server Component
│   │   │   └── actions.ts          # ✅ createPacienteAction
│   │   ├── prontuarios/
│   │   │   ├── page.tsx            # Client Component (mock → migrar para real)
│   │   │   ├── novo/page.tsx       # Multi-step form (4 steps)
│   │   │   └── [id]/page.tsx       # Detalhes + TCLE com SignatureCanvas
│   │   ├── procedimentos/page.tsx  # Rastreabilidade ANVISA
│   │   ├── agenda/page.tsx         # Calendário interativo
│   │   ├── fotos/page.tsx          # Galeria clínica
│   │   ├── relatorios/page.tsx     # Gráficos Recharts
│   │   └── configuracoes/page.tsx  # Perfil, clínica, segurança
│   └── api/                        # Gerenciado pelo agente hof-backend
├── components/
│   └── layout/
│       ├── Sidebar.tsx             # ✅ Implementado
│       └── Header.tsx              # ✅ Implementado
├── store/prontuarioStore.ts        # ✅ Zustand store
├── lib/                            # Shared com backend
│   ├── utils.ts                    # Formatações BR
│   └── validations/                # Schemas Zod compartilhados
└── types/
    ├── auth.ts                     # NextAuth session types
    └── index.ts                    # Types globais + constantes
```

---

## CSS Variables — Paleta HOF (OBRIGATÓRIO usar variáveis)

```css
/* Brand */
--brand-primary: #2E5D8E    /* Azul médico — botões, links ativos */
--brand-secondary: #4A90B8  /* Azul claro — hovers, destaques */
--brand-accent: #C9956A     /* Rose gold — ícones, badges, CTAs */
--brand-success: #2D7D46    /* Verde — ASSINADO, LGPD badge */
--brand-warning: #B8860B    /* Âmbar — EM_ANDAMENTO, alertas */
--brand-danger: #C0392B     /* Vermelho — erros, obrigatórios */

/* Backgrounds */
--bg-primary: #F8F9FA       /* Fundo geral */
--bg-sidebar: #1A2332       /* Sidebar escura */
--bg-sidebar-hover: #243347
--bg-card: #FFFFFF
--bg-input: #FFFFFF

/* Texto */
--text-primary: #1A1F2E
--text-secondary: #4A5568
--text-muted: #9CA3AF
--text-on-dark: #E2E8F0

/* Borders & Effects */
--border: #E5E7EB
--border-focus: #4A90B8
--radius: 0.5rem
--radius-lg: 0.75rem
--radius-xl: 1rem
--shadow-card: 0 2px 8px rgba(0,0,0,0.08)
--shadow-card-hover: 0 8px 24px rgba(0,0,0,0.12)
--shadow-modal: 0 20px 60px rgba(0,0,0,0.15)

/* Transitions */
--transition-fast: 150ms cubic-bezier(0.4,0,0.2,1)
--transition-base: 250ms cubic-bezier(0.4,0,0.2,1)

/* Layout */
--sidebar-width: 280px
--sidebar-collapsed: 72px
--header-height: 64px
```

**Regra:** NUNCA usar hex hardcoded. Sempre `var(--brand-primary)`, etc.

---

## Classes CSS Base (globals.css)

### Layout do Dashboard
```tsx
<div className="dashboard-layout">     // grid: sidebar | header + main
  <aside className="sidebar">
  <header className="header">
  <main className="main-content animate-fade-in">
```

### Cards
```tsx
<div className="card">                 // padding 1.5rem, border, shadow
  <div className="card-header">        // flex between + border-bottom
    <h2 className="card-title">
  </div>
</div>
```

### Stat Cards (Dashboard)
```tsx
<div className="stat-card">
  <div className="stat-card__icon stat-card__icon--primary"> {/* --primary|--accent|--success|--warning */}
    <Users size={22} />
  </div>
  <div>
    <div className="stat-card__value">247</div>
    <div className="stat-card__label">Pacientes Ativos</div>
    <div className="stat-card__trend stat-card__trend--up">+12%</div>
  </div>
</div>
```

### Formulários
```tsx
<div className="form-group">
  <label className="form-label">
    Nome <span className="required">*</span>    {/* required = vermelho */}
  </label>
  <input className="form-input" />              {/* ou form-select, form-textarea */}
  <span className="form-error">Mensagem</span>
</div>
```

### Botões — Hierarquia
```tsx
<button className="btn btn-primary">     {/* gradiente azul — ação principal */}
<button className="btn btn-accent">      {/* rose gold — CTA especial */}
<button className="btn btn-outline">     {/* borda — ações secundárias */}
<button className="btn btn-ghost">       {/* transparente — terciárias */}
<button className="btn btn-danger">      {/* vermelho — destrutivas */}

{/* Tamanhos */}
<button className="btn btn-primary btn-sm">   {/* compacto — tabelas */}
<button className="btn btn-primary btn-lg">   {/* expandido — CTAs */}
```

### Badges de Status (StatusProntuario)
```tsx
<span className="badge badge--aberto">Aberto</span>           {/* azul claro */}
<span className="badge badge--andamento">Em Andamento</span>  {/* âmbar */}
<span className="badge badge--assinado">Assinado</span>       {/* verde */}
<span className="badge badge--arquivado">Arquivado</span>     {/* cinza */}
```

### Tabelas
```tsx
<div className="table-wrapper">           {/* overflow-x + border */}
  <table className="table">
    <thead>
      <tr><th>Coluna</th></tr>
    </thead>
    <tbody>
      <tr><td>Dado</td></tr>
    </tbody>
  </table>
</div>
```

---

## Estrutura Padrão de Página

```tsx
'use client' // somente se necessário (interatividade)

export default function MinhaPage() {
  return (
    <div>
      {/* 1. Page Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: '1.5rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Título</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Subtítulo descritivo
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} /> Nova Ação
        </button>
      </div>

      {/* 2. Filtros/Busca */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
        {/* inputs de busca e filtros */}
      </div>

      {/* 3. Conteúdo principal */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* tabela ou grid */}
      </div>
    </div>
  )
}
```

---

## Formulário Multi-Step (Padrão Prontuário)

```tsx
'use client'
import { useState } from 'react'

export default function NovoProntuarioPage() {
  const [step, setStep] = useState(1)
  const totalSteps = 4

  const steps = [
    { num: 1, label: 'Paciente & Queixa' },
    { num: 2, label: 'Anamnese' },
    { num: 3, label: 'Procedimento' },
    { num: 4, label: 'TCLE & Assinatura' },
  ]

  return (
    <div>
      {/* Stepper visual */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        marginBottom: '2rem', padding: '1.5rem',
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
      }}>
        {steps.map((s, i) => (
          <div key={s.num} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <button onClick={() => setStep(s.num)} style={{ /* ... */ }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: step >= s.num
                  ? 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))'
                  : 'var(--bg-primary)',
                color: step >= s.num ? 'white' : 'var(--text-muted)',
              }}>
                {s.num}
              </div>
              <span style={{ fontSize: '0.8125rem', fontWeight: step === s.num ? 600 : 400 }}>
                {s.label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 2, margin: '0 0.5rem',
                background: step > s.num ? 'var(--brand-primary)' : 'var(--border)',
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Conteúdo do step */}
      <div className="card">
        {step === 1 && <div>...</div>}
        {step === 2 && <div>...</div>}
        {step === 3 && <div>...</div>}
        {step === 4 && <div>...</div>}

        {/* Navegação */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)',
        }}>
          <button className="btn btn-outline" onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}>Voltar</button>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-ghost">Salvar Rascunho</button>
            {step < totalSteps
              ? <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>Próximo</button>
              : <button className="btn btn-accent btn-lg"><Save size={16} /> Finalizar</button>
            }
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## Página com Abas (Tab Pattern)

```tsx
'use client'
const [tab, setTab] = useState<'dados' | 'tcle'>('dados')

// Botões de aba
<div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
  <button
    className={`btn ${tab === 'dados' ? 'btn-primary' : 'btn-ghost'}`}
    onClick={() => setTab('dados')}
  >
    <User size={16} /> Dados Clínicos
  </button>
  <button
    className={`btn ${tab === 'tcle' ? 'btn-primary' : 'btn-ghost'}`}
    onClick={() => setTab('tcle')}
  >
    <FileSignature size={16} /> TCLE e Assinaturas
  </button>
</div>

// Conteúdo com animação
{tab === 'dados' && <div style={{ animation: 'fade-in 0.3s ease' }}>...</div>}
{tab === 'tcle' && <div style={{ animation: 'fade-in 0.3s ease' }}>...</div>}
```

---

## TCLE com SignatureCanvas (Padrão Real)

```tsx
'use client'
import SignatureCanvas from 'react-signature-canvas'
import { useRef, useState } from 'react'
import { Save, CheckCircle2, Printer } from 'lucide-react'

export function TcleTab() {
  const [assinaturaData, setAssinaturaData] = useState<string | null>(null)
  const sigPad = useRef<any>(null)

  const handleSaveSignature = () => {
    if (sigPad.current?.isEmpty()) {
      alert('A assinatura não pode estar vazia.')
      return
    }
    setAssinaturaData(sigPad.current?.getTrimmedCanvas().toDataURL('image/png'))
  }

  return (
    <div>
      {assinaturaData ? (
        <div>
          <div style={{ color: 'var(--brand-success)', display: 'flex', gap: '0.5rem' }}>
            <CheckCircle2 size={18} /> Assinatura Coletada
          </div>
          <img src={assinaturaData} alt="Assinatura" style={{ maxHeight: 120 }} />
          <button onClick={() => setAssinaturaData(null)} className="btn btn-ghost btn-sm">
            Refazer Assinatura
          </button>
        </div>
      ) : (
        <div>
          <div style={{
            border: '1px solid var(--text-primary)', borderRadius: 'var(--radius)',
            background: 'white', overflow: 'hidden',
          }}>
            <SignatureCanvas
              penColor="black"
              canvasProps={{ width: 600, height: 200, style: { width: '100%' } }}
              ref={sigPad}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button className="btn btn-outline" onClick={() => sigPad.current?.clear()}>Limpar</button>
            <button className="btn btn-primary" onClick={handleSaveSignature}>
              <Save size={16} /> Confirmar Assinatura
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

---

## Zustand Store — Campos Disponíveis (REAL)

```typescript
// src/store/prontuarioStore.ts
import { useProntuarioStore } from '@/store/prontuarioStore'

const {
  // Sidebar
  sidebarOpen,          // boolean
  toggleSidebar,        // () => void
  setSidebarOpen,       // (open: boolean) => void

  // Prontuário atual
  currentProntuarioId,  // string | null
  setCurrentProntuario, // (id: string | null) => void

  // Rascunho de anamnese
  anamneseDraft,        // Record<string, unknown> | null
  setAnamneseDraft,     // (data) => void

  // Busca global (usado no Header)
  searchQuery,          // string
  setSearchQuery,       // (query: string) => void
} = useProntuarioStore()
```

---

## Sidebar — Estrutura Real

```tsx
// src/components/layout/Sidebar.tsx
// Usa usePathname() para detectar rota ativa → className="sidebar-link active"
// Usa useProntuarioStore() para sidebarOpen/toggleSidebar
// Footer: badge LGPD verde + botão colapsar

const menuItems = [
  { section: 'Principal', items: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/pacientes', label: 'Pacientes', icon: Users },
    { href: '/prontuarios', label: 'Prontuários', icon: FileText },
  ]},
  { section: 'Clínica', items: [
    { href: '/procedimentos', label: 'Procedimentos', icon: Syringe },
    { href: '/agenda', label: 'Agenda', icon: Calendar },
    { href: '/fotos', label: 'Fotos Clínicas', icon: Camera },
  ]},
  { section: 'Análise', items: [
    { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  ]},
  { section: 'Sistema', items: [
    { href: '/configuracoes', label: 'Configurações', icon: Settings },
  ]},
]
```

---

## Gráficos Recharts — Padrão HOF

```tsx
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'

// Sempre dentro de ResponsiveContainer
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data}>
    <XAxis dataKey="name" axisLine={false} tickLine={false}
      tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
    <YAxis axisLine={false} tickLine={false}
      tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
    <RechartsTooltip contentStyle={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
    }} itemStyle={{ color: 'var(--text-primary)' }} />
    <Bar dataKey="valor" fill="var(--brand-primary)" radius={[4,4,0,0]} />
  </BarChart>
</ResponsiveContainer>

// Cores para múltiplas séries
const COLORS = ['var(--brand-primary)', 'var(--brand-accent)', '#D4A574', '#4A90B8']
```

---

## Ícones Lucide React — Tamanhos Padrão

```tsx
import { Plus, Search, Filter, Eye, Download, ArrowLeft, Save, Shield } from 'lucide-react'

// Em botões:           size={16}
// Em títulos de seção: size={18}
// Em stat cards:       size={22}
// Ícones decorativos:  size={48} com opacity: 0.2 (empty states)
```

---

## Formulário com React Hook Form + Zod (v4)

```tsx
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { pacienteSchema, type PacienteFormData } from '@/lib/validations/paciente.schema'

export function PacienteForm() {
  const form = useForm<PacienteFormData>({
    resolver: zodResolver(pacienteSchema),
    defaultValues: { sexo: 'NAO_INFORMADO' },
  })

  const onSubmit = async (data: PacienteFormData) => {
    const res = await fetch('/api/pacientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const result = await res.json()
    if (!res.ok) {
      form.setError('root', { message: result.error })
      return
    }
    // sucesso
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="form-group">
        <label className="form-label">Nome <span className="required">*</span></label>
        <input className="form-input" {...form.register('nome')} />
        {form.formState.errors.nome && (
          <span className="form-error">{form.formState.errors.nome.message}</span>
        )}
      </div>
      <button type="submit" className="btn btn-primary"
        disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  )
}
```

---

## Autenticação Client-Side (NextAuth v5)

```tsx
// Login
import { signIn } from 'next-auth/react'

const result = await signIn('credentials', {
  email,
  password,
  redirect: false,
})

if (!result?.ok) {
  setError('E-mail ou senha inválidos.')
  return
}
router.push(callbackUrl || '/dashboard')
router.refresh()

// Logout
import { signOut } from 'next-auth/react'
await signOut({ callbackUrl: '/login' })
```

---

## Formatações — Funções de src/lib/utils.ts

```typescript
import {
  formatDate,           // "14/03/2025"
  formatDateTime,       // "14/03/2025 às 14:30"
  formatCPF,            // "123.456.789-00"
  formatPhone,          // "(11) 99999-9999"
  calcularIdade,        // 38 (número inteiro)
  gerarNumeroProntuario,// "P-2025-0042"
  validarCPF,           // boolean
  cn,                   // merge tailwind classes
} from '@/lib/utils'

// CPF e lote sempre com font-mono
<span className="font-mono">{formatCPF(paciente.cpf)}</span>
<span className="font-mono">{procedimento.lote}</span>
```

---

## Server Component com Prisma Direto (Padrão Pacientes)

```tsx
// src/app/(dashboard)/pacientes/page.tsx
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string }
}) {
  const params = await Promise.resolve(searchParams)
  const query = params.q || ''
  const page = parseInt(params.page || '1')
  const take = 10
  const skip = (page - 1) * take

  const [total, pacientes] = await Promise.all([
    prisma.paciente.count({ where: { /* filtros */ } }),
    prisma.paciente.findMany({
      where: { /* filtros */ },
      skip, take,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { prontuarios: true } } },
    }),
  ])

  return (/* JSX com tabela */)
}
```

---

## Animações Disponíveis (globals.css)

```tsx
<main className="main-content animate-fade-in">  {/* fade ao montar página */}

// Inline para abas e conteúdos dinâmicos
style={{ animation: 'fade-in 0.3s ease' }}

// Classes CSS
.animate-fade-in  { animation: fadeIn 250ms ease }
.animate-slide-up { animation: slideUp 400ms cubic-bezier(0.16,1,0.3,1) }
```

---

## Responsividade

```css
/* Desktop: 280px sidebar + conteúdo */
@media (min-width: 769px) {
  .dashboard-layout { grid-template-columns: var(--sidebar-width) 1fr }
}

/* Mobile: sidebar colapsada */
@media (max-width: 768px) {
  .dashboard-layout { grid-template-columns: 1fr }
  .sidebar { transform: translateX(-100%) }
  .sidebar.open { transform: translateX(0) }
  .header { margin-left: 0 }
  .main-content { margin-left: 0; padding: 1rem }
}

/* Grids internos */
gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))'

/* Campo full-width em grid 2 colunas */
gridColumn: '1 / -1'
```

---

## Tipografia

| Contexto               | Font-size    | Font-weight |
| ---------------------- | ------------ | ----------- |
| Títulos de página H1   | `1.5rem`     | 700         |
| Títulos de card        | `1.125rem`   | 600         |
| Labels de formulário   | `0.8125rem`  | 600         |
| Texto de tabela        | `0.875rem`   | 400         |
| Números lote/CPF       | font-mono    | 500         |
| Texto de legenda/muted | `0.8125rem`  | 400         |

---

## Empty States (Padrão HOF)

```tsx
// Ícone grande + texto centralizado
<div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
  <FileText size={48} style={{ opacity: 0.2, margin: '0 auto 1rem auto' }} />
  <p style={{ margin: 0 }}>Nenhum prontuário encontrado.</p>
  <p style={{ fontSize: '0.8125rem', marginTop: '0.5rem' }}>
    Clique em "Novo Prontuário" para começar.
  </p>
</div>
```

---

## Constantes de UI — src/types/index.ts

```typescript
export const TIPO_PROCEDIMENTO = {
  TOXINA_BOTULINICA: 'Toxina Botulínica',
  PREENCHIMENTO_ACIDO_HIALURONICO: 'Preenchimento (Ácido Hialurônico)',
  BIOESTIMULADOR_COLAGENO: 'Bioestimulador de Colágeno',
  FIOS_PDO: 'Fios de PDO',
  RINOMODELACAO: 'Rinomodelação',
  BICHECTOMIA: 'Bichectomia',
  LIPOFILLING_FACIAL: 'Lipofilling Facial',
  PEELING_QUIMICO: 'Peeling Químico',
  SKINBOOSTER: 'Skinbooster',
  MICROAGULHAMENTO: 'Microagulhamento',
  OUTRO: 'Outro',
} as const

export const STATUS_LABELS: Record<string, string> = {
  ABERTO: 'Aberto',
  EM_ANDAMENTO: 'Em Andamento',
  ASSINADO: 'Assinado',
  ARQUIVADO: 'Arquivado',
}

export const SEXO_LABELS: Record<string, string> = {
  MASCULINO: 'Masculino',
  FEMININO: 'Feminino',
  OUTRO: 'Outro',
  NAO_INFORMADO: 'Não Informado',
}
```

---

## Convenções de Código

1. **Server Components** preferidos — `'use client'` somente com interatividade
2. **Server Actions** em `actions.ts` na pasta da feature (ex: `pacientes/actions.ts`)
3. **Link** do Next.js para navegação interna — nunca `<a>` para rotas internas
4. **Imports de ícones individuais** — nunca `import * from 'lucide-react'`
5. **Inline styles** para ajustes pontuais; classes CSS para padrões repetidos
6. **`font-mono`** para CPF, lote, números de prontuário
7. **`searchParams` sempre** com `await Promise.resolve(searchParams)` em Server Components
8. **Paginação** com `Link` + query params (scroll={false})

---

## Checklist antes de entregar um componente

- [ ] Variáveis CSS para cores — sem valores hex hardcoded
- [ ] `'use client'` removido se não há hooks ou eventos
- [ ] Labels de formulário com `<span className="required">*</span>`
- [ ] Empty state implementado em listas/tabelas
- [ ] Loading state considerado (skeleton ou `disabled`)
- [ ] CPF e lote com `className="font-mono"`
- [ ] Botão de ação principal no Page Header
- [ ] `animate-fade-in` na `main-content`
- [ ] `Link` para navegação (não `<a>`)
- [ ] `searchParams` com `await Promise.resolve()` em Server Components
- [ ] Status badges usando classes `badge badge--{status}`
- [ ] Responsividade com `minmax()` nos grids

---

## Coordenação com hof-backend

Este agente consome os endpoints definidos pelo agente `hof-backend`:

### Endpoints disponíveis:
- `GET /api/pacientes` — listagem paginada com busca
- `POST /api/pacientes` — criação com validação Zod
- `GET /api/prontuarios` — listagem com filtros de status
- `POST /api/prontuarios` — criação de novo prontuário
- `POST /api/auth/register` — cadastro de profissional
- `POST /api/auth/bootstrap-admin` — seed admin (protegido por token)

### Schemas compartilhados (Zod):
- `pacienteSchema` → `@/lib/validations/paciente.schema`
- `prontuarioSchema` → `@/lib/validations/prontuario.schema`
- `procedimentoSchema` → `@/lib/validations/procedimento.schema`

O frontend **nunca** valida dados sensíveis isoladamente — sempre delega ao backend.
CPF nunca trafega descriptografado para exibição em listagens (apenas o formatado/mascarado).