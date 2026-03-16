---
name: hof-legal-compliance
description: >
  Conformidade legal completa para o Prontuário HOF: CFM, CFO, CFBM, ANVISA e LGPD aplicados
  ao desenvolvimento de software de prontuário eletrônico de Harmonização Orofacial.
  Use SEMPRE que for implementar ou revisar: campos obrigatórios de prontuário, validações de
  procedimentos, lógica de soft delete, audit logs, criptografia de dados sensíveis, TCLE,
  rastreabilidade de lotes, contraindicações absolutas/relativas, restrições por tipo de profissional
  (médico/dentista/biomédico), prazos de retenção de dados, regras de acesso multi-tenant,
  notificações de incidentes, e qualquer funcionalidade que envolva dados de saúde de pacientes.
  Também ativa para revisão de segurança, criação de testes de compliance e geração de relatórios
  de auditoria.
---
# Conformidade Legal — Prontuário HOF

## Panorama Regulatório

O sistema atende profissionais de **três conselhos distintos**, cada um com competências e limitações específicas:

| Profissional        | Conselho | Lei Base       | Resolução HOF                                                                 |
| ------------------- | -------- | -------------- | ------------------------------------------------------------------------------- |
| Médico             | CFM      | Lei 3.268/1957 | Res. 2.299/2021 (prontuário eletrônico)                                       |
| Cirurgião-Dentista | CFO      | Lei 5.081/1966 | **Res. 198/2019** (cria HOF como especialidade) + **Res. 230/2020** |
| Biomédico Esteta   | CFBM     | Lei 6.684/1979 | **Res. 320/2020** + Res. 241/2014 (substâncias)                          |

> 🚨 A HOF como especialidade odontológica foi regulamentada em **29/01/2019** (Res. CFO 198/2019) e reafirmada judicialmente em 2022 pelo TRF-1.

---

## CFM — Conselho Federal de Medicina

### Resoluções Aplicáveis

- **Res. 1.638/2002** — Define prontuário médico. Retenção mínima: **20 anos**
- **Res. 1.821/2007** — Digitalização e guarda de prontuários. Comissão Permanente de Avaliação
- **Res. 2.299/2021** — Prontuário eletrônico: requisitos técnicos, assinatura digital, backup
- **Res. 2.336/2023** — Telemedicina (relevante para consultas online)

### Implicações para o Sistema

```typescript
// Soft delete obrigatório — nunca deletar fisicamente
// Retenção mínima: 20 anos a partir da data do último atendimento
await prisma.prontuario.update({
  where: { id },
  data: { deletedAt: new Date() }  // NUNCA usar prisma.prontuario.delete()
})

// Consultas sempre excluem registros "deletados"
prisma.prontuario.findMany({ where: { deletedAt: null } })
```

---

## CFO — Conselho Federal de Odontologia

### Resoluções Aplicáveis

- **Res. 91/2009** — Prontuário odontológico obrigatório
- **Res. 198/2019** — Cria Harmonização Orofacial como especialidade odontológica
- **Res. 230/2020** — Regulamenta procedimentos cirúrgicos em HOF para C-D
- **Res. CFO (em elaboração 2025)** — Cirurgias estéticas da face (acompanhar publicação)

### Procedimentos permitidos ao Cirurgião-Dentista (Res. 198/2019)

**✅ Autorizados:**

- Toxina botulínica (fins terapêuticos e estéticos na região orofacial)
- Preenchimento com ácido hialurônico
- Bioestimuladores de colágeno
- Fios de PDO (lifting facial)
- Rinomodelação (não cirúrgica)
- Skinbooster / intradermoterapia
- Microagulhamento facial
- Peelings químicos superficiais e médios

**❌ Vedados ao Cirurgião-Dentista (Res. 230/2020):**

- Bichectomia (procedimento cirúrgico exclusivo de médicos ou C-D com formação específica)
- Blefaroplastia
- Procedimentos fora da região orofacial

### Campos do prontuário exigidos pelo CFO

O prontuário odontológico deve conter:

1. Identificação completa do paciente (nome, CPF, endereço, contato)
2. Identificação do profissional (nome, CRO, especialidade registrada)
3. Data e hora do atendimento
4. Anamnese completa (história médica, alergias, medicamentos em uso)
5. Diagnóstico / planejamento terapêutico
6. Descrição detalhada dos procedimentos realizados
7. Produtos utilizados com **lote e validade** (obrigatório ANVISA)
8. Registro fotográfico (antes/durante/depois) com TCLE assinado
9. Evolução e intercorrências

