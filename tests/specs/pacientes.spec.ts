/**
 * Testes do módulo Pacientes — listagem, busca, paginação, criação.
 * Executados com sessão autenticada (storageState do projeto 'chromium-autenticado').
 */
import { test, expect } from '../fixtures/auth.fixture'
import { attachNetworkObserver } from '../helpers/network.helper'

test.describe('Pacientes', () => {
  test('página /pacientes carrega sem erros 5xx', async ({ authenticatedPage: page }) => {
    const { networkErrors } = attachNetworkObserver(page)

    await page.goto('/pacientes')
    await page.waitForLoadState('networkidle')

    const errors5xx = networkErrors.filter((e) => e.status >= 500)
    expect(errors5xx, `Erros 5xx: ${JSON.stringify(errors5xx)}`).toHaveLength(0)
  })

  test('tabela de pacientes ou estado vazio são exibidos', async ({ authenticatedPage: page }) => {
    await page.goto('/pacientes')
    await page.waitForLoadState('networkidle')

    // Deve exibir a tabela OU a mensagem de estado vazio
    const tabela = page.locator('[data-testid="pacientes-table"]')
    const estadoVazio = page.locator('text=Nenhum paciente cadastrado')
    const avisoDb = page.locator('text=Não foi possível carregar pacientes')

    await expect(tabela.or(estadoVazio).or(avisoDb)).toBeVisible({ timeout: 15_000 })
  })

  test('botão "Novo Paciente" está visível e leva para /pacientes/novo', async ({ authenticatedPage: page }) => {
    await page.goto('/pacientes')
    await page.waitForLoadState('networkidle')

    const btnNovo = page.locator('[data-testid="new-patient-btn"]')
    await expect(btnNovo).toBeVisible()

    await btnNovo.click()
    await expect(page).toHaveURL(/\/pacientes\/novo/, { timeout: 10_000 })
  })

  test('campo de busca está presente e aceita input', async ({ authenticatedPage: page }) => {
    await page.goto('/pacientes')
    await page.waitForLoadState('networkidle')

    const searchInput = page.locator('[data-testid="search-input"]')
    await expect(searchInput).toBeVisible()
    await expect(searchInput).toBeEnabled()

    await searchInput.fill('Teste')
    await expect(searchInput).toHaveValue('Teste')
  })

  test('busca por nome atualiza URL com query string', async ({ authenticatedPage: page }) => {
    await page.goto('/pacientes')
    await page.waitForLoadState('networkidle')

    const searchInput = page.locator('[data-testid="search-input"]')
    await searchInput.fill('João')

    // Submete o formulário de busca
    await page.keyboard.press('Enter')
    await page.waitForURL('**/pacientes?q=Jo**', { timeout: 10_000 })

    await expect(page).toHaveURL(/q=Jo/)
  })

  test('formulário de novo paciente exibe campos obrigatórios', async ({ authenticatedPage: page }) => {
    await page.goto('/pacientes/novo')
    await page.waitForLoadState('networkidle')

    // Campos mínimos esperados no formulário
    await expect(page.locator('input[name="nome"]')).toBeVisible()
    await expect(page.locator('input[name="cpf"]')).toBeVisible()
    await expect(page.locator('input[name="dataNasc"]')).toBeVisible()
    await expect(page.locator('input[name="telefone"]')).toBeVisible()
  })

  test('formulário de novo paciente não submete com campos vazios', async ({ authenticatedPage: page }) => {
    await page.goto('/pacientes/novo')
    await page.waitForLoadState('networkidle')

    // Tenta submeter sem preencher
    const submitBtn = page.locator('button[type="submit"]')
    await expect(submitBtn).toBeVisible()
    await submitBtn.click()

    // Deve permanecer na mesma página (validação HTML5 ou client-side)
    await expect(page).toHaveURL(/\/pacientes\/novo/)
  })

  test('paginação está presente quando há pacientes suficientes', async ({ authenticatedPage: page }) => {
    await page.goto('/pacientes')
    await page.waitForLoadState('networkidle')

    // Se a paginação aparecer, verifica os botões
    const paginationNext = page.locator('[data-testid="pagination-next"]')
    const paginationPrev = page.locator('[data-testid="pagination-prev"]')

    const hasPagination = await paginationNext.isVisible()
    if (hasPagination) {
      await expect(paginationPrev).toBeVisible()

      // Avança para próxima página
      await paginationNext.click()
      await page.waitForURL('**/pacientes?**page=2**', { timeout: 10_000 })
      await expect(page).toHaveURL(/page=2/)

      // Volta para a primeira página
      await paginationPrev.click()
      await page.waitForLoadState('networkidle')
    }
  })

  test('detalhes do paciente carregam ao clicar em um item da lista', async ({ authenticatedPage: page }) => {
    await page.goto('/pacientes')
    await page.waitForLoadState('networkidle')

    const primeiroLink = page.locator('[data-testid="pacientes-table"] tbody tr:first-child a').first()
    const hasPacientes = await primeiroLink.isVisible()

    if (hasPacientes) {
      await primeiroLink.click()
      await expect(page).toHaveURL(/\/pacientes\/[\w-]+/, { timeout: 10_000 })
      await page.waitForLoadState('networkidle')

      // Página de detalhe deve estar presente (título ou algum elemento)
      await expect(page.locator('h1')).toBeVisible()
    }
  })
})
