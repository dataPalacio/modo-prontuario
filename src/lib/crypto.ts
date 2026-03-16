// =============================================================================
// Prontuário HOF — Criptografia AES-256-GCM
// Protege dados sensíveis (CPF) em repouso conforme LGPD.
//
// ⚠️  Variável de ambiente obrigatória:
//     AES_SECRET_KEY=<64 caracteres hex>
//     Gerar com: openssl rand -hex 32
// =============================================================================

import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_BYTES = 16   // 128 bits
const KEY_BYTES = 32  // 256 bits = 64 hex chars

function getKey(): Buffer {
  const hex = process.env.AES_SECRET_KEY
  if (!hex || hex.length !== KEY_BYTES * 2) {
    throw new Error(
      'AES_SECRET_KEY inválida — deve ser uma string hex de 64 caracteres. ' +
      'Gere com: openssl rand -hex 32'
    )
  }
  return Buffer.from(hex, 'hex')
}

/**
 * Encripta uma string com AES-256-GCM.
 * Retorna: "<iv_hex>:<authTag_hex>:<ciphertext_hex>"
 *
 * Cada chamada gera um IV aleatório, tornando o resultado não-determinístico.
 * Para busca por CPF use hashCPF() (SHA-256 HMAC determinístico).
 */
export function encrypt(plaintext: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(IV_BYTES)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  let ciphertext = cipher.update(plaintext, 'utf8', 'hex')
  ciphertext += cipher.final('hex')

  const authTag = cipher.getAuthTag()

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${ciphertext}`
}

/**
 * Decripta uma string produzida por encrypt().
 * Valida autenticidade via GCM auth tag — detecta adulteração.
 */
export function decrypt(ciphertext: string): string {
  const key = getKey()
  const parts = ciphertext.split(':')

  if (parts.length !== 3) {
    throw new Error('Formato inválido de ciphertext. Esperado: iv:authTag:dados')
  }

  const [ivHex, authTagHex, data] = parts
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  let plaintext = decipher.update(data, 'hex', 'utf8')
  plaintext += decipher.final('utf8')

  return plaintext
}

/**
 * Gera hash HMAC-SHA256 determinístico para indexação e busca.
 * Use para criar o campo cpfHash no banco (permite busca sem descriptografar).
 *
 * Usa HMAC (não SHA puro) para evitar rainbow-table attacks.
 */
export function hashCPF(cpf: string): string {
  const key = process.env.AES_SECRET_KEY || 'fallback-dev-key-never-use-in-prod'
  return crypto.createHmac('sha256', key).update(cpf).digest('hex')
}

/**
 * Gera hash SHA-256 genérico (ex: hash de integridade de prontuário).
 */
export function sha256(data: string): string {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex')
}