---

## CFBM — Conselho Federal de Biomedicina

### Resoluções Aplicáveis

- **Res. 241/2014** — Substâncias permitidas ao biomédico esteta
- **Res. 307/2019** — Substâncias e normas de uso em Biomedicina Estética
- **Res. 320/2020** — Regulamenta procedimentos estéticos injetáveis para biomédicos
- **Res. 376/2024** — Ato Profissional Biomédico e responsabilidade técnica

### Habilitação obrigatória

```
Para atuar com procedimentos estéticos injetáveis, o biomédico DEVE possuir
habilitação em "Biomedicina Estética" registrada no CRBM regional.
Cursos livres NÃO conferem habilitação — apenas pós-graduação reconhecida.
```

### Procedimentos autorizados ao Biomédico Esteta (Res. 320/2020 + 241/2014)

**✅ Autorizados:**

- Toxina botulínica tipo A (para fins estéticos com habilitação)
- Preenchimento dérmico com ácido hialurônico
- Preenchimento subcutâneo e supraperiostal (exceto PMMA)
- Bioestimuladores de colágeno
- Fios de PDO
- Intradermoterapia (substâncias eutróficas, venotróficas, lipolíticas)
- Skinbooster
- Microagulhamento

**❌ Vedados ao Biomédico:**

- PMMA (polimetilmetacrilato) — permanente
- Rinomodelação cirúrgica
- Bichectomia
- Aplicação de tirzepatida ("Mounjaro") — vedado por Parecer Técnico 005/2025

### Validação de habilitação no sistema

```typescript
// Ao cadastrar profissional biomédico, validar habilitação
if (profissional.conselho === 'CFBM') {
  // Verificar se especialidade informada inclui Biomedicina Estética
  // Registrar no audit log a habilitação declarada
}
```

---

## ANVISA — Agência Nacional de Vigilância Sanitária

### Normas Aplicáveis

- **RDC 63/2011** — Boas práticas em serviços de saúde
- **RDC 204/2017** — Produtos para saúde (Classe II e III)
- **RDC 751/2022** — Registro, alteração e revalidação de produtos médicos injetáveis
- **RDC 907/2024** — Produtos cosméticos (atenção: cosméticos ≠ injetáveis)
- **Nota Técnica 2/2024** — Esclarecimentos sobre serviços estéticos

### Regra crítica de rastreabilidade

```
⚠️ Todo produto injetável DEVE ter registro ANVISA como medicamento ou
   produto para saúde (não cosmético). Cosméticos com AFE "2.XXXXX-X" ou
   "4.XXXXX-X" NÃO podem ser injetados.
```

### Rastreabilidade obrigatória por procedimento

```typescript
// Schema Prisma — campos obrigatórios por ANVISA
model Procedimento {
  produto         String   // Nome comercial (ex: Botox®, Restylane®)
  fabricante      String?  // Nome do fabricante
  lote            String   // ⚠️ OBRIGATÓRIO — rastreabilidade para recalls
  validadeProduto DateTime? // Data de validade do lote
  concentracao    String?  // ex: "100UI", "20mg/mL"
  volume          String?  // ex: "0.5mL por ponto"
}
```

### Produtos injetáveis aprovados pela ANVISA (principais)

**Toxinas Botulínicas:**

| Produto    | Fabricante      | Tipo            |
| ---------- | --------------- | --------------- |
| Botox®    | Allergan/AbbVie | Onabotulinum A  |
| Dysport®  | Ipsen           | Abobotulinum A  |
| Xeomin®   | Merz            | Incobotulinum A |
| Prosigne® | Lanzhou/BTX-A   | Abobotulinum A  |
| Nabota®   | Daewoong        | Onabotulinum A  |

**Ácido Hialurônico (exemplos aprovados):**

- Restylane® (Galderma) — preenchimento dérmico/lábios
- Juvederm® (Allergan) — preenchimento facial
- Belotero® (Merz) — preenchimento superficial/médio

**Bioestimuladores:**

