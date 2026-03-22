---
applyTo: "**"
---
# Copilot Instructions — modo-prontuario

## 1. Propósito do projeto

Este repositório implementa funcionalidades relacionadas a prontuário clínico, documentação assistencial e/ou jurídico-clínica para Harmonização Orofacial (HOF), com foco em:

- conformidade regulatória,
- proteção de dados sensíveis,
- rastreabilidade de procedimentos e produtos,
- consistência documental,
- geração e manutenção de documentos/artefatos clínicos confiáveis.

Ao trabalhar neste projeto, trate qualquer alteração como potencialmente sensível do ponto de vista:

- legal,
- clínico,
- operacional,
- privacidade/LGPD,
- integridade do prontuário.

---

## 2. Princípios obrigatórios

Sempre seguir estes princípios:

1. **Não quebrar conformidade**

   - Nunca remova campos obrigatórios de prontuário.
   - Nunca simplifique textos legais, consentimentos, validações ou registros de rastreabilidade sem justificar tecnicamente e documentar o impacto.
   - Nunca altere termos regulatórios sem explicitar o motivo.
2. **Preservar rastreabilidade**

   - Se houver estrutura para produto/lote/fabricante/validade/volume/local de aplicação, preserve essa modelagem.
   - Não gerar código que perca histórico, sobrescreva registros clínicos sem versionamento ou descarte metadados relevantes.
3. **Proteger dados sensíveis**

   - Nunca introduza logs com dados pessoais completos.
   - Nunca exiba CPF, telefone, e-mail, data de nascimento, imagem clínica ou dados de saúde em logs, mocks, exemplos públicos ou mensagens de erro.
   - Ao criar exemplos, usar dados fictícios claramente anonimizados.
4. **Preferir mudanças incrementais**

   - Antes de refatorar em larga escala, entender o fluxo atual.
   - Priorizar mudanças pequenas, reversíveis e documentadas.
   - Se a mudança afetar template, schema, payload, token ou documento, descrever impacto.
5. **Explicitar risco**

   - Se a tarefa envolver parte regulatória, estrutural, persistência, rendering, assinatura, consentimento ou geração de PDF/documento final, sinalizar os riscos e propor validação.

---

## 3. Idioma, estilo e comunicação

- Escrever código, comentários e documentação preferencialmente em **pt-BR**, exceto quando a linguagem/framework exigir convenção técnica em inglês.
- Manter nomenclatura consistente com o domínio clínico do projeto.
- Evitar nomes genéricos como `data`, `info`, `temp`, `handler2`, `processX`.
- Preferir nomes descritivos e orientados ao domínio:

  - `paciente`
  - `procedimento`
  - `consentimento`
  - `registro_clinico`
  - `rastreabilidade_produto`
  - `anamnese`
  - `evolucao`
  - `documento_renderizado`

---

## 4. Como o Copilot deve agir antes de gerar código

Antes de sugerir alterações:

1. Ler a estrutura do projeto e identificar:

   - pontos de entrada,
   - templates,
   - camada de dados,
   - geração documental,
   - testes,
   - documentação,
   - instruções locais em `.github/`.
2. Verificar se existe:

   - `copilot-instructions.md`,
   - `.instructions.md`,
   - `AGENTS.md`,
   - skills em `.github/.skills/`,
   - docs técnicas do fluxo.
3. Inferir o impacto da mudança:

   - afeta dados clínicos?
   - afeta conformidade?
   - afeta rendering?
   - afeta PDF?
   - afeta persistência?
   - afeta UX do modo consultório?
   - afeta validação de entrada?
4. Se faltar contexto para uma área sensível, não inventar.

   - Em vez disso, produzir uma implementação conservadora e sinalizar as premissas.

---

## 5. Regras para backend / regras de negócio

Ao editar backend, serviços, controllers ou scripts:

- Separar claramente:

  - validação,
  - transformação,
  - regras de negócio,
  - persistência,
  - rendering/exportação.
- Preferir funções pequenas e compostas.
- Usar early returns para erros.
- Tratar exceções com mensagens úteis, sem vazar dados sensíveis.
- Nunca acoplar regra clínica diretamente à camada de apresentação quando puder ser isolada.
- Se criar schemas, manter compatibilidade retroativa sempre que possível.
- Se não for possível manter compatibilidade, documentar migração.

### Validação

Sempre validar explicitamente:

- campos obrigatórios,
- tipos,
- datas,
- listas,
- enums,
- relacionamentos entre campos,
- presença de identificadores críticos do prontuário.

### Auditoria e histórico

Se houver recursos de histórico/versionamento:

- não apagar registros anteriores sem necessidade,
- preferir append/log de evento,
- preservar timestamps,
- preservar autoria/identificação do profissional quando aplicável.

---

## 6. Regras para frontend / modo consultório

Ao editar telas, formulários ou interfaces:

- Priorizar clareza, legibilidade e fluxo clínico.
- Formular campos de forma orientada ao uso real do consultório.
- Não esconder campos regulatórios obrigatórios.
- Usar máscaras e validações apenas para melhorar UX, nunca como única barreira de validação.
- Garantir acessibilidade básica:

  - labels associadas,
  - mensagens de erro compreensíveis,
  - foco visível,
  - contraste adequado.

### Dados sensíveis na UI

- Não persistir dados clínicos sensíveis em `localStorage` sem justificativa forte.
- Evitar exibir dados completos em toast, alert ou console.
- Em previews, mascarar ou anonimizar quando possível.

