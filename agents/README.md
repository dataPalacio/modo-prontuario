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

## Configuração

1. Configure as credenciais do Google Cloud no `.env.local`
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