- Radiesse® (Merz) — hidroxiapatita de cálcio
- Sculptra® (Galderma) — ácido poli-L-lático
- Ellansé® (Sinclair) — policaprolactona

> 🚨 Sempre verificar registro ANVISA vigente do produto antes de registrar no prontuário.

---

## LGPD — Lei Geral de Proteção de Dados (Lei 13.709/2018)

### Classificação dos dados no sistema

| Dado                   | Classificação                                        | Proteção obrigatória           |
| ---------------------- | ------------------------------------------------------ | --------------------------------- |
| Nome, telefone, e-mail | Pessoal (Art. 5°, I)                                  | Controle de acesso + multi-tenant |
| CPF, RG, data de nasc. | Pessoal identificador                                  | Criptografia AES-256-GCM          |
| Prontuário completo   | **Sensível — saúde (Art. 5°, II + Art. 11)** | Criptografia + audit log          |
| Fotos clínicas        | **Sensível — saúde**                          | Storage privado + TCLE            |
| Anamnese / histórico  | **Sensível — saúde**                          | Criptografia + audit log          |
| Assinatura digital     | Biométrico sensível                                  | Hash + TCLE                       |
| IP de acesso           | Pessoal (rastreável)                                  | Audit log                         |

### Base legal para tratamento de dados de saúde (Art. 11)

O sistema usa **tutela da saúde** (Art. 11, II, f) como base legal principal, não consentimento.
Isso significa:

- O prontuário pode ser criado sem consentimento explícito para fins de saúde
- O TCLE serve para autorizar procedimentos, não para tratar dados (finalidades distintas)
- A obrigação de guarda por 20 anos prevalece sobre pedidos de exclusão

### Direitos do Titular (Art. 18) — implementar no sistema

```typescript
// Endpoints obrigatórios para compliance LGPD
// GET  /api/pacientes/[id]/dados      → exportar todos os dados do paciente
// PUT  /api/pacientes/[id]/correcao   → corrigir dados incorretos
// GET  /api/pacientes/[id]/auditoria  → ver quem acessou os dados e quando
// POST /api/pacientes/[id]/portabilidade → exportar dados em formato padrão
```

| Direito          | Art.    | Prazo de resposta | Observação                                                                  |
| ---------------- | ------- | ----------------- | ----------------------------------------------------------------------------- |
| Acesso aos dados | 18, II  | 15 dias           | Exportar JSON/PDF                                                             |
| Correção       | 18, III | 15 dias           | Log de alteração                                                            |
| Portabilidade    | 18, V   | 15 dias           | Formato estruturado                                                           |
| Eliminação     | 18, VI  | 15 dias           | ⚠️ Apenas soft delete — prontuários retidos 20 anos por obrigação legal |

### Notificação de Incidente de Segurança (Art. 48)

```
Prazo obrigatório: 72 horas após ciência do incidente
Destinatário: ANPD (Autoridade Nacional de Proteção de Dados)
Contato titular: comunicar "em prazo razoável"
```

### Penalidades por não conformidade (Art. 52)

- Advertência com prazo para medidas corretivas
- Multa simples: até 2% do faturamento, limite R$ 50 milhões por infração
- Multa diária
- Publicização da infração
- Bloqueio ou eliminação dos dados

---

## Contraindicações — Validação Clínica Obrigatória

### Contraindicações Absolutas (impedir procedimento no sistema)

Qualquer um desses campos marcado na anamnese deve **bloquear prosseguimento** e exigir avaliação:

```typescript
const contraindicacoesAbsolutas = [
  'gestante',          // Toxina + preenchedores — teratogênicos
  'amamentando',       // Risco de transferência ao leite
  'infeccaoAtiva',     // Infecção ativa no local do procedimento
  'disturbioCoagulacao', // Distúrbio de coagulação não controlado
  'alergiaAoProduto',  // Alergia ao produto específico
  'doencaAutoimune',   // Doenças autoimunes em fase ativa/crise
  'neoplasia',         // Neoplasia ativa na região de tratamento
]
```

### Contraindicações Relativas (alerta + confirmação obrigatória)

