#!/bin/bash

echo "🔍 EasyCook Ollama Diagnostic Tool"
echo "===================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    exit 1
fi

echo "✓ Docker is installed"

# Check if Ollama container is running
echo ""
echo "📦 Checking Docker containers..."
if docker ps --format '{{.Names}}' | grep -q ollama; then
    CONTAINER_NAME=$(docker ps --format '{{.Names}}' | grep ollama | head -1)
    echo "✓ Ollama container is running: $CONTAINER_NAME"

    # Check port mapping
    echo ""
    echo "🔌 Port mapping:"
    docker port "$CONTAINER_NAME"

    # Check if port 11434 is exposed
    if docker port "$CONTAINER_NAME" | grep -q "11434"; then
        echo "✓ Port 11434 is exposed"
    else
        echo "❌ Port 11434 is NOT exposed"
        echo "   Fix: Update docker-compose.yml to expose port 11434"
    fi
else
    echo "❌ No Ollama container is running"
    echo ""
    echo "To start Ollama, run:"
    echo "  docker-compose up -d ollama"
    exit 1
fi

# Test connectivity to Ollama API
echo ""
echo "🌐 Testing connectivity to Ollama API..."
if curl -s -f http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✓ Ollama API is accessible at http://localhost:11434"
else
    echo "❌ Cannot reach Ollama API at http://localhost:11434"
    echo ""
    echo "Troubleshooting steps:"
    echo "1. Check if the container is healthy:"
    echo "   docker ps | grep ollama"
    echo "2. Check container logs:"
    echo "   docker logs $CONTAINER_NAME"
    echo "3. Try restarting the container:"
    echo "   docker restart $CONTAINER_NAME"
    exit 1
fi

# List available models
echo ""
echo "📚 Available models:"
MODELS=$(curl -s http://localhost:11434/api/tags | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
if [ -z "$MODELS" ]; then
    echo "❌ No models found"
    echo ""
    echo "To pull the Mistral model, run:"
    echo "  docker exec $CONTAINER_NAME ollama pull mistral"
else
    echo "$MODELS"

    # Check if mistral is available
    if echo "$MODELS" | grep -q "mistral"; then
        echo "✓ Mistral model is available"
    else
        echo "⚠️  Mistral model not found"
        echo ""
        echo "To pull the Mistral model, run:"
        echo "  docker exec $CONTAINER_NAME ollama pull mistral"
    fi
fi

# Check .env file
echo ""
echo "⚙️  Configuration (.env):"
if [ -f .env ]; then
    echo "✓ .env file exists"
    if grep -q "OLLAMA_BASE_URL" .env; then
        OLLAMA_URL=$(grep "OLLAMA_BASE_URL" .env | cut -d'=' -f2)
        echo "  OLLAMA_BASE_URL=$OLLAMA_URL"
    else
        echo "⚠️  OLLAMA_BASE_URL not set in .env"
    fi
    if grep -q "OLLAMA_MODEL" .env; then
        OLLAMA_MODEL=$(grep "OLLAMA_MODEL" .env | cut -d'=' -f2)
        echo "  OLLAMA_MODEL=$OLLAMA_MODEL"
    else
        echo "⚠️  OLLAMA_MODEL not set in .env"
    fi
else
    echo "⚠️  .env file not found"
    echo "  Copy .env.example to .env and configure it"
fi

echo ""
echo "===================================="
echo "✅ Diagnostic complete!"
echo ""
echo "If all checks passed, Ollama should be ready to use."
echo "Start your dev server with: npm run dev"
