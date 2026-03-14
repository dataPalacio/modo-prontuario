import { z } from 'zod'

export const procedimentoSchema = z.object({
  prontuarioId: z.string().cuid(),
  tipo: z.enum([
    'TOXINA_BOTULINICA',
    'PREENCHIMENTO_ACIDO_HIALURONICO',
    'BIOESTIMULADOR_COLAGENO',
    'FIOS_PDO',
    'RINOMODELACAO',
    'BICHECTOMIA',
    'LIPOFILLING_FACIAL',
    'PEELING_QUIMICO',
    'SKINBOOSTER',
    'MICROAGULHAMENTO',
    'OUTRO',
  ]),
  regiaoAnatomica: z.string().min(2, 'Informe a região anatômica'),
  produto: z.string().min(2, 'Informe o produto utilizado'),
  fabricante: z.string().optional(),
  lote: z.string().min(1, 'Número do lote é obrigatório (rastreabilidade)'),
  validadeProduto: z.string().datetime().or(z.date()).optional(),
  concentracao: z.string().optional(),
  volume: z.string().optional(),
  tecnica: z.string().optional(),
  observacoes: z.string().optional(),
})

export type ProcedimentoFormData = z.infer<typeof procedimentoSchema>
