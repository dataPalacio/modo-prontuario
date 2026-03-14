import { z } from 'zod'

export const pacienteSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  cpf: z
    .string()
    .length(11, 'CPF deve conter 11 dígitos')
    .regex(/^\d{11}$/, 'CPF deve conter apenas números'),
  dataNasc: z.string().datetime().or(z.date()),
  sexo: z.enum(['MASCULINO', 'FEMININO', 'OUTRO', 'NAO_INFORMADO']),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  telefone: z
    .string()
    .min(10, 'Telefone inválido')
    .max(11, 'Telefone inválido')
    .regex(/^\d+$/, 'Telefone deve conter apenas números'),
  whatsapp: z.string().optional(),
  endereco: z
    .object({
      logradouro: z.string(),
      numero: z.string(),
      complemento: z.string().optional(),
      bairro: z.string(),
      cidade: z.string(),
      uf: z.string().length(2),
      cep: z.string().length(8),
    })
    .optional(),
  fotoUrl: z.string().url().optional(),
  observacoes: z.string().optional(),
})

export type PacienteFormData = z.infer<typeof pacienteSchema>