---

## 7. Regras para templates, documentos e PDFs

Se o projeto usar HTML/Jinja2/template engine/renderização PDF:

1. **Não renomear tokens/chaves sem rastrear impacto**

   - Toda mudança de token deve ser refletida em:

     - template,
     - payload,
     - documentação,
     - testes,
     - exemplos.
2. **Preservar semântica documental**

   - Cabeçalhos, seções, tabelas, assinatura, blocos de consentimento e identificação devem manter estrutura clara.
   - Se alterar layout, preservar legibilidade de impressão e exportação.
3. **Pensar em saída final**

   - Toda alteração deve considerar:

     - HTML final,
     - quebra de página,
     - repetição de cabeçalho/rodapé,
     - renderização em PDF,
     - consistência tipográfica,
     - impressão.
4. **Evitar regressões silenciosas**

   - Sempre que possível, comparar output antes/depois.
   - Se houver snapshots, atualizar conscientemente.

---

## 8. Regras para conformidade, LGPD e prontuário

Este projeto deve tratar dados de saúde como altamente sensíveis.

O Copilot deve:

- assumir postura conservadora,
- evitar mudanças que diminuam integridade do prontuário,
- preservar evidências de atendimento,
- respeitar retenção, consentimento e rastreabilidade quando o fluxo exigir.

### Nunca fazer

- Nunca sugerir exclusão irrestrita de histórico clínico.
- Nunca remover consentimento/TCLE do fluxo sem substituição explícita.
- Nunca omitir campos de produto, lote, fabricante, validade ou volume quando o procedimento exigir rastreabilidade.
- Nunca sugerir uso de dados reais de pacientes em exemplos de código, commits, documentação ou testes.

### Sempre fazer

- Preferir dados fictícios.
- Mascarar identificadores.
- Manter logs mínimos.
- Documentar impactos regulatórios de mudanças estruturais.

---

## 9. Qualidade de código

Ao gerar código:

- seguir o estilo já existente no repositório;
- se não houver convenção clara, usar:

  - alta coesão,
  - baixo acoplamento,
  - nomes explícitos,
  - comentários apenas quando agregarem contexto real,
  - docstrings em funções complexas,
  - modularidade;
- evitar duplicação;
- evitar “mágica” implícita;
- evitar dependências desnecessárias;
- evitar refatoração cosmética sem ganho técnico claro.

### Testes

Ao sugerir mudanças, também considerar:

- testes unitários para validações e regras de negócio;
- testes de integração para fluxos de prontuário/documento;
- testes de regressão para templates e outputs críticos;
- testes de rendering/exportação quando aplicável.

---

## 10. Documentação obrigatória ao alterar partes críticas

Se a mudança afetar qualquer um destes pontos, atualizar documentação:

- schema de dados,
- tokens de template,
- fluxo de geração de documento,
- conformidade,
- campos obrigatórios,
- integração com assinatura/consentimento,
- pipeline de exportação,
- rotas e endpoints,
- comportamento do modo consultório.

Ao final de mudanças significativas, incluir:

- o que mudou,
- por que mudou,
- impacto esperado,
- risco,
- como validar.

---

## 11. Skill map recomendado para o agente

Ao trabalhar neste projeto, priorizar o uso das skills certas por contexto:

### Skills de domínio

- `legal-compliance`

  - usar para prontuário,
  - TCLE,
  - LGPD,
  - CFM/CFO/CFBM,
  - ANVISA,
  - retenção documental,
  - rastreabilidade.

### Skills de documentação

Priorizar:

- `documentation`
- `technical-writing`
- `changelog-maintenance`

Usar quando:

- criar README,
- descrever arquitetura,
- atualizar fluxo,
- registrar migração,
- melhorar documentação técnica.

### Skills de code quality

Priorizar:

- `systematic-debugging`
- `requesting-code-review`

Usar quando:

- revisar estrutura,
- reduzir complexidade,
- melhorar nomes,
- refatorar com segurança,
- padronizar código.

### Skills de testing

Priorizar:

- `test-driven-development`

Usar quando:

- criar testes de validação,
- testar rendering,
- validar regressões,
- conferir fluxos ponta a ponta.

### Skills de governança/segurança

Priorizar:

- `security-best-practices`
- `backend`

Usar quando:

- houver automação sensível,
- manipulação de dados pessoais,
- regras de segurança,
- políticas de acesso,
- logs e auditoria.

---

## 12. Restrições finais para o Copilot

- Não inventar requisitos regulatórios.
- Não inventar campos clínicos sem marcar como hipótese.
- Não remover compatibilidade sem avisar.
- Não sugerir atalhos inseguros para dados de pacientes.
- Não preferir estética a integridade documental.
- Não tratar documentos clínicos como simples “HTML bonito”; eles são artefatos críticos do sistema.

---

## 13. Formato de resposta esperado do Copilot

Sempre que possível, responder neste formato:

1. **Entendimento da tarefa**
2. **Impacto no projeto**
3. **Mudança proposta**
4. **Riscos / pontos de atenção**
5. **Arquivos afetados**
6. **Como validar**
7. **Próximos passos opcionais**

Se a tarefa for sensível (conformidade, prontuário, consentimento, retenção, rastreabilidade, assinatura, PDF final), deixar os riscos explícitos antes de gerar a solução.
