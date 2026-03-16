import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Carrega .env e depois .env.local (override) para funcionar tanto em dev quanto em CI
loadEnv();
loadEnv({ path: ".env.local", override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    // Comandos CLI (push, migrate, seed, studio) exigem conexão direta (sem pgbouncer).
    // DIRECT_URL usa porta 5432; DATABASE_URL usa o pooler (porta 6543) — apenas para runtime.
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
