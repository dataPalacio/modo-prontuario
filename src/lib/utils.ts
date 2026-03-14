import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Combina classes CSS do Tailwind de forma inteligente
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata data para o padrão brasileiro
 */
export function formatDate(date: string | Date, pattern = 'dd/MM/yyyy') {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, pattern, { locale: ptBR })
}

/**
 * Formata data com hora
 */
export function formatDateTime(date: string | Date) {
  return formatDate(date, "dd/MM/yyyy 'às' HH:mm")
}

/**
 * Formata CPF: 123.456.789-00
 */
export function formatCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, '')
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

/**
 * Formata telefone: (11) 99999-9999
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
}

/**
 * Gera número de prontuário sequencial
 */
export function gerarNumeroProntuario(sequencia: number): string {
  const ano = new Date().getFullYear()
  return `P-${ano}-${String(sequencia).padStart(4, '0')}`
}

/**
 * Calcula idade a partir da data de nascimento
 */
export function calcularIdade(dataNasc: Date | string): number {
  const nascimento = typeof dataNasc === 'string' ? parseISO(dataNasc) : dataNasc
  const hoje = new Date()
  let idade = hoje.getFullYear() - nascimento.getFullYear()
  const mesAtual = hoje.getMonth()
  const mesNasc = nascimento.getMonth()
  if (mesAtual < mesNasc || (mesAtual === mesNasc && hoje.getDate() < nascimento.getDate())) {
    idade--
  }
  return idade
}

/**
 * Valida CPF brasileiro
 */
export function validarCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return false
  if (/^(\d)\1+$/.test(digits)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(digits.charAt(i)) * (10 - i)
  let remainder = 11 - (sum % 11)
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(digits.charAt(9))) return false

  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(digits.charAt(i)) * (11 - i)
  remainder = 11 - (sum % 11)
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(digits.charAt(10))) return false

  return true
}

/**
 * Gera hash SHA-256 para integridade de prontuário
 */
export async function generateHash(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}
