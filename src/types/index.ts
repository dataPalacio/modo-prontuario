// Types globais do Prontuário HOF
export type { PacienteFormData } from '@/lib/validations/paciente.schema'
export type { ProntuarioFormData, AnamneseFormData } from '@/lib/validations/prontuario.schema'
export type { ProcedimentoFormData } from '@/lib/validations/procedimento.schema'

// Re-export enums como constantes para uso no frontend
export const TIPO_CONSELHO = {
  CFM: 'CFM',
  CFO: 'CFO',
  CFBM: 'CFBM',
  CFF: 'CFF',
} as const

export const STATUS_PRONTUARIO = {
  ABERTO: 'ABERTO',
  EM_ANDAMENTO: 'EM_ANDAMENTO',
  ASSINADO: 'ASSINADO',
  ARQUIVADO: 'ARQUIVADO',
} as const

export const TIPO_PROCEDIMENTO = {
  TOXINA_BOTULINICA: 'Toxina Botulínica',
  PREENCHIMENTO_ACIDO_HIALURONICO: 'Preenchimento (Ácido Hialurônico)',
  BIOESTIMULADOR_COLAGENO: 'Bioestimulador de Colágeno',
  FIOS_PDO: 'Fios de PDO',
  RINOMODELACAO: 'Rinomodelação',
  BICHECTOMIA: 'Bichectomia',
  LIPOFILLING_FACIAL: 'Lipofilling Facial',
  PEELING_QUIMICO: 'Peeling Químico',
  SKINBOOSTER: 'Skinbooster',
  MICROAGULHAMENTO: 'Microagulhamento',
  OUTRO: 'Outro',
} as const

export const STATUS_LABELS: Record<string, string> = {
  ABERTO: 'Aberto',
  EM_ANDAMENTO: 'Em Andamento',
  ASSINADO: 'Assinado',
  ARQUIVADO: 'Arquivado',
}

export const SEXO_LABELS: Record<string, string> = {
  MASCULINO: 'Masculino',
  FEMININO: 'Feminino',
  OUTRO: 'Outro',
  NAO_INFORMADO: 'Não Informado',
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface SessionUser {
  id: string
  name: string
  email: string
  role: string
  clinicaId: string
  conselho: string
  numeroConselho: string
}
