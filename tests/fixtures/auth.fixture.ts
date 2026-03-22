import { test as base, Page } from '@playwright/test'
import { loginViaUI, saveStorageState } from '../helpers/login.helper'

type AuthFixtures = {
  authenticatedPage: Page
}

/**
 * Fixture que fornece uma página já autenticada.
 * O storageState é carregado via playwright.config.ts (projeto 'chromium-autenticado').
 * Use este fixture em todos os testes que requerem sessão.
 */
export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // O storageState já foi carregado pelo projeto 'chromium-autenticado'
    // Navega para o dashboard para confirmar a sessão ativa
    await page.goto('/dashboard')

    // Se for redirecionado para login, a sessão expirou — refaz o login
    if (page.url().includes('/login')) {
      await loginViaUI(page)
      await saveStorageState(page.context())
    }

    await use(page)
  },
})

export { expect } from '@playwright/test'
