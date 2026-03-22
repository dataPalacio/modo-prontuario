# Agents — IA Assistente para o Prontuário HOF

Este diretório contém as configurações dos agents de IA que auxiliam
profissionais no preenchimento e análise dos prontuários.

## Agents Disponíveis

### 1. Anamnese Agent
Conduz uma anamnese guiada via chat, fazendo perguntas contextuais
e preenchendo automaticamente o JSON de anamnese.

### 2. TCLE Agent
Gera um TCLE personalizado baseado no procedimento a ser realizado,
incluindo riscos específicos e linguagem acessível ao paciente.

### 3. Report Agent
Analisa o histórico do paciente e gera resumos clínicos estruturados.

## Agents de Desenvolvimento

Além dos agents clínicos acima, o repositório agora inclui agents de apoio ao desenvolvimento em `.github/agents/`:

### 4. Arquiteto HOF
Orquestra tarefas de desenvolvimento, decompondo a demanda e acionando os especialistas corretos.

### 5. Frontend Kaio
Especialista em UI, páginas Next.js, componentes React e design system HOF.

### 6. Backend Prisma
Especialista em API Routes, Prisma, autenticação, validação e multi-tenant.

### 7. LGPD Guardian
Especialista em conformidade LGPD, CFM, ANVISA e rastreabilidade de dados clínicos.

### 8. Docs Writer
Especialista em README, ADR, CHANGELOG, TSDoc e mensagens de commit.

### 9. Code Reviewer
Especialista em revisão final, checklist HOF, qualidade e riscos de segurança.

Consulte a documentação em `docs/agent-squad/` para o mapa completo de agentes e skills.

## Configuração

1. Configure as credenciais do Google Cloud no `.env`
2. Habilite a Vertex AI API no console Google Cloud
3. Execute `npm run agents:deploy` para fazer o deploy dos agents

## Variáveis de Ambiente

```env
GOOGLE_CLOUD_PROJECT_ID="seu-projeto-id"
GOOGLE_CLOUD_LOCATION="us-central1"
GOOGLE_APPLICATION_CREDENTIALS="./credentials/service-account.json"
VERTEX_AI_AGENT_ID_ANAMNESE="..."
VERTEX_AI_AGENT_ID_TCLE="..."
```
