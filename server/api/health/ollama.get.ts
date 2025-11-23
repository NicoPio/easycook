import { ollama } from '~/server/utils/ollama'

/**
 * Public health check endpoint for Ollama service
 * Accessible without authentication for diagnostic purposes
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
          '1. Verify Docker container is running:',
          '   docker ps | grep ollama',
          '',
          '2. Check port mapping:',
          '   docker port easycook-ollama',
          '',
          '3. Test connectivity from host:',
          '   curl http://localhost:11434/api/tags',
          '',
          '4. Test from inside container:',
          '   docker exec easycook-ollama curl http://localhost:11434/api/tags',
          '',
          '5. Check if port is listening:',
          '   lsof -i :11434',
          '',
          '6. Restart container:',
          '   docker-compose restart ollama',
        ],
      }
    }

    // Get list of models
    const models = await ollama.listModels()
    const requiredModel = process.env.OLLAMA_MODEL || 'mistral'

    // Check exact match first, then partial match
    const exactMatch = models.some((m) => m === requiredModel || m === `${requiredModel}:latest`)
    const partialMatch = models.find((m) => m.includes(requiredModel))
    const hasRequiredModel = exactMatch

    return {
      status: hasRequiredModel ? 'healthy' : 'model_missing',
      healthy: hasRequiredModel,
      message: hasRequiredModel
        ? `✅ Ollama is healthy and ready with model "${requiredModel}"`
        : partialMatch
        ? `⚠️ Model "${requiredModel}" not found - Did you mean "${partialMatch}"?`
        : `❌ Model "${requiredModel}" not found`,
      details: {
        baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        model: requiredModel,
        availableModels: models,
        exactMatch,
        partialMatch: partialMatch || null,
        responseTime: Date.now() - startTime,
      },
      troubleshooting: hasRequiredModel
        ? []
        : partialMatch
        ? [
            `🔧 The model name doesn't match exactly.`,
            ``,
            `Your OLLAMA_MODEL: "${requiredModel}"`,
            `Closest match found: "${partialMatch}"`,
            ``,
            `Solution 1: Update .env to use the exact name:`,
            `  OLLAMA_MODEL=${partialMatch}`,
            ``,
            `Solution 2: Create an alias (if needed):`,
            `  docker exec easycook-ollama ollama cp ${partialMatch} ${requiredModel}`,
          ]
        : [
            `❌ Model "${requiredModel}" not found in Ollama`,
            ``,
            `Available models: ${models.join(', ') || 'none'}`,
            ``,
            `Solution 1: Pull the required model:`,
            `  docker exec easycook-ollama ollama pull ${requiredModel}`,
            ``,
            `Solution 2: Use an available model by updating OLLAMA_MODEL in .env`,
            ``,
            `Solution 3: Run the diagnostic script:`,
            `  bash scripts/diagnose-ollama-model.sh`,
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
        error: error instanceof Error ? error.stack : String(error),
      },
      troubleshooting: [
        'Check server logs for detailed error information',
        'Verify Docker container is running and accessible',
        'Ensure network connectivity to Ollama',
      ],
    }
  }
})
