# Funcionalidades e Guias de Uso (Features)

Abaixo estão descritas as principais funcionalidades da aplicação e como interagir com elas, focando na melhor experiência do usuário e do paciente.

## 1. Agenda (`/agenda`)
Acesse a página de **Agenda** para gerenciar os seus horários e da clínica.  
**Como usar:**
* Ao acessar a agenda, o painel central renderiza o mês atual e uma aba lateral com os pacientes filtrados para o dia selecionado.
* Você pode navegar entre os meses clicando nas setas (Esquerda/Direita) e retornar ao dia exato clicando no botão **Hoje**.
* Dias que possuem consultas ficam marcados com um pequeno indicativo visual (`dot`).

## 2. Rastreabilidade de Procedimentos (`/procedimentos`)
Área gerencial dedicada ao compliance da ANVISA, focada nos produtos injetáveis.
**Como usar:**
* Esta tabela indexa automaticamente todas as injeções realizadas.
* Use a **Barra de Busca** procurando por nome de paciente ou, o mais importante, pelo **Número de Lote** (ex: `B123X`) de algum produto.
* Essa rastreabilidade ajuda a clínica a alertar rapidamente os pacientes em caso de `Recall` do laboratório farmacêutico.

## 3. Fotos Clínicas (`/fotos`)
Galeria centralizada para todos os registros fotográficos de evolução (Antes, Durante, Depois).
**Como usar:**
* O filtro por rótulo permite visualizar apenas como o paciente chegou (`ANTES`), ou os resultados (`DEPOIS`).
* As imagens contêm *badges* indicando a visão/ângulo capturado (ex: Perfil, Frontal), essencial na documentação HOF.

## 4. Relatórios Analíticos (`/relatorios`)
Acesse `/relatorios` para uma visão estratégica ampla do negócio.
**Como usar:**
* Três cartões de **KPI (Indicadores de Performance)** estão localizados no topo: `Novos Pacientes`, `Procedimentos`, `Prontuários`.
* **Gráfico de Barras:** Demonstra a evolução mensal da clínica cruzando a entrada de pacientes de primeira vez versus total de procedimentos vendidos.
* **Gráfico de Pizza:** Destaca a divisão dos produtos mais agendados, evidenciando se a clínica performa melhor com Toxinas ou Preenchedores.

## 5. TCLE Digital (`/prontuarios/[id]`)
Termo de Consentimento Livre e Esclarecido gerado em tempo real e de forma desmaterializada.
**Como usar:**
* Navegue até o Prontuário de um paciente e escolha a aba `TCLE e Assinaturas`.
* Leia o termo junto ao paciente. Na caixa branca (Canvas), peça para que o próprio paciente desenhe sua assinatura, atestando anuência com a LGPD e aos riscos do produto.
* Clique em `Confirmar Assinatura`. A assinatura será criptografada (Base64) e acoplada virtualmente ao registro de auditoria, bloqueando futuras modificações naquele prontuário para segurança contábil do médico.

## 6. Configurações (`/configuracoes`)
Espaço do usuário para gerir acessos e a marca da clínica.
**Como usar:**
* **Meu Perfil:** Dados cruciais do profissional. CRM/CRO e contatos ali alimentados assinam os documentos oficiais da clínica.
* **Dados da Clínica:** Logo e Endereço fiscal para preenchimento de faturas/recibos em PDF.
* **Segurança e LGPD:** O sistema retém Logs de IP de quem manuseou o prontuário. Nenhuma senha trafega em texto claro, e a complexidade exige 8 caracteres.

## 7. Caixa de Gestão de Pacientes (`/pacientes`)
Painel dedicado de Gestão de Pacientes integrado ao Prisma ORM para manipulação direta de bancos de grandes proporções.
**Como usar:**
* **Busca Otimizada:** Digite o nome ou CPF no campo de procura, a paginação e contagem reage dinamicamente, evitando trafego pesado no servidor caso exista centenas de clientes.
* **Cadastro Eficiente** (`/pacientes/novo`): Formulário seguro (Server Actions) validando formatos e gravando os dados cruciais para auditoria LGPD.
* **Visualização Geral do Cliente** (`/pacientes/[id]`): Tela reunindo Dados Demográficos e Histórico de Prontuários (que reúnem fotos, tcles, anamnese) para consulta unificada do Doutor antes da consulta.
