---
name: Documentation
description: Padrões e melhores práticas para documentação técnica de projetos (Software Technical Writing)
---

# Documentation Skill

Esta documentação define os padrões de qualidade e metodologias recomendados ao se criar e manter a documentação deste projeto.

## 🎯 Objetivo
Reduzir a curva de aprendizado (onboarding), garantir manutenibilidade e entregar clareza sobre decisões arquiteturais e setup, empoderando desenvolvedores e stakeholders.

## Melhores Práticas de Documentação Técnica

### 1. Foco no Público e Clareza
- **Vá Direto ao Ponto:** Elimine o excesso de palavras ("fluff"). As pessoas não leem manuais por lazer.
- **Estruturação por Escaneabilidade:** Utilize listas (bullet points), negrito em palavras-chave e cabeçalhos claros e descritivos.
- **Linguagem:** Mantenha um tom profissional, amigável e acessível. Evite jargões obscuros sem definição.

### 2. Formatação Eficiente (Markdown)
- **Code Blocks:** Forneça trechos de código executáveis sempre que possível com a linguagem correspondente explícita (p. ex., `bash`, `typescript`, `env`).
- **Comandos Passo a Passo:** Não deixe passos implícitos na hora de ensinar instalação. Numere tudo.
- **Tabelas e Visuais:** Utilize tabelas para listar descrições de colunas, variáveis de ambiente ou payloads de requisição.

### 3. Evite Vazamento de Segredos
- **Proteja Credentials:** Nunca faça commit de senhas reais, tokens JWT, chaves de API ou connection strings valiosas de produção em arquivos como `README.md` ou nos guias.
- **Placeholders Claros:** Substitua informações sensíveis por indicadores claros: `seu_token_aqui`, `[usuario]:[senha]`, `<API_KEY>`.

### 4. Exemplos Reais e Troubleshooting
- Forneça exemplos práticos de Input e Output de funções de API ou comportamentos esperados.
- Tenha uma seção de **Troubleshooting** para solucionar os erros conhecidos comuns durante a configuração.

### 5. Princípio da Informação Viva (Up-to-Date)
- A documentação deve evoluir com o código. Uma documentação desatualizada é mais perigosa do que a ausência de documentação.
- Ao trocar tecnologias base (p. ex., de banco de dados, provedores Cloud), faça uma busca (grep) varrendo todas as referências residuais da tecnologia antiga para manter coerência (como substituir as citações do Neon.tech para Supabase).
