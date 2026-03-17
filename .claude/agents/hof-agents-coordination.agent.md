---
name: hof-agents-coordination
version: 2.0.0
description: >
  Arquivo de coordenação entre hof-backend e hof-frontend.
  Define contratos de API, tipos compartilhados, fluxos de dados
  e regras de trabalho simultâneo entre os dois agentes.
---

# Coordenação — hof-backend ↔ hof-frontend

## Princípio de Responsabilidade

| Responsabilidade                        | Agente         |
| --------------------------------------- | -------------- |
| Validação de negócio (Zod server-side)  | hof-backend    |
| Criptografia e hashing de dados         | hof-backend    |
| Audit log e compliance LGPD             | hof-backend    |
| Multi-tenancy (clinicaId da sessão)     | hof-backend    |
| Soft delete e retenção de dados         | hof-backend    |
| UI/UX e componentes React               | hof-frontend   |
| Formulários e validação client-side     | hof-frontend   |
| Estado global (Zustand)                 | hof-frontend   |
| Formatação de dados para exibição       | hof-frontend   |
| Routing e navegação (Next.js)           | hof-frontend   |
| Schemas Zod (definição)                 | hof-backend    |
| Schemas Zod (consumo via zodResolver)   | hof-frontend   |

---

## Contratos de API

### Resposta padrão
```typescript
// Sucesso (lista paginada)
{ data: T[], total: number, page: number, pageSize: number, totalPages: number }

// Sucesso (item único)
{ data: T }

// Erro
{ error: string }

// Criado
HTTP 201 + { data: T }

// Validação falhou
HTTP 400 + { error: string } // primeira mensagem do Zod

// Não autorizado
HTTP 401 + { error: 'Não autorizado.' }

// Duplicado
HTTP 409 + { error: 'CPF já cadastrado.' }

// Não encontrado
HTTP 404 + { error: 'Paciente não encontrado nesta clínica.' }
```

---

## Dados que NUNCA saem do backend descriptografados

- `cpf` — somente formatado (ex: 123.***.***.00) em exibição
- `senhaHash` — jamais exposta
- dados de AuditLog brutos — apenas via endpoint protegido ADMIN

---

## Fluxo de Criação de Paciente (Full-Stack)

```
Frontend (NovoPacientePage)
  └─ Server Action: createPacienteAction(formData)
      ├─ normalize CPF: .replace(/\D/g, '')
      ├─ encrypt(cpf) → campo cpf
      ├─ hashCPF(cpf) → campo cpfHash
      ├─ prisma.paciente.create({ data: { clinicaId, ...} })
      ├─ revalidatePath('/pacientes')
      └─ redirect('/pacientes')

Frontend (via API)
  └─ fetch('POST /api/pacientes', body)
      ├─ auth() → session.user.clinicaId
      ├─ pacienteSchema.parse(body) [Zod v4]
      ├─ hashCPF(cpf) → verificar duplicidade
      ├─ encrypt(cpf) → salvar
      ├─ prisma.paciente.create()
      ├─ registrarAuditLog(PACIENTE_CRIADO)
      └─ return 201 + { data: paciente }
```

---

## Fluxo de Assinatura de Prontuário

```
Frontend (ProntuarioDetalhePage)
  └─ SignatureCanvas.getTrimmedCanvas().toDataURL('image/png')
      └─ fetch('POST /api/prontuarios/:id/assinar', {
           assinaturaUrl: base64PNG,
           ipAssinatura: (capturado pelo backend via x-forwarded-for),
         })
          ├─ sha256(JSON.stringify(dadosProntuario)) → hashIntegridade
          ├─ prisma.tcle.create({ assinaturaUrl, ipAssinatura, userAgent, versao })
          ├─ prisma.prontuario.update({ status: 'ASSINADO', hashIntegridade, assinadoEm })
          └─ registrarAuditLog(PRONTUARIO_ASSINADO)
```

---

## Tipos Compartilhados (src/types/index.ts)

```typescript
// Usados por AMBOS os agentes
export interface ApiResponse<T> { data?: T; error?: string; message?: string }
export interface PaginatedResponse<T> {
  data: T[]; total: number; page: number; pageSize: number; totalPages: number;
}
export type PacienteFormData = z.infer<typeof pacienteSchema>
export type ProntuarioFormData = z.infer<typeof prontuarioSchema>
export type ProcedimentoFormData = z.infer<typeof procedimentoSchema>
```

---

## Regras de Trabalho Simultâneo

### Ao modificar um endpoint (hof-backend):
1. Atualizar o schema Zod correspondente em `src/lib/validations/`
2. Documentar breaking changes no contrato de resposta
3. Verificar se o frontend usa esse endpoint diretamente ou via Server Action

### Ao modificar uma página (hof-frontend):
1. Verificar se o endpoint necessário existe em `src/app/api/`
2. Nunca passar `clinicaId` no body de requisições (vem da sessão no backend)
3. Usar os schemas Zod existentes via `zodResolver` no React Hook Form

### Regras de CPF em UI:
```typescript
// ✅ Exibir formatado (mascarado) em listagens
<span className="font-mono">{formatCPF(paciente.cpf)}</span>
// O cpf retornado pelo backend já vem mascarado em listagens (campo omitido)

// ✅ No formulário de busca, fazer hashCPF no backend
// Frontend envia: ?cpf=12345678901
// Backend faz: hashCPF('12345678901') → busca por cpfHash

// ⛔ Nunca descriptografar CPF no frontend
```

---

## Comandos de Desenvolvimento

```bash
# Iniciar com ambos os agentes ativos
npm run dev

# Banco de dados
npm run db:generate  # após alterar schema.prisma
npm run db:push      # aplicar mudanças no banco
npm run db:seed      # popular dados de demo

# Credenciais de demo
Email: carlos@clinicapremium.com.br
Senha: 123456
```