```typescript
const contraindicacoesRelativas = [
  'anticoagulantes',        // Warfarina, Heparina, Rivaroxabana — risco de hematoma
  'aas_aines',              // AAS, ibuprofeno — suspender 7-10 dias antes (se possível)
  'vitaminaE',              // Suplemento — suspender 7-10 dias antes
  'isotretinoinaUltimos12', // Acne tratada com Roacutan — aguardar 12 meses
  'queloidePredisposicao',  // Risco aumentado de queloides
  'diabetes_descompensada', // Cicatrização prejudicada
  'psoriase_herpes_ativo',  // Infecções virais ativas
  'gravidezRecente',        // Pós-parto — aguardar amamentação completa
]
```

### Medicamentos que interagem com toxina botulínica

Registrar na anamnese e alertar no prontuário:

- Aminoglicosídeos (amicacina, gentamicina) — potencializam o efeito
- Bloqueadores neuromusculares — risco de paralisia excessiva
- Quinina e quinidina — interação com transmissão neuromuscular
- Anticoagulantes — risco de hematoma extenso

---

## TCLE — Termo de Consentimento Livre e Esclarecido

### Base Legal

- **Art. 22 do Código de Ética Médica** — consentimento informado
- **MP 2.200-2/2001** — validade jurídica da assinatura digital com ICP-Brasil ou equivalente
- **LGPD Art. 11** — consentimento para dados sensíveis de saúde (exceto quando base é tutela da saúde)

### Campos obrigatórios do TCLE

```typescript
interface TCLEObrigatorio {
  // Identificação
  nomeCompleto: string
  cpf: string        // mascarado na exibição
  dataNasc: string
  
  // Procedimento
  procedimentoDescricao: string   // descrição detalhada
  produtoNome: string             // nome comercial
  regiaoAnatomica: string
  
  // Conteúdo obrigatório
  riscos: string[]                // lista de riscos específicos do procedimento
  beneficiosEsperados: string
  alternativasTratamento: string  // incluir "não fazer o procedimento"
  duracaoEfeito: string           // ex: "3 a 6 meses para toxina botulínica"
  cuidadosPosProced: string[]
  
  // Autorização fotografias
  autorizaFotos: boolean          // para fins clínicos
  autorizaEstudoCientífico: boolean // opcional, separado
  
  // Assinatura
  assinadoEm: DateTime
  ipAssinatura: string            // IP do dispositivo do paciente
  userAgent: string               // navegador/dispositivo
  versaoTcle: string              // versão do template usado
}
```

### Armazenamento da assinatura digital

```typescript
// A assinatura deve ser:
// 1. Capturada em canvas (SignatureCanvas)
// 2. Convertida para base64 PNG
// 3. Armazenada com metadata de IP, timestamp e versão do TCLE
// 4. Uma vez assinado, o prontuário entra em estado ASSINADO (imutável)

await prisma.tcle.create({
  data: {
    prontuarioId,
    pacienteId,
    conteudo: htmlDoTcle,          // HTML completo no momento da assinatura
    assinaturaUrl: base64PNG,       // canvas.toDataURL('image/png')
    ipAssinatura: clientIP,
    userAgent: request.headers.get('user-agent'),
    assinadoEm: new Date(),
    versao: '2025-v1',             // versionar o template
  }
})

// Após assinar, bloquear edições no prontuário
await prisma.prontuario.update({
  where: { id: prontuarioId },
  data: {
    status: 'ASSINADO',
    assinadoEm: new Date(),
    hashIntegridade: await generateHash(JSON.stringify(dadosProntuario))
  }
})
```

---

## Prazos de Retenção de Dados (CFM 1.638/2002)

| Dado                       | Prazo mínimo     | Base legal               | Ação no sistema             |
| -------------------------- | ----------------- | ------------------------ | ----------------------------- |
| Prontuários médicos      | **20 anos** | CFM 1.638/2002, Art. 1° | Soft delete com `deletedAt` |
| TCLEs assinados            | **20 anos** | CFM 1.638/2002           | Vinculado ao prontuário      |
| Fotos clínicas            | **20 anos** | CFM 1.638/2002           | Storage privado, não deletar |
| Audit logs                 | **20 anos** | CFM 1.638/2002           | Imutável, sem exclusão      |
| Registros de procedimentos | **20 anos** | ANVISA + CFM             | Vinculado ao prontuário      |
| Receitas e prescrições   | **10 anos** | Portaria SVS/MS 344/98   | Separar de prontuário        |

