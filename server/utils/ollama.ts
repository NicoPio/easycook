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
  private numPredict: number
  private defaultTemperature: number

  constructor(
    baseUrl: string = process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: string = process.env.OLLAMA_MODEL || 'mistral',
    timeout: number = parseInt(process.env.OLLAMA_TIMEOUT || '180000'), // 180 seconds (3 minutes)
    maxRetries: number = parseInt(process.env.OLLAMA_MAX_RETRIES || '3'),
    numPredict: number = parseInt(process.env.OLLAMA_NUM_PREDICT || '2048'), // Réduit de 4096 à 2048 pour compatibilité
    defaultTemperature: number = parseFloat(process.env.OLLAMA_TEMPERATURE || '0.1')
  ) {
    this.baseUrl = baseUrl
    this.model = model
    this.timeout = timeout
    this.maxRetries = maxRetries
    this.numPredict = numPredict
    this.defaultTemperature = defaultTemperature

    console.log('[Ollama] Configuration:', {
      baseUrl: this.baseUrl,
      model: this.model,
      timeout: `${this.timeout}ms`,
      maxRetries: this.maxRetries,
      numPredict: this.numPredict,
      defaultTemperature: this.defaultTemperature
    })

    // Avertissement si numPredict est trop élevé
    if (this.numPredict > 3000) {
      console.warn('[Ollama] ⚠️  ATTENTION: OLLAMA_NUM_PREDICT est élevé (' + this.numPredict + ')')
      console.warn('[Ollama] ⚠️  Certains modèles ont un contexte limité (ex: Lucie-7B = 2048 tokens max)')
      console.warn('[Ollama] ⚠️  Si vous rencontrez des erreurs 404 ou des crashes, réduisez cette valeur')
      console.warn('[Ollama] 💡 Recommandation: OLLAMA_NUM_PREDICT=1500 pour la plupart des modèles')
    }
  }

  /**
   * Generate text completion with Ollama
   * Implements retry logic with exponential backoff
   */
  async generate(prompt: string, options?: { temperature?: number }): Promise<string> {
    let lastError: Error | null = null

    // Log the model being used
    console.log(`[Ollama] Generating with model: ${this.model}`)
    console.log(`[Ollama] Prompt length: ${prompt.length} chars`)

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.timeout)

        const requestBody = {
          model: this.model,
          prompt,
          stream: false,
          options: {
            temperature: options?.temperature || this.defaultTemperature,
            num_predict: this.numPredict
          }
        } as OllamaGenerateRequest

        console.log(`[Ollama] Request attempt ${attempt}/${this.maxRetries}`, {
          model: requestBody.model,
          promptLength: prompt.length,
          options: requestBody.options
        })

        const response = await fetch(`${this.baseUrl}/api/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          // Try to get detailed error message from Ollama
          let errorDetails = response.statusText
          try {
            const errorBody = await response.json()
            errorDetails = errorBody.error || errorBody.message || response.statusText
            console.error(`[Ollama] Error details:`, errorBody)
          } catch (e) {
            // If JSON parsing fails, try text
            try {
              const errorText = await response.text()
              if (errorText) {
                errorDetails = errorText
                console.error(`[Ollama] Error text:`, errorText)
              }
            } catch (e2) {
              // Keep default statusText
            }
          }

          // Special handling for 404 - model not found OR context size issue
          if (response.status === 404) {
            console.error(`[Ollama] ❌ ERREUR 404: Deux causes possibles:`)
            console.error(`[Ollama]`)
            console.error(`[Ollama] 1️⃣ Le modèle "${this.model}" n'existe pas dans Ollama`)
            console.error(`[Ollama]    💡 Vérifiez: docker exec <container> ollama list`)
            console.error(`[Ollama]    💡 Script: bash scripts/diagnose-ollama-model.sh`)
            console.error(`[Ollama]`)
            console.error(`[Ollama] 2️⃣ OU le modèle crash (dépassement de capacité)`)
            console.error(`[Ollama]    💡 Certains modèles ont un contexte limité:`)
            console.error(`[Ollama]       • Lucie-7B: 2048 tokens max`)
            console.error(`[Ollama]       • Mistral: 8192 tokens`)
            console.error(`[Ollama]       • Qwen2.5: 32768 tokens`)
            console.error(`[Ollama]    💡 Votre config actuelle: OLLAMA_NUM_PREDICT=${this.numPredict}`)
            console.error(`[Ollama]    💡 Solution: Réduire à 1500 dans .env`)
            console.error(`[Ollama]       OLLAMA_NUM_PREDICT=1500`)
            console.error(`[Ollama]`)
            console.error(`[Ollama] 📖 Guide complet: docs/OLLAMA_TROUBLESHOOTING.md`)
          }

          throw new Error(`Ollama API error: ${response.status} ${errorDetails}`)
        }

        const data = (await response.json()) as OllamaGenerateResponse

        if (!data.response) {
          throw new Error('Empty response from Ollama')
        }

        return data.response
      } catch (error) {
        lastError = error as Error

        // Don't retry on abort (timeout) - if it times out once, it will likely timeout again
        if (error instanceof Error && error.name === 'AbortError') {
          console.error(`Ollama request timeout after ${this.timeout / 1000}s - model may be loading or generation is too slow`)
          console.error('💡 Tip: First request can take 60-120s to load the model into memory')
          throw createError({
            statusCode: 504,
            message: `Timeout après ${this.timeout / 1000} secondes. Le modèle met peut-être du temps à se charger (première requête).`
          })
        }

        console.error(`Ollama generation failed (attempt ${attempt}/${this.maxRetries}):`, error)

        // Wait before retry (exponential backoff: 1s, 2s, 4s)
        if (attempt < this.maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000
          await new Promise((resolve) => setTimeout(resolve, delay))
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
      console.log(`[Ollama] Checking availability at ${this.baseUrl}...`)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        console.log('[Ollama] ✓ Service is available')
        return true
      } else {
        console.error(`[Ollama] ✗ Service returned status ${response.status}`)
        return false
      }
    } catch (error) {
      console.error('[Ollama] ✗ Connection failed:', error instanceof Error ? error.message : 'Unknown error')
      console.error(`[Ollama] ✗ Unable to reach ${this.baseUrl}`)
      console.error('[Ollama] Please ensure:')
      console.error('  1. Docker container is running: docker ps | grep ollama')
      console.error('  2. Port 11434 is exposed: docker port <container-name>')
      console.error('  3. OLLAMA_BASE_URL in .env matches your setup')
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
