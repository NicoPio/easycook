/**
 * Ollama client utility for AI-powered recipe parsing
 *
 * FR-024: Le système DOIT utiliser un modèle d'IA pour structurer le texte importé
 * FR-031: Le système DOIT implémenter une logique de retry (max 3 tentatives, timeout 30s)
 */

interface OllamaGenerateRequest {
  model: string
  prompt: string
  stream?: boolean
  options?: {
    temperature?: number
    num_predict?: number
  }
}

interface OllamaGenerateResponse {
  model: string
  created_at: string
  response: string
  done: boolean
  context?: number[]
  total_duration?: number
  load_duration?: number
  prompt_eval_count?: number
  eval_count?: number
  eval_duration?: number
}

export class OllamaClient {
  private baseUrl: string
  private model: string
  private timeout: number
  private maxRetries: number

  constructor(
    baseUrl: string = process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: string = process.env.OLLAMA_MODEL || 'mistral',
    timeout: number = 30000, // 30 seconds
    maxRetries: number = 3
  ) {
    this.baseUrl = baseUrl
    this.model = model
    this.timeout = timeout
    this.maxRetries = maxRetries
  }

  /**
   * Generate text completion with Ollama
   * Implements retry logic with exponential backoff
   */
  async generate(prompt: string, options?: { temperature?: number }): Promise<string> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.timeout)

        const response = await fetch(`${this.baseUrl}/api/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: this.model,
            prompt,
            stream: false,
            options: {
              temperature: options?.temperature || 0.1, // Low temperature for deterministic parsing
              num_predict: 4096 // Max tokens
            }
          } as OllamaGenerateRequest),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
        }

        const data = (await response.json()) as OllamaGenerateResponse

        if (!data.response) {
          throw new Error('Empty response from Ollama')
        }

        return data.response
      } catch (error) {
        lastError = error as Error

        // Don't retry on abort (timeout)
        if (error instanceof Error && error.name === 'AbortError') {
          console.error(`Ollama request timeout (attempt ${attempt}/${this.maxRetries})`)
        } else {
          console.error(`Ollama generation failed (attempt ${attempt}/${this.maxRetries}):`, error)
        }

        // Wait before retry (exponential backoff: 1s, 2s, 4s)
        if (attempt < this.maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    // All retries failed
    throw createError({
      statusCode: 503,
      message: `Échec de la génération après ${this.maxRetries} tentatives: ${lastError?.message || 'Erreur inconnue'}`
    })
  }

  /**
   * Check if Ollama is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * Get list of available models
   */
  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`)

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`)
      }

      const data = await response.json()
      return data.models?.map((m: any) => m.name) || []
    } catch (error) {
      console.error('Failed to list Ollama models:', error)
      return []
    }
  }
}

// Export singleton instance
export const ollama = new OllamaClient()
