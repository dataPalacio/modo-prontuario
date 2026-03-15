# Instalação de Dependências

Este projeto é desenvolvido com **Next.js** e **Node.js**. Embora um arquivo `requirements.txt` tenha sido criado para listar as bibliotecas, a forma padrão de gerenciar e instalar as dependências neste projeto é através do **npm** (Node Package Manager).

## Como baixar as bibliotecas

### 1. Usando npm (Recomendado)
Para baixar e instalar todas as bibliotecas necessárias listadas no `package.json`, execute o seguinte comando na raiz do projeto:

```bash
npm install
```

Este comando irá ler o arquivo `package.json`, baixar as versões corretas das bibliotecas e salvá-las na pasta `node_modules`.

### 2. Sobre o arquivo requirements.txt
O arquivo `requirements.txt` foi gerado apenas para referência de leitura, seguindo o padrão de formato `biblioteca==versão`. Ele contém tanto as dependências de produção quanto as de desenvolvimento.

**Nota:** O comando `pip install -r requirements.txt` (comum em Python) **não** funcionará para instalar estas bibliotecas Node.js. Use sempre o `npm install`.

## Comandos Adicionais
- `npm run dev`: Inicia o servidor de desenvolvimento.
- `npm run build`: Cria a versão de produção do aplicativo.
- `npm run start`: Inicia o servidor de produção.
