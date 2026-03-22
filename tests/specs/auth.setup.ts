/**
 * Setup de autenticação — executado UMA vez antes dos testes autenticados.
 * Realiza login via UI e salva o storageState para reutilização.
 */
import { test as setup, expect } from '@playwright/test'
import { loginViaUI, saveStorageState } from '../helpers/login.helper'

setup('autenticar e salvar sessão', async ({ page }) => {
  await loginViaUI(page)

  // Confirma que o dashboard carregou
  await expect(page).toHaveURL(/\/dashboard/)

  // Salva a sessão para os demais testes
  await saveStorageState(page.context())
})
