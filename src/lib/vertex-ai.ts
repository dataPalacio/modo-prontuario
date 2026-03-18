// =============================================================================
// Prontuário HOF — Cliente Vertex AI (Gemini)
// Usa service account via GOOGLE_APPLICATION_CREDENTIALS_B64 (base64 do JSON)
// Fallback seguro: nunca lança erro — retorna mensagem de indisponibilidade
// Timeout de 30 segundos
// =============================================================================

const FALLBACK_MESSAGE =
  'Assistente IA temporariamente indisponível. Por favor, preencha manualmente.'

interface ServiceAccountCredentials {
  type: string
  project_id: string
  private_key_id: string
  private_key: string
  client_email: string
  client_id: string
  token_uri: string
}

interface VertexAICandidate {
  content?: {
    parts?: Array<{ text?: string }>
  }
}

interface VertexAIResponse {
  candidates?: VertexAICandidate[]
}

/**
 * Gera um JWT assinado com a service account para autenticação no Google APIs.
 * Usa a Web Crypto API disponível no Node.js 18+ e no Edge Runtime.
 */
async function getAccessToken(credentials: ServiceAccountCredentials): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: credentials.client_email,
    sub: credentials.client_email,
    aud: credentials.token_uri,
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
  }

  // Codificar header e payload em base64url
  const encode = (obj: unknown) =>
    Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')

  const header = encode({ alg: 'RS256', typ: 'JWT' })
  const body = encode(payload)
  const signingInput = `${header}.${body}`

  // Importar chave privada PEM
  const pemContents = credentials.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\n/g, '')

  const keyData = Buffer.from(pemContents, 'base64')

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyData,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    Buffer.from(signingInput)
  )

  const signatureB64 = Buffer.from(signature)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  const jwt = `${signingInput}.${signatureB64}`

  // Trocar JWT por access token OAuth2
  const tokenResponse = await fetch(credentials.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
    signal: AbortSignal.timeout(15_000),
  })

  if (!tokenResponse.ok) {
    throw new Error(`Falha ao obter access token: ${tokenResponse.status}`)
  }

  const tokenData = (await tokenResponse.json()) as { access_token: string }
  return tokenData.access_token
}

export class VertexAIClient {
  private projectId: string
  private location: string
  private model: string

  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || ''
    this.location = process.env.VERTEX_AI_LOCATION || 'us-central1'
    this.model = 'gemini-1.5-flash'
  }

  /**
   * Gera conteúdo usando Gemini via Vertex AI.
   * Retorna string vazia em caso de erro — NUNCA lança exceção.
   */
  async generateContent(prompt: string): Promise<string> {
    try {
      const credentialsB64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_B64
      if (!credentialsB64 || !this.projectId) {
        console.warn('[VertexAI] Credenciais não configuradas — retornando fallback')
        return FALLBACK_MESSAGE
      }

      const credentialsJson = Buffer.from(credentialsB64, 'base64').toString('utf8')
      const credentials: ServiceAccountCredentials = JSON.parse(credentialsJson)

      const accessToken = await getAccessToken(credentials)

      const endpoint =
        `https://${this.location}-aiplatform.googleapis.com/v1` +
        `/projects/${this.projectId}/locations/${this.location}` +
        `/publishers/google/models/${this.model}:generateContent`

      const requestBody = {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_ONLY_HIGH',
          },
        ],
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(30_000),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[VertexAI] Resposta de erro:', response.status, errorText)
        return FALLBACK_MESSAGE
      }

      const data: VertexAIResponse = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!text) {
        console.warn('[VertexAI] Resposta sem conteúdo de texto')
        return FALLBACK_MESSAGE
      }

      return text
    } catch (error) {
      console.error('[VertexAI] Erro ao gerar conteúdo:', error)
      return FALLBACK_MESSAGE
    }
  }
}

// Singleton para reutilizar entre requests no mesmo processo
const globalForVertex = globalThis as unknown as {
  vertexAIClient: VertexAIClient | undefined
}

export const vertexAI =
  globalForVertex.vertexAIClient ?? new VertexAIClient()

if (process.env.NODE_ENV !== 'production') {
  globalForVertex.vertexAIClient = vertexAI
}
