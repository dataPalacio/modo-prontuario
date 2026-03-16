---
name: hof-frontend
description: >
  Padrões, componentes e fluxos de UI para o sistema Prontuário HOF (Harmonização Orofacial).
  Use SEMPRE que for criar, editar ou refatorar qualquer componente React, página, formulário,
  tabela, modal, badge ou layout do projeto. Também deve ser ativado em tarefas de estilização,
  responsividade, animações, dark/light mode, novos módulos de dashboard, fluxos multi-step e
  integração de bibliotecas como Recharts, React Hook Form, Zustand e Lucide React.
  Inclui padrões de acessibilidade, convenções de nomenclatura e estrutura de pastas do projeto.
---
# Frontend — Prontuário HOF

## Visão Geral da Arquitetura de UI

O projeto usa **Next.js 14 App Router** com CSS customizado (sem Tailwind para componentes base).
As páginas vivem em `src/app/(dashboard)/` e os componentes reutilizáveis em `src/components/`.

```
src/
├── app/
│   ├── (auth)/login/          # Página pública de login
│   └── (dashboard)/           # Todas as rotas autenticadas
│       ├── layout.tsx          # Sidebar + Header wrapping
│       ├── dashboard/page.tsx
│       ├── pacientes/
│       ├── prontuarios/
│       ├── procedimentos/
│       ├── agenda/
│       ├── fotos/
│       ├── relatorios/
│       └── configuracoes/
├── components/
│   └── layout/
│       ├── Sidebar.tsx
│       └── Header.tsx
└── store/prontuarioStore.ts    # Zustand — estado global
```

---

## Paleta de Cores (CSS Variables)

**Sempre usar variáveis CSS, nunca valores hardcoded.**

```css
/* Brand */
--brand-primary: #2E5D8E    /* Azul médico — botões primários, links ativos */
--brand-secondary: #4A90B8  /* Azul claro — hovers, destaques secundários */
--brand-accent: #C9956A     /* Rose gold — ícones, badges especiais, CTAs */
--brand-success: #2D7D46    /* Verde clínico — status ASSINADO, LGPD badge */
--brand-warning: #B8860B    /* Âmbar — status EM_ANDAMENTO, alertas */
--brand-danger: #C0392B     /* Vermelho — erros, campos obrigatórios */

/* Backgrounds */
--bg-primary: #F8F9FA       /* Fundo geral da página */
--bg-sidebar: #1A2332       /* Sidebar escura */
--bg-card: #FFFFFF          /* Cards e formulários */

/* Texto */
--text-primary: #1A1F2E
--text-secondary: #4A5568
--text-muted: #9CA3AF

/* Borders */
--border: #E5E7EB
--border-focus: #4A90B8
```

---

## Classes CSS Base (globals.css)

### Layout

```tsx
// Wrapper principal do dashboard
<div className="dashboard-layout">   // grid: sidebar | header + main
<aside className="sidebar">
<header className="header">
<main className="main-content animate-fade-in">
```

### Cards

```tsx
<div className="card">              // card com padding 1.5rem
<div className="card-header">       // flex between + border-bottom
<h2 className="card-title">
```

### Stat Cards (Dashboard)

```tsx
<div className="stat-card">
  <div className="stat-card__icon stat-card__icon--primary">  // --primary | --accent | --success | --warning
  <div className="stat-card__value">247</div>
  <div className="stat-card__label">Pacientes Ativos</div>
  <div className="stat-card__trend stat-card__trend--up">+12%</div>
```

### Formulários

```tsx
<div className="form-group">
  <label className="form-label">
    Nome <span className="required">*</span>   // required = vermelho
  </label>
  <input className="form-input" />             // ou form-select, form-textarea
  <span className="form-error">Mensagem</span>
</div>
```

### Botões

```tsx
// Hierarquia de botões — use nesta ordem de importância:
<button className="btn btn-primary">          // gradiente azul — ação principal
<button className="btn btn-accent">           // gradiente rose gold — CTA especial
<button className="btn btn-outline">          // borda — ações secundárias
<button className="btn btn-ghost">            // transparente — ações terciárias
<button className="btn btn-danger">           // vermelho — ações destrutivas

// Tamanhos
<button className="btn btn-primary btn-sm">   // compacto — tabelas, toolbars
<button className="btn btn-primary btn-lg">   // expandido — CTAs de página
```

### Badges de Status

```tsx
// Mapeamento de StatusProntuario para classe:
<span className="badge badge--aberto">Aberto</span>        // azul claro
<span className="badge badge--andamento">Em Andamento</span> // âmbar
<span className="badge badge--assinado">Assinado</span>    // verde
<span className="badge badge--arquivado">Arquivado</span>  // cinza
```

### Tabelas

