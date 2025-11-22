import { ollama } from '~/server/utils/ollama'

/**
 * Health check endpoint for Ollama service
 * Returns detailed status information to help debug connectivity issues
 */
export default defineEventHandler(async (event) => {
  const startTime = Date.now()

  try {
    // Check if Ollama is available
    const isAvailable = await ollama.isAvailable()

    if (!isAvailable) {
      return {
        status: 'unavailable',
        healthy: false,
        message: 'Ollama service is not reachable',
        details: {
          baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
          model: process.env.OLLAMA_MODEL || 'mistral',
          responseTime: Date.now() - startTime,
        },
        troubleshooting: [
          'Verify Docker container is running: docker ps | grep ollama',
          'Check port mapping: docker port easycook-ollama',
          'Test connectivity: curl http://localhost:11434/api/tags',
          'Ensure OLLAMA_BASE_URL in .env is correct',
        ],
      }
    }

    // Get list of models
    const models = await ollama.listModels()
    const requiredModel = process.env.OLLAMA_MODEL || 'mistral'
    const hasRequiredModel = models.some((m) => m.includes(requiredModel))

    return {
      status: hasRequiredModel ? 'healthy' : 'model_missing',
      healthy: hasRequiredModel,
      message: hasRequiredModel
        ? 'Ollama is healthy and ready'
        : `Model "${requiredModel}" not found`,
      details: {
        baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        model: requiredModel,
        availableModels: models,
        responseTime: Date.now() - startTime,
      },
      troubleshooting: hasRequiredModel
        ? []
        : [
            `Pull the required model: docker exec easycook-ollama ollama pull ${requiredModel}`,
            'Or use an available model by updating OLLAMA_MODEL in .env',
          ],
    }
  } catch (error) {
    return {
      status: 'error',
      healthy: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      details: {
        baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        model: process.env.OLLAMA_MODEL || 'mistral',
        responseTime: Date.now() - startTime,
      },
      troubleshooting: [
        'Check server logs for detailed error information',
        'Verify Docker container is running',
        'Ensure network connectivity to Ollama',
      ],
    }
  }
})
