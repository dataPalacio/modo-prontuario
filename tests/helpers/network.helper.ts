import { Page } from '@playwright/test'

export interface NetworkError {
  url: string
  status: number
  method: string
}

export interface ConsoleError {
  type: string
  text: string
}

/**
 * Registra erros de rede (4xx/5xx) e erros de console durante o teste.
 * Use attachNetworkObserver() no início do teste e acesse os arrays para assertions.
 *
 * @example
 * const { networkErrors, consoleErrors } = attachNetworkObserver(page)
 * // ... interagir com a página ...
 * expect(networkErrors).toHaveLength(0)
 * expect(consoleErrors).toHaveLength(0)
 */
export function attachNetworkObserver(page: Page): {
  networkErrors: NetworkError[]
  consoleErrors: ConsoleError[]
} {
  const networkErrors: NetworkError[] = []
  const consoleErrors: ConsoleError[] = []

  // Captura requests com status >= 400
  page.on('response', (response) => {
    if (response.status() >= 400) {
      // Ignora erros esperados (ex.: 401 em fluxo de logout, 404 em assets opcionais)
      const ignored = [
        '/_next/static/',
        '/favicon',
        '/__nextjs_original-stack-frame',
      ]
      const url = response.url()
      if (!ignored.some((i) => url.includes(i))) {
        networkErrors.push({
          url,
          status: response.status(),
          method: response.request().method(),
        })
      }
    }
  })

  // Captura erros e warnings do console
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      const text = msg.text()
      // Ignora mensagens conhecidas de dev do Next.js
      const ignoredPatterns = [
        'Warning: ReactDOM.render',
        'Download the React DevTools',
        '[Fast Refresh]',
        'webpack-hmr',
      ]
      if (!ignoredPatterns.some((p) => text.includes(p))) {
        consoleErrors.push({ type: msg.type(), text })
      }
    }
  })

  // Captura exceções não tratadas na página
  page.on('pageerror', (error) => {
    consoleErrors.push({ type: 'pageerror', text: error.message })
  })

  return { networkErrors, consoleErrors }
}
