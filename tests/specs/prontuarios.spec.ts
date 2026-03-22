/**
 * Testes do módulo Prontuários — listagem, filtros, criação multi-step, detalhes.
 * Executados com sessão autenticada (storageState do projeto 'chromium-autenticado').
 */
import { test, expect } from '../fixtures/auth.fixture'
import { attachNetworkObserver } from '../helpers/network.helper'

test.describe('Prontuários', () => {
  test('página /prontuarios carrega sem erros 5xx', async ({ authenticatedPage: page }) => {
    const { networkErrors } = attachNetworkObserver(page)

    await page.goto('/prontuarios')
    await page.waitForLoadState('networkidle')

    const errors5xx = networkErrors.filter((e) => e.status >= 500)
    expect(errors5xx, `Erros 5xx: ${JSON.stringify(errors5xx)}`).toHaveLength(0)
  })

  test('tabela de prontuários ou estado vazio são exibidos', async ({ authenticatedPage: page }) => {
    await page.goto('/prontuarios')
    await page.waitForLoadState('networkidle')

    const tabela = page.locator('[data-testid="prontuarios-table"]')
    const estadoVazio = page.locator('text=Nenhum prontuário registrado')

    await expect(tabela.or(estadoVazio)).toBeVisible({ timeout: 15_000 })
  })

  test('botão "Novo Prontuário" está visível', async ({ authenticatedPage: page }) => {
    await page.goto('/prontuarios')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('[data-testid="new-prontuario-btn"]')).toBeVisible()
  })

  test('filtros de status estão presentes', async ({ authenticatedPage: page }) => {
    await page.goto('/prontuarios')
    await page.waitForLoadState('networkidle')

    for (const status of ['TODOS', 'ABERTO', 'EM_ANDAMENTO', 'ASSINADO', 'ARQUIVADO']) {
      await expect(page.locator(`[data-testid="status-filter-${status}"]`)).toBeVisible()
    }
  })

  test('filtro por status ABERTO atualiza URL', async ({ authenticatedPage: page }) => {
    await page.goto('/prontuarios')
    await page.waitForLoadState('networkidle')

    await page.click('[data-testid="status-filter-ABERTO"]')
    await page.waitForURL('**/prontuarios?**status=ABERTO**', { timeout: 10_000 })

    await expect(page).toHaveURL(/status=ABERTO/)
    await page.waitForLoadState('networkidle')

    // Tabela ou estado vazio permanecem visíveis com o filtro
    const tabela = page.locator('[data-testid="prontuarios-table"]')
    const estadoVazio = page.locator('text=Nenhum prontuário encontrado')
    await expect(tabela.or(estadoVazio)).toBeVisible({ timeout: 10_000 })
  })

  test('filtro TODOS remove filtro de status da URL', async ({ authenticatedPage: page }) => {
    await page.goto('/prontuarios?status=ABERTO')
    await page.waitForLoadState('networkidle')

    await page.click('[data-testid="status-filter-TODOS"]')
    await page.waitForURL('**/prontuarios', { timeout: 10_000 })

    // URL não deve conter status
    expect(page.url()).not.toContain('status=')
  })

  test('formulário de novo prontuário carrega etapa 1', async ({ authenticatedPage: page }) => {
    const { networkErrors } = attachNetworkObserver(page)

    await page.goto('/prontuarios/novo')
    await page.waitForLoadState('networkidle')

    // Etapa 1 deve estar visível
    await expect(page.locator('h1, h2').first()).toBeVisible()

    const errors5xx = networkErrors.filter((e) => e.status >= 500)
    expect(errors5xx, `Erros 5xx na criação: ${JSON.stringify(errors5xx)}`).toHaveLength(0)
  })

  test('detalhes do prontuário carregam sem erros', async ({ authenticatedPage: page }) => {
    const { networkErrors } = attachNetworkObserver(page)

    // Primeiro, obtém um ID de prontuário da lista
    await page.goto('/prontuarios')
    await page.waitForLoadState('networkidle')

    const linkProntuario = page.locator('[data-testid="prontuarios-table"] tbody tr:first-child a').first()
    const temProntuarios = await linkProntuario.isVisible()

    if (temProntuarios) {
      await linkProntuario.click()
      await page.waitForLoadState('networkidle')

      await expect(page).toHaveURL(/\/prontuarios\/[\w-]+/)

      const errors5xx = networkErrors.filter((e) => e.status >= 500)
      expect(errors5xx, `Erros 5xx no detalhe: ${JSON.stringify(errors5xx)}`).toHaveLength(0)

      // Verifica presença de elementos do detalhe
      await expect(page.locator('h1, h2').first()).toBeVisible()
    }
  })

  test('busca por número ou paciente atualiza URL', async ({ authenticatedPage: page }) => {
    await page.goto('/prontuarios')
    await page.waitForLoadState('networkidle')

    const searchInput = page.locator('input[name="q"]')
    await expect(searchInput).toBeVisible()

    await searchInput.fill('P-2025')
    await page.keyboard.press('Enter')
    await page.waitForURL('**/prontuarios?q=P-2025**', { timeout: 10_000 })

    await expect(page).toHaveURL(/q=P-2025/)
  })

  test('paginação funciona quando há mais de 15 prontuários', async ({ authenticatedPage: page }) => {
    await page.goto('/prontuarios')
    await page.waitForLoadState('networkidle')

    const paginationNext = page.locator('a:has-text("Próxima")')
    const hasPagination = await paginationNext.isVisible()

    if (hasPagination) {
      await paginationNext.click()
      await page.waitForURL('**/prontuarios?**page=2**', { timeout: 10_000 })
      await expect(page).toHaveURL(/page=2/)
    }
  })
})
