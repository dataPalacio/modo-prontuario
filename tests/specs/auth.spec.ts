/**
 * Testes de autenticação — login, acesso protegido, mensagens de erro.
 * Executados sem storageState (projeto 'chromium-auth').
 */
import { test, expect } from '@playwright/test'
import { attachNetworkObserver } from '../helpers/network.helper'

test.describe('Autenticação', () => {
  test('login válido redireciona para /dashboard', async ({ page }) => {
    const { networkErrors, consoleErrors } = attachNetworkObserver(page)

    await page.goto('/login?callbackUrl=%2Fdashboard')
    await page.waitForLoadState('networkidle')

    await page.fill('[data-testid="email-input"]', process.env.TEST_EMAIL!)
    await page.fill('[data-testid="password-input"]', process.env.TEST_PASSWORD!)
    await page.click('[data-testid="login-submit"]')

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 })

    // Verifica ausência de erros críticos
    const criticalNetworkErrors = networkErrors.filter((e) => e.status >= 500)
    expect(criticalNetworkErrors, `Erros 5xx: ${JSON.stringify(criticalNetworkErrors)}`).toHaveLength(0)

    const pageErrors = consoleErrors.filter((e) => e.type === 'pageerror')
    expect(pageErrors, `Erros de página: ${JSON.stringify(pageErrors)}`).toHaveLength(0)
  })

  test('credenciais inválidas exibem mensagem de erro', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    await page.fill('[data-testid="email-input"]', 'invalido@teste.com')
    await page.fill('[data-testid="password-input"]', 'senhaerrada')
    await page.click('[data-testid="login-submit"]')

    // Aguarda a mensagem de erro aparecer
    await expect(page.locator('[data-testid="login-error"]')).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('[data-testid="login-error"]')).toContainText('inválidos')

    // Deve permanecer na página de login
    await expect(page).toHaveURL(/\/login/)
  })

  test('acesso direto a /dashboard sem sessão redireciona para /login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })

  test('acesso direto a /pacientes sem sessão redireciona para /login', async ({ page }) => {
    await page.goto('/pacientes')
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })

  test('acesso direto a /prontuarios sem sessão redireciona para /login', async ({ page }) => {
    await page.goto('/prontuarios')
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })

  test('página de login exibe elementos essenciais', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="login-submit"]')).toBeVisible()
    await expect(page.locator('[data-testid="login-submit"]')).toBeEnabled()
  })
})