```tsx
<div className="table-wrapper">   // overflow-x: auto + border
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

## Tipografia

- **Display / Títulos de página**: `font-size: 1.5rem; font-weight: 700`
- **Card title**: `font-size: 1.125rem; font-weight: 600`
- **Labels de form**: `font-size: 0.8125rem; font-weight: 600`
- **Texto de tabela**: `font-size: 0.875rem`
- **Números de lote/CPF**: sempre `className="font-mono"` (JetBrains Mono)

---

## Padrões de Página

### Estrutura padrão de listagem com busca

```tsx
export default function MinhaPage() {
  return (
    <div>
      {/* 1. Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
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

      {/* 2. Filtros */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
        {/* busca + filtros */}
      </div>

      {/* 3. Conteúdo principal */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* tabela ou grid */}
      </div>
    </div>
  )
}
```

### Formulário multi-step (padrão Prontuário)

Stepper com 4 etapas: estado em `useState(1)`, total `4`.
Cada step renderiza condicionalmente dentro do card.
Navegação: botões "Voltar" / "Próximo" / "Finalizar" no rodapé do card com `border-top`.

### Página de detalhe com abas

```tsx
const [tab, setTab] = useState<'dados' | 'tcle'>('dados')
// Botões com btn-primary quando ativo, btn-ghost quando inativo
// Conteúdo com: style={{ animation: 'fade-in 0.3s ease' }}
```

---

## Componentes de Layout

### Sidebar (`src/components/layout/Sidebar.tsx`)

- Usa `useProntuarioStore()` para `sidebarOpen` / `toggleSidebar`
- `usePathname()` para detectar rota ativa → classe `active` no link
- Items de menu agrupados por seção com `sidebar-section` label
- Footer: badge LGPD verde + botão de colapsar

### Header (`src/components/layout/Header.tsx`)

- Search bar com `useProntuarioStore().searchQuery`
- Avatar do profissional: gradiente azul, iniciais
- Notificações: badge vermelho no sino

---

## Zustand Store

```tsx
// src/store/prontuarioStore.ts
import { useProntuarioStore } from '@/store/prontuarioStore'

const { sidebarOpen, toggleSidebar, searchQuery, setSearchQuery } = useProntuarioStore()
```

**Campos disponíveis:**

- `sidebarOpen` / `toggleSidebar()` / `setSidebarOpen(bool)`
- `currentProntuarioId` / `setCurrentProntuario(id)`
- `anamneseDraft` / `setAnamneseDraft(data)`
- `searchQuery` / `setSearchQuery(string)`

---

## Gráficos (Recharts)

Sempre usar dentro de `<ResponsiveContainer width="100%" height={300}>`.
Estilo do Tooltip:

```tsx
<Tooltip
  contentStyle={{
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)'
  }}
  itemStyle={{ color: 'var(--text-primary)' }}
/>
```

Cores: usar variáveis CSS no array de cores: `['var(--brand-primary)', 'var(--brand-accent)', ...]`

---

## Ícones (Lucide React)

```tsx
import { Plus, Search, Filter, Eye, Download, ArrowLeft, Save } from 'lucide-react'
// Tamanho padrão em botões: size={16}
// Tamanho em títulos de seção: size={18}
// Tamanho em stat cards: size={22}
```

---

## Animações

```tsx
// Fade-in ao montar página
<main className="main-content animate-fade-in">

// Slide-up para modais
<div className="modal animate-slide-up">

// Inline em abas
style={{ animation: 'fade-in 0.3s ease' }}
```

---

## Responsividade

- **Desktop**: `grid-template-columns: var(--sidebar-width) 1fr` (280px sidebar)
- **Mobile** (< 768px): sidebar colapsa com `transform: translateX(-100%)`, `main-content` sem `margin-left`
- Grids internos: `repeat(auto-fit, minmax(240px, 1fr))`
- Formulários 2 colunas no desktop → `gridColumn: '1 / -1'` para campos full-width

---

## Convenções de Código

1. Componentes de página: `'use client'` apenas se necessário (interatividade); preferir Server Components
2. Server Actions em `actions.ts` na pasta da feature (ex: `pacientes/actions.ts`)
3. Imports de ícones individuais — nunca importar tudo
4. Inline styles para ajustes pontuais; classes CSS para padrões repetidos
5. `Link` do Next.js para navegação; nunca `<a>` para rotas internas
6. Empty states: ícone grande com `opacity: 0.2` + texto descritivo centralizado

---

## Checklist antes de entregar um componente

- [ ] Usa variáveis CSS para cores — sem valores hex hardcoded
- [ ] Labels de formulário com indicador `*` obrigatório
- [ ] Empty state implementado em listas/tabelas
- [ ] Loading state considerado (skeleton ou disabled)
- [ ] Números de CPF/lote com `font-mono`
- [ ] Botão de ação principal existe na Page Header
- [ ] `animate-fade-in` na `main-content`
