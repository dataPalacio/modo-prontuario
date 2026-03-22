import { Page, BrowserContext } from '@playwright/test'
import * as path from 'path'

const STORAGE_STATE = path.join(__dirname, '../storage/auth.json')

/**
 * Realiza login via UI usando credenciais de variáveis de ambiente.
 * A senha nunca é logada — page.fill não registra o valor.
 */
export async function loginViaUI(page: Page): Promise<void> {
  const email = process.env.TEST_EMAIL
  const password = process.env.TEST_PASSWORD

  if (!email || !password) {
    throw new Error(
      'TEST_EMAIL e TEST_PASSWORD devem estar definidos nas variáveis de ambiente.\n' +
        'Copie .env.test.example para .env.test e preencha os valores.'
    )
  }

  await page.goto('/login?callbackUrl=%2Fdashboard')
  await page.waitForLoadState('networkidle')

  await page.fill('[data-testid="email-input"]', email)
  await page.fill('[data-testid="password-input"]', password)
  await page.click('[data-testid="login-submit"]')

  // Aguarda o redirect para o dashboard
  await page.waitForURL('**/dashboard', { timeout: 15_000 })
}

/**
 * Salva o storageState após login para reutilização entre testes.
 * Reduz o número de logins necessários.
 */
export async function saveStorageState(context: BrowserContext): Promise<void> {
  await context.storageState({ path: STORAGE_STATE })
}

/**
 * Verifica se o storageState existe e está válido (não expirado).
 */
export function storageStatePath(): string {
  return STORAGE_STATE
}
