#!/bin/bash

set -e

OLLAMA_HOST="${OLLAMA_HOST:-http://localhost:11434}"
MODEL="${OLLAMA_MODEL:-mistral}"
MAX_RETRIES=30
RETRY_DELAY=5

echo "🚀 Initialisation d'Ollama..."
echo "Host: $OLLAMA_HOST"
echo "Modèle à télécharger: $MODEL"

wait_for_ollama() {
    local retries=0

    echo "⏳ Attente du démarrage d'Ollama..."

    while [ $retries -lt $MAX_RETRIES ]; do
        if curl -s "$OLLAMA_HOST/api/tags" > /dev/null 2>&1; then
            echo "✅ Ollama est prêt!"
            return 0
        fi

        retries=$((retries + 1))
        echo "Tentative $retries/$MAX_RETRIES - Nouvelle tentative dans ${RETRY_DELAY}s..."
        sleep $RETRY_DELAY
    done

    echo "❌ Impossible de se connecter à Ollama après $MAX_RETRIES tentatives"
    return 1
}

pull_model() {
    echo "📥 Téléchargement du modèle $MODEL..."

    if docker exec easycook-ollama ollama list | grep -q "$MODEL"; then
        echo "✅ Le modèle $MODEL est déjà installé"
        return 0
    fi

    docker exec easycook-ollama ollama pull "$MODEL"

    if [ $? -eq 0 ]; then
        echo "✅ Modèle $MODEL téléchargé avec succès!"
        return 0
    else
        echo "❌ Échec du téléchargement du modèle $MODEL"
        return 1
    fi
}

if wait_for_ollama; then
    pull_model
    echo "🎉 Initialisation terminée!"
else
    echo "❌ Échec de l'initialisation"
    exit 1
fi
