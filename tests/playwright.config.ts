import { defineConfig, devices } from '@playwright/test'
import * as path from 'path'

// Caminho do storageState para sessão autenticada
export const STORAGE_STATE = path.join(__dirname, 'storage/auth.json')

export default defineConfig({
  testDir: './specs',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 2,
  timeout: 30_000,

  expect: {
    timeout: 10_000,
  },

  reporter: [
    ['html', { outputFolder: '../playwright-report', open: 'never' }],
    ['junit', { outputFile: '../test-results/junit.xml' }],
    ['list'],
  ],

  use: {
    baseURL:
      process.env.BASE_URL ||
      'https://modo-prontuario-htt1ojxj4-gfpalacioeng-7351s-projects.vercel.app',

    // Captura em falha
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'on-first-retry',

    // Locale
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',

    // Headers para evitar throttling em staging
    extraHTTPHeaders: {
      'x-playwright': '1',
    },
  },

  projects: [
    // --- Setup: realiza login e salva storageState ---
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },

    // --- Testes autenticados (dependem do setup) ---
    {
      name: 'chromium-autenticado',
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE,
      },
      dependencies: ['setup'],
      testIgnore: /auth\.setup\.ts/,
      testMatch: /\.(dashboard|pacientes|prontuarios)\.spec\.ts/,
    },

    // --- Testes de auth (sem sessão pré-carregada) ---
    {
      name: 'chromium-auth',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /auth\.spec\.ts/,
    },
  ],

  outputDir: '../test-results/artifacts',
})
