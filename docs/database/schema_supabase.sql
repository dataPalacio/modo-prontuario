-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "TipoConselho" AS ENUM ('CFM', 'CFO', 'CFBM', 'CFF');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PROFISSIONAL', 'RECEPCIONISTA');

-- CreateEnum
CREATE TYPE "Plano" AS ENUM ('FREE', 'BASIC', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "Sexo" AS ENUM ('MASCULINO', 'FEMININO', 'OUTRO', 'NAO_INFORMADO');

-- CreateEnum
CREATE TYPE "StatusProntuario" AS ENUM ('ABERTO', 'EM_ANDAMENTO', 'ASSINADO', 'ARQUIVADO');

-- CreateEnum
CREATE TYPE "TipoProcedimento" AS ENUM ('TOXINA_BOTULINICA', 'PREENCHIMENTO_ACIDO_HIALURONICO', 'BIOESTIMULADOR_COLAGENO', 'FIOS_PDO', 'RINOMODELACAO', 'BICHECTOMIA', 'LIPOFILLING_FACIAL', 'PEELING_QUIMICO', 'SKINBOOSTER', 'MICROAGULHAMENTO', 'OUTRO');

-- CreateEnum
CREATE TYPE "TipoFoto" AS ENUM ('ANTES', 'DEPOIS', 'INTRAOPERATORIO', 'RETORNO');

-- CreateTable
CREATE TABLE "clinicas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT,
    "endereco" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "logo" TEXT,
    "plano" "Plano" NOT NULL DEFAULT 'FREE',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profissionais" (
    "id" TEXT NOT NULL,
    "clinica_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "conselho" "TipoConselho" NOT NULL,
    "numero_conselho" TEXT NOT NULL,
    "uf" TEXT NOT NULL,
    "especialidade" TEXT,
    "assinatura_url" TEXT,
    "role" "Role" NOT NULL DEFAULT 'PROFISSIONAL',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profissionais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacientes" (
    "id" TEXT NOT NULL,
    "clinica_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "data_nasc" TIMESTAMP(3) NOT NULL,
    "sexo" "Sexo" NOT NULL,
    "email" TEXT,
    "telefone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "endereco" JSONB,
    "foto_url" TEXT,
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prontuarios" (
    "id" TEXT NOT NULL,
    "clinica_id" TEXT NOT NULL,
    "paciente_id" TEXT NOT NULL,
    "profissional_id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "data_atendimento" TIMESTAMP(3) NOT NULL,
    "queixa_principal" TEXT NOT NULL,
    "anamnese" JSONB,
    "avaliacao_facial" JSONB,
    "status" "StatusProntuario" NOT NULL DEFAULT 'ABERTO',
    "assinado_por" TEXT,
    "assinado_em" TIMESTAMP(3),
    "hash_integridade" TEXT,
    "pdf_url" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prontuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedimentos" (
    "id" TEXT NOT NULL,
    "prontuario_id" TEXT NOT NULL,
    "tipo" "TipoProcedimento" NOT NULL,
    "regiao_anatomica" TEXT NOT NULL,
    "produto" TEXT NOT NULL,
    "fabricante" TEXT,
    "lote" TEXT NOT NULL,
    "validade_produto" TIMESTAMP(3),
    "concentracao" TEXT,
    "volume" TEXT,
    "tecnica" TEXT,
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "procedimentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evolucoes" (
    "id" TEXT NOT NULL,
    "prontuario_id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "descricao" TEXT NOT NULL,
    "satisfacao_paciente" INTEGER,
    "retorno_necessario" BOOLEAN NOT NULL DEFAULT false,
    "data_retorno" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evolucoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fotos_clinicas" (
    "id" TEXT NOT NULL,
    "prontuario_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tipo" "TipoFoto" NOT NULL,
    "angulo" TEXT,
    "descricao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fotos_clinicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tcles" (
    "id" TEXT NOT NULL,
    "prontuario_id" TEXT NOT NULL,
    "paciente_id" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "assinatura_url" TEXT,
    "ip_assinatura" TEXT,
    "user_agent" TEXT,
    "assinado_em" TIMESTAMP(3),
    "versao" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tcles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "clinica_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidade_id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "user_agent" TEXT,
    "dados" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clinicas_cnpj_key" ON "clinicas"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "profissionais_email_key" ON "profissionais"("email");

-- CreateIndex
CREATE INDEX "pacientes_clinica_id_idx" ON "pacientes"("clinica_id");

-- CreateIndex
CREATE INDEX "pacientes_nome_idx" ON "pacientes"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "pacientes_clinica_id_cpf_key" ON "pacientes"("clinica_id", "cpf");

-- CreateIndex
CREATE UNIQUE INDEX "prontuarios_numero_key" ON "prontuarios"("numero");

-- CreateIndex
CREATE INDEX "prontuarios_clinica_id_idx" ON "prontuarios"("clinica_id");

-- CreateIndex
CREATE INDEX "prontuarios_paciente_id_idx" ON "prontuarios"("paciente_id");

-- CreateIndex
CREATE INDEX "prontuarios_data_atendimento_idx" ON "prontuarios"("data_atendimento" DESC);

-- CreateIndex
CREATE INDEX "procedimentos_prontuario_id_idx" ON "procedimentos"("prontuario_id");

-- CreateIndex
CREATE INDEX "evolucoes_prontuario_id_idx" ON "evolucoes"("prontuario_id");

-- CreateIndex
CREATE INDEX "fotos_clinicas_prontuario_id_idx" ON "fotos_clinicas"("prontuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "tcles_prontuario_id_key" ON "tcles"("prontuario_id");

-- CreateIndex
CREATE INDEX "audit_logs_clinica_id_idx" ON "audit_logs"("clinica_id");

-- CreateIndex
CREATE INDEX "audit_logs_entidade_entidade_id_idx" ON "audit_logs"("entidade", "entidade_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "profissionais" ADD CONSTRAINT "profissionais_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pacientes" ADD CONSTRAINT "pacientes_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prontuarios" ADD CONSTRAINT "prontuarios_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prontuarios" ADD CONSTRAINT "prontuarios_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prontuarios" ADD CONSTRAINT "prontuarios_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "profissionais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedimentos" ADD CONSTRAINT "procedimentos_prontuario_id_fkey" FOREIGN KEY ("prontuario_id") REFERENCES "prontuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evolucoes" ADD CONSTRAINT "evolucoes_prontuario_id_fkey" FOREIGN KEY ("prontuario_id") REFERENCES "prontuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fotos_clinicas" ADD CONSTRAINT "fotos_clinicas_prontuario_id_fkey" FOREIGN KEY ("prontuario_id") REFERENCES "prontuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tcles" ADD CONSTRAINT "tcles_prontuario_id_fkey" FOREIGN KEY ("prontuario_id") REFERENCES "prontuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tcles" ADD CONSTRAINT "tcles_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profissionais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

