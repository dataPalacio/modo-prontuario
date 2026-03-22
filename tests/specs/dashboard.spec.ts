/**
 * Testes do Dashboard — estrutura, navegação, ausência de erros.
 * Executados com sessão autenticada (storageState do projeto 'chromium-autenticado').
 */
import { test, expect } from '../fixtures/auth.fixture'
import { attachNetworkObserver } from '../helpers/network.helper'

test.describe('Dashboard', () => {
  test('carrega sem erros de console ou requests 5xx', async ({ authenticatedPage: page }) => {
    const { networkErrors, consoleErrors } = attachNetworkObserver(page)

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const errors5xx = networkErrors.filter((e) => e.status >= 500)
    expect(errors5xx, `Erros 5xx: ${JSON.stringify(errors5xx)}`).toHaveLength(0)

    const pageErrors = consoleErrors.filter((e) => e.type === 'pageerror')
    expect(pageErrors, `Erros de página: ${JSON.stringify(pageErrors)}`).toHaveLength(0)
  })

  test('sidebar está presente com links de navegação principais', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible()
    await expect(page.locator('[data-testid="sidebar-nav"]')).toBeVisible()

    // Verifica links principais
    await expect(page.locator('[data-testid="nav-item-dashboard"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-item-pacientes"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-item-prontuarios"]')).toBeVisible()
  })

  test('header está presente com campo de busca', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('[data-testid="header"]')).toBeVisible()
    await expect(page.locator('[data-testid="header-search-input"]')).toBeVisible()
  })

  test('stats do dashboard são exibidas (ou skeleton visível durante carregamento)', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard')

    // Aguarda o carregamento terminar (stats ou esqueletos)
    await page.waitForLoadState('networkidle')

    // Verifica se a seção de stats existe
    await expect(page.locator('[data-testid="dashboard-stats"]')).toBeVisible()
  })

  test('cards de stats aparecem após carregamento da API', async ({ authenticatedPage: page }) => {
    const { networkErrors } = attachNetworkObserver(page)

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Aguarda os stat-cards aparecerem (ou estado de "sem dados")
    await page.waitForSelector('[data-testid="stat-card"], [data-testid="dashboard-stats"]', {
      timeout: 15_000,
    })

    // API de stats não deve retornar erro 4xx/5xx
    const statsErrors = networkErrors.filter((e) => e.url.includes('/api/dashboard/stats'))
    expect(statsErrors, `Erros na API de stats: ${JSON.stringify(statsErrors)}`).toHaveLength(0)
  })

  test('navegar para /pacientes pelo menu lateral', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    await page.click('[data-testid="nav-item-pacientes"]')
    await expect(page).toHaveURL(/\/pacientes/, { timeout: 10_000 })
  })

  test('navegar para /prontuarios pelo menu lateral', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    await page.click('[data-testid="nav-item-prontuarios"]')
    await expect(page).toHaveURL(/\/prontuarios/, { timeout: 10_000 })
  })

  test('botão "Novo Paciente" leva para /pacientes/novo', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    await page.click('a[href="/pacientes/novo"]')
    await expect(page).toHaveURL(/\/pacientes\/novo/, { timeout: 10_000 })
  })

  test('botão "Novo Prontuário" leva para /prontuarios/novo', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    await page.click('a[href="/prontuarios/novo"]')
    await expect(page).toHaveURL(/\/prontuarios\/novo/, { timeout: 10_000 })
  })
})
