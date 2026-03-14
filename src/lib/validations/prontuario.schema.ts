import { z } from 'zod'

// Schema da anamnese (JSON)
export const anamneseSchema = z.object({
  dadosVitais: z.object({
    pressaoArterial: z.string().optional(),
    frequenciaCardiaca: z.string().optional(),
    peso: z.string().optional(),
    altura: z.string().optional(),
    imc: z.string().optional(),
  }),
  queixas: z.object({
    principal: z.string().min(1, 'Queixa principal é obrigatória'),
    expectativasPaciente: z.string().optional(),
    procedimentosAnteriores: z.array(z.string()).default([]),
  }),
  historicoMedico: z.object({
    doencasCronicas: z.array(z.string()).default([]),
    cirurgiasAnteriores: z.array(z.string()).default([]),
    hospitalizacoes: z.array(z.string()).default([]),
    alergias: z.object({
      medicamentos: z.array(z.string()).default([]),
      alimentos: z.array(z.string()).default([]),
      outros: z.array(z.string()).default([]),
    }),
    medicamentosEmUso: z
      .array(
        z.object({
          nome: z.string(),
          dose: z.string(),
          frequencia: z.string(),
          motivo: z.string().optional(),
        })
      )
      .default([]),
    anticoagulantes: z.boolean().default(false),
    isotretinoinaUltimos12Meses: z.boolean().default(false),
    queloidePredisposicao: z.boolean().default(false),
    autoimune: z.boolean().default(false),
    gestante: z.boolean().default(false),
    amamentando: z.boolean().default(false),
  }),
  historicoEstetico: z.object({
    toxinaBotulinicaAnterior: z.boolean().default(false),
    preenchimentoAnterior: z.boolean().default(false),
    produtoPermanenteAnterior: z.boolean().default(false),
    reacaoAdversaAnterior: z.boolean().default(false),
    descricaoReacaoAdversa: z.string().optional(),
  }),
  habitos: z.object({
    tabagismo: z.boolean().default(false),
    etilismo: z.boolean().default(false),
    exposicaoSolar: z.string().optional(),
    fotoprotecao: z.boolean().default(false),
    skincare: z.string().optional(),
  }),
  avaliacaoFacial: z.object({
    biotipo: z.string().optional(),
    fototipo: z.string().optional(),
    espessuraPele: z.string().optional(),
    tonicidade: z.string().optional(),
    sulcos: z.array(z.string()).default([]),
    assimetrias: z.array(z.string()).default([]),
    observacoesGerais: z.string().optional(),
  }),
})

// Schema principal do prontuário
export const prontuarioSchema = z.object({
  pacienteId: z.string().cuid(),
  dataAtendimento: z.string().datetime().or(z.date()),
  queixaPrincipal: z.string().min(5, 'Descreva a queixa principal'),
  anamnese: anamneseSchema.optional(),
  avaliacaoFacial: z
    .object({
      tercosProporcionais: z.boolean().optional(),
      simetria: z.string().optional(),
      observacoes: z.string().optional(),
    })
    .optional(),
})

export type ProntuarioFormData = z.infer<typeof prontuarioSchema>
export type AnamneseFormData = z.infer<typeof anamneseSchema>