> 🚨 **Importante:** Pedidos de exclusão de paciente (LGPD Art. 18, VI) NÃO se aplicam a prontuários. A obrigação legal de retenção prevalesce sobre o direito à exclusão.

---

## Audit Log — Compliance CFM + LGPD

### Operações que DEVEM gerar audit log

```typescript
const operacoesAuditadas = {
  // Prontuário
  'PRONTUARIO_CRIADO': true,
  'PRONTUARIO_VISUALIZADO': true,    // ⚠️ incluir visualizações
  'PRONTUARIO_EDITADO': true,
  'PRONTUARIO_ASSINADO': true,
  'PRONTUARIO_ARQUIVADO': true,
  
  // Paciente
  'PACIENTE_CRIADO': true,
  'PACIENTE_VISUALIZADO': true,
  'PACIENTE_EDITADO': true,
  'PACIENTE_SOFT_DELETADO': true,
  
  // TCLE
  'TCLE_GERADO': true,
  'TCLE_ASSINADO': true,
  
  // Acesso
  'LOGIN_REALIZADO': true,
  'LOGIN_FALHOU': true,
  'EXPORTACAO_DADOS': true,         // LGPD portabilidade
}
```

### Dados obrigatórios no audit log

```typescript
interface AuditLogEntry {
  clinicaId: string      // multi-tenant
  userId: string         // profissional que realizou a ação
  acao: string           // ex: 'PRONTUARIO_VISUALIZADO'
  entidade: string       // ex: 'Prontuario'
  entidadeId: string     // ID do registro afetado
  ip: string             // IP de origem
  userAgent: string      // navegador/dispositivo
  dados?: Json           // snapshot antes/depois (para edições)
  createdAt: DateTime    // timestamp imutável
}
```

---

## Matriz de Permissões por Role

```typescript
const permissoes = {
  ADMIN: {
    prontuarios: ['criar', 'ler', 'editar', 'arquivar'],
    pacientes: ['criar', 'ler', 'editar', 'soft-delete'],
    configuracoes: ['ler', 'editar'],
    relatorios: ['ler', 'exportar'],
    auditLogs: ['ler'],
  },
  PROFISSIONAL: {
    prontuarios: ['criar', 'ler', 'editar'],     // somente seus próprios
    pacientes: ['criar', 'ler', 'editar'],
    configuracoes: ['ler', 'editar-proprio-perfil'],
    relatorios: ['ler'],
    auditLogs: [],
  },
  RECEPCIONISTA: {
    prontuarios: ['ler'],                         // apenas visualizar
    pacientes: ['criar', 'ler'],
    configuracoes: [],
    relatorios: [],
    auditLogs: [],
  },
}
```

---

## Checklist de Compliance por Feature

### Ao criar/editar prontuário

- [ ] `clinicaId` vem da sessão autenticada (nunca do body)
- [ ] Campo `lote` presente e obrigatório em Procedimentos
- [ ] Soft delete implementado (`deletedAt`) — sem `delete()`
- [ ] Audit log registrado com IP e userId
- [ ] Hash de integridade gerado ao assinar (`SHA-256`)
- [ ] TCLE inclui IP, timestamp e versão do template
- [ ] Status muda para `ASSINADO` após assinatura (imutável)

### Ao tratar dados do paciente

- [ ] CPF criptografado (AES-256-GCM) antes de salvar
- [ ] Fotos em storage privado (não público)
- [ ] Multi-tenant: filtro `clinicaId` em todas as queries
- [ ] Contraindicações absolutas validadas antes de prosseguir
- [ ] Consentimento de foto separado do consentimento do procedimento

### Ao implementar exclusão

- [ ] Nunca usar `prisma.prontuario.delete()` ou `prisma.paciente.delete()`
- [ ] Sempre `update({ data: { deletedAt: new Date() } })`
- [ ] Incluir `deletedAt: null` em todos os `findMany` e `findFirst`
- [ ] Log de auditoria do soft delete com motivo

### Ao adicionar novo tipo de profissional

- [ ] Verificar conselho (CFM/CFO/CFBM) e suas competências específicas
- [ ] Validar habilitação especial se CFBM (Biomedicina Estética)
- [ ] Ajustar matriz de permissões de procedimentos por conselho
- [ ] Documentar limitações no campo `observacoes` do profissional
