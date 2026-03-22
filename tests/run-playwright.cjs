const path = require('path')

// Mantem o comportamento local previsivel: se nao vier do ambiente/CI,
// carrega .env.test por padrao para execucoes E2E.
if (!process.env.DOTENV_CONFIG_PATH) {
  process.env.DOTENV_CONFIG_PATH = path.resolve(__dirname, '../.env.test')
}

require('dotenv/config')
require('@playwright/test/cli')
