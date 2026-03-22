---
name: frontend
description: "Project frontend conventions. Use for HOF pages, components, forms, layout, CSS classes and consultorio-oriented UI flows."
argument-hint: "Descreva a pagina, componente ou ajuste frontend que deve seguir o padrao HOF."
---

# Frontend — Prontuário HOF

## Paleta de Cores

Usar as variáveis CSS definidas em `src/app/globals.css`:

- `--brand-primary: #2E5D8E` — Azul médico profissional
- `--brand-secondary: #4A90B8` — Azul médio
- `--brand-accent: #C9956A` — Rose gold (referência HOF)
- `--brand-success: #2D7D46` — Verde clínico
- `--brand-warning: #B8860B` — Âmbar
- `--brand-danger: #C0392B` — Vermelho de alerta

## Tipografia

- **Display/Títulos**: Inter (700)
- **Body**: Inter (400/500)
- **Código/Lotes**: JetBrains Mono (400)

## Componentes Base

Todos os componentes devem usar as classes CSS definidas em `globals.css`:

- `.card` — Container com sombra e border
- `.btn`, `.btn-primary`, `.btn-accent` — Botões
- `.form-input`, `.form-textarea`, `.form-select` — Campos de formulário
- `.badge` — Status badges
- `.table` — Tabelas
- `.stat-card` — Cards de estatísticas do dashboard

## Padrões de Formulário Médico

1. Campos obrigatórios sempre com `<span className="required">*</span>`
2. Validação via Zod + React Hook Form
3. Formulários multi-step para prontuário (4 etapas)
4. Checkboxes para contraindicações
5. Campos de lote com `font-mono` para rastreabilidade

## Responsividade

- Desktop: Grid com sidebar fixa (280px)
- Mobile: Sidebar colapsável, formulários em coluna única
